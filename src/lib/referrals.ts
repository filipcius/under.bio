import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasBlack } from "@/lib/plan";

export const REFERRAL_GOAL = 10;
export const REFERRAL_REWARD_DAYS = 14;
export const INVITE_COOKIE = "ub_invite";
export const INVITE_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeInviteCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length < 4 || code.length > 12) return null;
  return code;
}

export function generateInviteCode(length = 8): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return out;
}

export async function ensureInviteCode(profileId: string): Promise<string> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("profiles")
    .select("invite_code")
    .eq("id", profileId)
    .maybeSingle();

  const current = (existing as { invite_code?: string | null } | null)?.invite_code;
  if (current) return current;

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateInviteCode(8);
    const { data, error } = await admin
      .from("profiles")
      .update({ invite_code: code })
      .eq("id", profileId)
      .is("invite_code", null)
      .select("invite_code")
      .maybeSingle();

    if (!error && data && (data as { invite_code: string }).invite_code) {
      return (data as { invite_code: string }).invite_code;
    }

    const { data: again } = await admin
      .from("profiles")
      .select("invite_code")
      .eq("id", profileId)
      .maybeSingle();
    const got = (again as { invite_code?: string | null } | null)?.invite_code;
    if (got) return got;
  }

  throw new Error("Could not allocate invite code");
}

/** Extend / grant VOID without touching Stripe ids. */
export async function grantVoidDays(profileId: string, days: number): Promise<string> {
  const admin = createAdminClient();
  const grantDays = Math.min(90, Math.max(1, Math.floor(days)));

  const { data: current } = await admin
    .from("profiles")
    .select("plan, plan_status, plan_period_end")
    .eq("id", profileId)
    .maybeSingle();

  const row = current as {
    plan?: string | null;
    plan_status?: string | null;
    plan_period_end?: string | null;
  } | null;

  const existingEnd = row?.plan_period_end ? new Date(row.plan_period_end).getTime() : 0;
  const activeNow = hasBlack(row?.plan, row?.plan_status, row?.plan_period_end);
  const from = Math.max(Date.now(), activeNow && Number.isFinite(existingEnd) ? existingEnd : 0);
  const periodEnd = new Date(from + grantDays * 24 * 60 * 60 * 1000).toISOString();

  await admin
    .from("profiles")
    .update({
      plan: "black",
      plan_status: "active",
      plan_period_end: periodEnd,
    })
    .eq("id", profileId);

  return periodEnd;
}

/**
 * Attribute a brand-new signup to an invite code.
 * Safe to call only when the invitee profile was just created.
 */
export async function attributeReferral(input: {
  inviteeId: string;
  code: string | null | undefined;
}): Promise<{ ok: boolean; reason?: string }> {
  const code = normalizeInviteCode(input.code);
  if (!code) return { ok: false, reason: "no_code" };

  const admin = createAdminClient();

  const { data: inviter } = await admin
    .from("profiles")
    .select("id, invite_code")
    .eq("invite_code", code)
    .maybeSingle();

  const inviterRow = inviter as { id: string; invite_code: string } | null;
  if (!inviterRow) return { ok: false, reason: "invalid_code" };
  if (inviterRow.id === input.inviteeId) return { ok: false, reason: "self" };

  const { data: invitee } = await admin
    .from("profiles")
    .select("id, referred_by, created_at")
    .eq("id", input.inviteeId)
    .maybeSingle();

  const inviteeRow = invitee as {
    id: string;
    referred_by?: string | null;
    created_at?: string;
  } | null;
  if (!inviteeRow) return { ok: false, reason: "missing_invitee" };
  if (inviteeRow.referred_by) return { ok: false, reason: "already_referred" };

  // Only brand-new accounts (created in the last 15 minutes)
  const created = inviteeRow.created_at ? new Date(inviteeRow.created_at).getTime() : 0;
  if (!created || Date.now() - created > 15 * 60 * 1000) {
    return { ok: false, reason: "not_new" };
  }

  const { error: attrError } = await admin.from("referral_attributions").insert({
    inviter_id: inviterRow.id,
    invitee_id: input.inviteeId,
    invite_code: code,
  });

  if (attrError) {
    // unique violation = already attributed
    return { ok: false, reason: "duplicate" };
  }

  await admin
    .from("profiles")
    .update({ referred_by: inviterRow.id })
    .eq("id", input.inviteeId)
    .is("referred_by", null);

  await maybeGrantReferralReward(inviterRow.id);
  return { ok: true };
}

export async function maybeGrantReferralReward(inviterId: string): Promise<boolean> {
  const admin = createAdminClient();

  const [{ count }, { data: profile }] = await Promise.all([
    admin
      .from("referral_attributions")
      .select("id", { count: "exact", head: true })
      .eq("inviter_id", inviterId),
    admin
      .from("profiles")
      .select("referral_rewards_claimed")
      .eq("id", inviterId)
      .maybeSingle(),
  ]);

  const qualified = count ?? 0;
  const claimed =
    (profile as { referral_rewards_claimed?: number } | null)?.referral_rewards_claimed ?? 0;
  const milestonesEarned = Math.floor(qualified / REFERRAL_GOAL);

  if (milestonesEarned <= claimed) return false;

  // Grant each missing milestone (usually one)
  for (let m = claimed + 1; m <= milestonesEarned; m++) {
    const periodEnd = await grantVoidDays(inviterId, REFERRAL_REWARD_DAYS);
    const { error } = await admin.from("referral_rewards").insert({
      inviter_id: inviterId,
      milestone: m * REFERRAL_GOAL,
      days_granted: REFERRAL_REWARD_DAYS,
      period_end: periodEnd,
    });
    if (error) {
      // unique = already granted this milestone
      continue;
    }
    await admin
      .from("profiles")
      .update({ referral_rewards_claimed: m })
      .eq("id", inviterId);
  }

  return true;
}

export type InviteDashboard = {
  code: string;
  sharePath: string;
  shareUrl: string;
  qualified: number;
  progress: number;
  goal: number;
  rewardsClaimed: number;
  nextRewardAt: number;
  rewardDays: number;
  recent: {
    id: string;
    slug: string | null;
    name: string | null;
    avatar: string | null;
    at: string;
  }[];
};

function siteOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://under.bio";
  return raw.replace(/\/$/, "").startsWith("http")
    ? raw.replace(/\/$/, "")
    : `https://${raw.replace(/\/$/, "")}`;
}

export async function getInviteDashboard(profileId: string): Promise<InviteDashboard> {
  const admin = createAdminClient();
  const code = await ensureInviteCode(profileId);

  const [{ count }, { data: profile }, { data: rows }] = await Promise.all([
    admin
      .from("referral_attributions")
      .select("id", { count: "exact", head: true })
      .eq("inviter_id", profileId),
    admin
      .from("profiles")
      .select("referral_rewards_claimed")
      .eq("id", profileId)
      .maybeSingle(),
    admin
      .from("referral_attributions")
      .select("invitee_id, created_at")
      .eq("inviter_id", profileId)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const qualified = count ?? 0;
  const rewardsClaimed =
    (profile as { referral_rewards_claimed?: number } | null)?.referral_rewards_claimed ?? 0;

  const inviteeIds = ((rows || []) as { invitee_id: string; created_at: string }[]).map(
    (r) => r.invitee_id,
  );

  let people: InviteDashboard["recent"] = [];
  if (inviteeIds.length) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, slug, global_name, username, avatar_url")
      .in("id", inviteeIds);

    const map = new Map(
      ((profiles || []) as {
        id: string;
        slug: string;
        global_name: string | null;
        username: string;
        avatar_url: string | null;
      }[]).map((p) => [p.id, p]),
    );

    people = ((rows || []) as { invitee_id: string; created_at: string }[]).map((r) => {
      const p = map.get(r.invitee_id);
      return {
        id: r.invitee_id,
        slug: p?.slug ?? null,
        name: p?.global_name || p?.username || null,
        avatar: p?.avatar_url ?? null,
        at: r.created_at,
      };
    });
  }

  const sharePath = `/i/${code}`;
  return {
    code,
    sharePath,
    shareUrl: `${siteOrigin()}${sharePath}`,
    qualified,
    progress: qualified % REFERRAL_GOAL,
    goal: REFERRAL_GOAL,
    rewardsClaimed,
    nextRewardAt: (rewardsClaimed + 1) * REFERRAL_GOAL,
    rewardDays: REFERRAL_REWARD_DAYS,
    recent: people,
  };
}

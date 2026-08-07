import { timingSafeEqual } from "node:crypto";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminDiscordId } from "@/lib/admin-ids";
import { OWNER_DISCORD_IDS } from "@/lib/socials";

export { isAdminDiscordId } from "@/lib/admin-ids";

const OWNER_LIST = [...OWNER_DISCORD_IDS] as string[];

function safeEqualStr(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

function isOwnerSafe(discordId: string) {
  return OWNER_LIST.some((id) => safeEqualStr(discordId, id));
}

/** Log denied admin probes without leaking details to the client */
function denyAdmin(reason: string, meta?: Record<string, string>) {
  console.warn("[admin:deny]", reason, meta ?? {});
  notFound();
}

/**
 * Hard admin gate:
 * 1) must be signed in
 * 2) JWT discord id must be an owner
 * 3) fresh DB row for this profile must still match that Discord id
 * 4) DB discord id must still be an owner (revocation-safe)
 * Non-admins get a generic 404 — panel does not exist for them.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.profileId || !session.user.discordId) {
    redirect("/login?next=/admin");
  }

  const jwtDiscord = session.user.discordId;
  if (!isOwnerSafe(jwtDiscord)) {
    denyAdmin("jwt_not_owner", { discordId: jwtDiscord.slice(0, 6) });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, discord_id, slug")
    .eq("id", session.user.profileId)
    .maybeSingle();

  if (error || !data) {
    denyAdmin("profile_missing");
  }

  const row = data as { id: string; discord_id: string; slug: string };
  if (!safeEqualStr(row.discord_id, jwtDiscord)) {
    denyAdmin("jwt_db_mismatch");
  }
  if (!isOwnerSafe(row.discord_id)) {
    denyAdmin("db_not_owner");
  }

  return {
    ...session,
    user: {
      ...session.user,
      discordId: row.discord_id,
      profileId: row.id,
      slug: row.slug,
    },
  };
}

export async function writeAdminAudit(input: {
  actorProfileId: string;
  actorDiscordId: string;
  action: string;
  targetProfileId?: string | null;
  meta?: Record<string, unknown>;
}) {
  try {
    const admin = createAdminClient();
    await admin.from("admin_audit_log").insert({
      actor_profile_id: input.actorProfileId,
      actor_discord_id: input.actorDiscordId,
      action: input.action,
      target_profile_id: input.targetProfileId ?? null,
      meta: input.meta ?? {},
    });
  } catch {
    // table may not exist yet — never block admin on audit failure
  }
  console.info("[admin:audit]", {
    action: input.action,
    actor: input.actorDiscordId,
    target: input.targetProfileId,
  });
}

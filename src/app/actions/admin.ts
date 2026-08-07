"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminDiscordId, requireAdmin, writeAdminAudit } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_PROFILE_TEMPLATE,
  mergeTemplate,
  parseProfileTemplate,
} from "@/lib/profile-template";
import { slugify } from "@/lib/utils";
import { rateLimit } from "@/lib/security";

export type AdminActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

const profileIdSchema = z.string().uuid();
const planSchema = z.enum(["free", "black"]);
const viewsSchema = z.number().int().min(0).max(1_000_000_000);
const slugSchema = z
  .string()
  .min(3)
  .max(25)
  .regex(/^[a-z0-9]([a-z0-9_-]{1,23}[a-z0-9])?$/);

const reserved = new Set([
  "api",
  "login",
  "dashboard",
  "admin",
  "black",
  "shop",
  "auth",
  "terms",
  "privacy",
  "faq",
  "templates",
]);

const MAX_CONFIG_CHARS = 400_000;

async function guard(kind: "read" | "write" | "danger" = "write") {
  const session = await requireAdmin();
  const limit = kind === "danger" ? 8 : kind === "write" ? 40 : 80;
  const limited = rateLimit(
    `admin:${kind}:${session.user.profileId}`,
    limit,
    60_000,
  );
  if (!limited.ok) {
    throw new Error(`Slow down. Try again in ${limited.retryAfterSec}s.`);
  }
  // belt-and-suspenders: re-check owner set every action
  if (!isAdminDiscordId(session.user.discordId)) {
    throw new Error("Forbidden.");
  }
  return session;
}

function parseId(profileId: string) {
  const parsed = profileIdSchema.safeParse(profileId);
  if (!parsed.success) return null;
  return parsed.data;
}

export async function adminSetPublished(
  profileId: string,
  published: boolean,
): Promise<AdminActionResult> {
  try {
    const session = await guard("write");
    const id = parseId(profileId);
    if (id == null) return { ok: false, error: "Invalid id." };
    if (typeof published !== "boolean") return { ok: false, error: "Invalid." };

    const admin = createAdminClient();
    const { error, count } = await admin
      .from("pages")
      .update({ published }, { count: "exact" })
      .eq("profile_id", id);
    if (error) return { ok: false, error: "Update failed." };
    if (!count) return { ok: false, error: "Page not found." };

    await writeAdminAudit({
      actorProfileId: session.user.profileId,
      actorDiscordId: session.user.discordId,
      action: published ? "publish" : "unpublish",
      targetProfileId: id,
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/users/${id}`);
    return { ok: true, message: published ? "Published." : "Unpublished." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed." };
  }
}

export async function adminSetPlan(
  profileId: string,
  plan: "free" | "black",
  days = 30,
): Promise<AdminActionResult> {
  try {
    const session = await guard("write");
    const id = parseId(profileId);
    if (id == null) return { ok: false, error: "Invalid id." };
    const planParsed = planSchema.safeParse(plan);
    if (!planParsed.success) return { ok: false, error: "Invalid plan." };
    const grantDays = Math.min(365, Math.max(1, Math.floor(days || 30)));

    const admin = createAdminClient();

    let periodEnd: string | null = null;
    if (planParsed.data === "black") {
      const { data: current } = await admin
        .from("profiles")
        .select("plan_period_end")
        .eq("id", id)
        .maybeSingle();
      const existing = (current as { plan_period_end?: string | null } | null)
        ?.plan_period_end;
      const base = existing ? new Date(existing).getTime() : 0;
      const from = Math.max(Date.now(), Number.isFinite(base) ? base : 0);
      periodEnd = new Date(from + grantDays * 24 * 60 * 60 * 1000).toISOString();
    }

    const { error, count } = await admin
      .from("profiles")
      .update(
        {
          plan: planParsed.data,
          plan_status: planParsed.data === "black" ? "active" : "inactive",
          plan_period_end: periodEnd,
        },
        { count: "exact" },
      )
      .eq("id", id);
    if (error) return { ok: false, error: "Update failed." };
    if (!count) return { ok: false, error: "User not found." };

    await writeAdminAudit({
      actorProfileId: session.user.profileId,
      actorDiscordId: session.user.discordId,
      action: planParsed.data === "black" ? "grant_void_month" : "revoke_void",
      targetProfileId: id,
      meta:
        planParsed.data === "black"
          ? { days: grantDays, periodEnd }
          : undefined,
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/users/${id}`);
    return {
      ok: true,
      message:
        planParsed.data === "black"
          ? `Granted VOID for ${grantDays} days (until ${new Date(periodEnd!).toLocaleDateString()}).`
          : "Set to Free.",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed." };
  }
}

export async function adminUpdateSlug(
  profileId: string,
  rawSlug: string,
): Promise<AdminActionResult> {
  try {
    const session = await guard("write");
    const id = parseId(profileId);
    if (id == null) return { ok: false, error: "Invalid id." };

    const slug = slugify(String(rawSlug || ""));
    const parsed = slugSchema.safeParse(slug);
    if (!parsed.success) return { ok: false, error: "Invalid slug format." };
    if (reserved.has(slug)) return { ok: false, error: "Slug is reserved." };

    const admin = createAdminClient();
    const { data: taken } = await admin
      .from("profiles")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();
    if (taken) return { ok: false, error: "Slug already taken." };

    const { error, count } = await admin
      .from("profiles")
      .update({ slug }, { count: "exact" })
      .eq("id", id);
    if (error) return { ok: false, error: "Update failed." };
    if (!count) return { ok: false, error: "User not found." };

    const { data: page } = await admin
      .from("pages")
      .select("id, config")
      .eq("profile_id", id)
      .maybeSingle();

    if (page) {
      const row = page as { id: string; config: Record<string, unknown> };
      const config = mergeTemplate(DEFAULT_PROFILE_TEMPLATE, row.config ?? {});
      config.meta.slug = slug;
      await admin.from("pages").update({ config }).eq("id", row.id);
    }

    await writeAdminAudit({
      actorProfileId: session.user.profileId,
      actorDiscordId: session.user.discordId,
      action: "update_slug",
      targetProfileId: id,
      meta: { slug },
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/users/${id}`);
    revalidatePath(`/${slug}`);
    return { ok: true, message: "Slug updated." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed." };
  }
}

export async function adminSaveConfig(
  profileId: string,
  rawJson: string,
): Promise<AdminActionResult> {
  try {
    const session = await guard("write");
    const id = parseId(profileId);
    if (id == null) return { ok: false, error: "Invalid id." };
    if (typeof rawJson !== "string" || rawJson.length > MAX_CONFIG_CHARS) {
      return { ok: false, error: "Config too large or invalid." };
    }

    let json: unknown;
    try {
      json = JSON.parse(rawJson);
    } catch {
      return { ok: false, error: "Invalid JSON." };
    }
    const parsed = parseProfileTemplate(json);
    if (!parsed.success) {
      return { ok: false, error: "JSON does not match template." };
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("slug")
      .eq("id", id)
      .maybeSingle();
    const slug = (profile as { slug?: string } | null)?.slug;
    if (!slug) return { ok: false, error: "User not found." };

    parsed.data.meta.slug = slug;
    const { error, count } = await admin
      .from("pages")
      .update({ config: parsed.data }, { count: "exact" })
      .eq("profile_id", id);
    if (error) return { ok: false, error: "Save failed." };
    if (!count) return { ok: false, error: "Page not found." };

    await writeAdminAudit({
      actorProfileId: session.user.profileId,
      actorDiscordId: session.user.discordId,
      action: "save_config",
      targetProfileId: id,
    });

    revalidatePath(`/admin/users/${id}`);
    revalidatePath(`/${slug}`);
    return { ok: true, message: "Config saved." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed." };
  }
}

export async function adminResetConfig(profileId: string): Promise<AdminActionResult> {
  try {
    const session = await guard("write");
    const id = parseId(profileId);
    if (id == null) return { ok: false, error: "Invalid id." };

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("slug, global_name, username")
      .eq("id", id)
      .maybeSingle();
    const row = profile as {
      slug: string;
      global_name: string | null;
      username: string;
    } | null;
    if (!row) return { ok: false, error: "User not found." };

    const config = mergeTemplate(DEFAULT_PROFILE_TEMPLATE, {
      meta: {
        ...DEFAULT_PROFILE_TEMPLATE.meta,
        slug: row.slug,
        displayName: row.global_name || row.username,
        pageTitle: `${row.slug} | under.bio`,
      },
    });

    const { error, count } = await admin
      .from("pages")
      .update({ config }, { count: "exact" })
      .eq("profile_id", id);
    if (error) return { ok: false, error: "Reset failed." };
    if (!count) return { ok: false, error: "Page not found." };

    await writeAdminAudit({
      actorProfileId: session.user.profileId,
      actorDiscordId: session.user.discordId,
      action: "reset_config",
      targetProfileId: id,
    });

    revalidatePath(`/admin/users/${id}`);
    revalidatePath(`/${row.slug}`);
    return { ok: true, message: "Config reset." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed." };
  }
}

export async function adminDeleteUser(
  profileId: string,
  confirm: string,
): Promise<AdminActionResult> {
  try {
    const session = await guard("danger");
    const id = parseId(profileId);
    if (id == null) return { ok: false, error: "Invalid id." };
    if (confirm !== "DELETE") {
      return { ok: false, error: 'Type DELETE to confirm.' };
    }
    if (id === session.user.profileId) {
      return { ok: false, error: "You cannot delete your own admin account." };
    }

    const admin = createAdminClient();
    const { data: target } = await admin
      .from("profiles")
      .select("discord_id, slug")
      .eq("id", id)
      .maybeSingle();
    const row = target as { discord_id: string; slug: string } | null;
    if (!row) return { ok: false, error: "User not found." };
    if (isAdminDiscordId(row.discord_id)) {
      return { ok: false, error: "Cannot delete an owner account." };
    }

    const { error, count } = await admin
      .from("profiles")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) return { ok: false, error: "Delete failed." };
    if (!count) return { ok: false, error: "User not found." };

    await writeAdminAudit({
      actorProfileId: session.user.profileId,
      actorDiscordId: session.user.discordId,
      action: "delete_user",
      targetProfileId: id,
      meta: { slug: row.slug },
    });

    revalidatePath("/admin");
    return { ok: true, message: "User deleted." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed." };
  }
}

export async function adminSetViews(
  profileId: string,
  totalViews: number,
): Promise<AdminActionResult> {
  try {
    const session = await guard("write");
    const id = parseId(profileId);
    if (id == null) return { ok: false, error: "Invalid id." };
    const views = viewsSchema.safeParse(totalViews);
    if (!views.success) return { ok: false, error: "Invalid view count." };

    const admin = createAdminClient();
    const { error, count } = await admin
      .from("pages")
      .update({ total_views: views.data }, { count: "exact" })
      .eq("profile_id", id);
    if (error) return { ok: false, error: "Update failed." };
    if (!count) return { ok: false, error: "Page not found." };

    await writeAdminAudit({
      actorProfileId: session.user.profileId,
      actorDiscordId: session.user.discordId,
      action: "set_views",
      targetProfileId: id,
      meta: { totalViews: views.data },
    });

    revalidatePath(`/admin/users/${id}`);
    revalidatePath("/admin");
    return { ok: true, message: "Views updated." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed." };
  }
}

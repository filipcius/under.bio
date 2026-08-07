"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_PROFILE_TEMPLATE,
  mergeTemplate,
  parseProfileTemplate,
  type ProfileTemplate,
} from "@/lib/profile-template";
import { slugify } from "@/lib/utils";
import { getPageByProfileId } from "@/lib/data";
import { isHttpUrl, rateLimit } from "@/lib/security";
import { enforceFreePlanConfig } from "@/lib/plan";
import { getPlanByProfileId } from "@/lib/subscription";

const slugSchema = z
  .string()
  .min(3)
  .max(25)
  .regex(/^[a-z0-9]([a-z0-9_-]{1,23}[a-z0-9])?$/);

const reserved = new Set([
  "api",
  "login",
  "dashboard",
  "profile",
  "options",
  "miscellaneous",
  "extras",
  "account",
  "shop",
  "black",
  "auth",
  "admin",
  "under",
  "underbio",
  "template",
  "templates",
  "terms",
  "privacy",
  "faq",
]);

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

async function getOwnedPage(profileId: string) {
  const page = await getPageByProfileId(profileId);
  if (!page) throw new Error("Page not found. Contact support.");
  return page;
}

export async function updateSlug(rawSlug: string): Promise<ActionResult> {
  const session = await requireSession();
  const limited = rateLimit(`slug:${session.user.profileId}`, 8);
  if (!limited.ok) {
    return { ok: false, error: `Slow down. Try again in ${limited.retryAfterSec}s.` };
  }
  const slug = slugify(rawSlug);

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Slug must be 3–25 chars: lowercase letters, numbers, _ or -.",
    };
  }
  if (reserved.has(slug)) {
    return { ok: false, error: "This slug is reserved. Pick another." };
  }

  const admin = createAdminClient();
  const { data: taken } = await admin
    .from("profiles")
    .select("id")
    .eq("slug", slug)
    .neq("id", session.user.profileId)
    .maybeSingle();

  if (taken) {
    return { ok: false, error: "This URL ending is already taken." };
  }

  const { error } = await admin
    .from("profiles")
    .update({ slug })
    .eq("id", session.user.profileId);

  if (error) return { ok: false, error: "Could not update slug." };

  const page = await getOwnedPage(session.user.profileId);
  const nextConfig = mergeTemplate(page.config, {
    meta: { ...page.config.meta, slug },
  });

  await admin
    .from("pages")
    .update({ config: nextConfig })
    .eq("id", page.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath(`/${slug}`);
  return { ok: true, message: "URL ending updated." };
}

export async function saveProfileConfig(
  partial: Partial<ProfileTemplate>,
): Promise<ActionResult> {
  const session = await requireSession();
  const limited = rateLimit(`save:${session.user.profileId}`, 30);
  if (!limited.ok) {
    return { ok: false, error: `Slow down. Try again in ${limited.retryAfterSec}s.` };
  }
  const page = await getOwnedPage(session.user.profileId);
  const next = mergeTemplate(page.config, partial);
  const validated = parseProfileTemplate(next);
  if (!validated.success) {
    return { ok: false, error: "Invalid profile configuration." };
  }

  // Slug changes only via updateSlug (unique + reserved checks)
  validated.data.meta.slug = page.config.meta.slug;

  const plan = await getPlanByProfileId(session.user.profileId);
  const toSave = plan.isBlack
    ? validated.data
    : enforceFreePlanConfig(validated.data);

  const admin = createAdminClient();
  const { error } = await admin
    .from("pages")
    .update({ config: toSave })
    .eq("id", page.id)
    .eq("profile_id", session.user.profileId);

  if (error) return { ok: false, error: "Save failed." };

  const displayName = toSave.meta.displayName;
  await admin
    .from("profiles")
    .update({ global_name: displayName })
    .eq("id", session.user.profileId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/options");
  revalidatePath("/dashboard/miscellaneous");
  revalidatePath("/dashboard/extras");
  revalidatePath(`/${toSave.meta.slug}`);
  return {
    ok: true,
    message: plan.isBlack
      ? "Saved."
      : "Saved. VOID-only style was kept within free limits.",
  };
}

export async function importProfileJson(raw: string): Promise<ActionResult> {
  const session = await requireSession();
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid JSON." };
  }

  // Strip helper keys for AI templates (_tier, _instructions, …)
  if (json && typeof json === "object") {
    const obj = { ...(json as Record<string, unknown>) };
    for (const key of Object.keys(obj)) {
      if (key.startsWith("_")) delete obj[key];
    }
    json = obj;
  }

  const parsed = parseProfileTemplate(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: `JSON does not match under.bio template: ${issue?.path.join(".")} ${issue?.message}`,
    };
  }

  const page = await getOwnedPage(session.user.profileId);
  const lockedSlug = page.config.meta.slug;

  const badLink = parsed.data.links.find((l) => !isHttpUrl(l.url));
  if (badLink) {
    return { ok: false, error: `Invalid link URL: ${badLink.label}` };
  }
  const badShowcase = parsed.data.showcases.find(
    (s) => !s.inviteCode && (!s.url || !isHttpUrl(s.url)),
  );
  if (badShowcase) {
    return { ok: false, error: "Each Discord showcase needs a valid invite code or URL." };
  }

  const scrub = (s: string) => s.replace(/[\u2014\u2013]/g, "-").replace(/ -- /g, " - ");
  let next = {
    ...parsed.data,
    meta: {
      ...parsed.data.meta,
      slug: lockedSlug,
      displayName: scrub(parsed.data.meta.displayName),
      description: scrub(parsed.data.meta.description),
      location: scrub(parsed.data.meta.location),
      pageTitle: scrub(parsed.data.meta.pageTitle),
      statusText: scrub(parsed.data.meta.statusText),
    },
    badges: parsed.data.badges.map((b) => ({
      ...b,
      name: scrub(b.name),
      description: scrub(b.description),
    })),
    tags: parsed.data.tags.map(scrub),
  };

  const plan = await getPlanByProfileId(session.user.profileId);
  if (!plan.isBlack) next = enforceFreePlanConfig(next);

  const admin = createAdminClient();
  const { error } = await admin
    .from("pages")
    .update({ config: next })
    .eq("id", page.id)
    .eq("profile_id", session.user.profileId);

  if (error) return { ok: false, error: "Import failed." };

  await admin
    .from("profiles")
    .update({ global_name: next.meta.displayName })
    .eq("id", session.user.profileId);

  revalidatePath("/dashboard");
  revalidatePath(`/${lockedSlug}`);
  return {
    ok: true,
    message: plan.isBlack
      ? "JSON imported and applied."
      : "JSON imported with free-plan limits applied. Unlock VOID for full style.",
  };
}

export async function resetProfileConfig(): Promise<ActionResult> {
  const session = await requireSession();
  const page = await getOwnedPage(session.user.profileId);
  const { data: profileData } = await createAdminClient()
    .from("profiles")
    .select("slug, global_name, username")
    .eq("id", session.user.profileId)
    .single();

  const profile = profileData as {
    slug: string;
    global_name: string | null;
    username: string;
  } | null;

  const slug = profile?.slug ?? page.config.meta.slug;
  const next = mergeTemplate(DEFAULT_PROFILE_TEMPLATE, {
    meta: {
      ...DEFAULT_PROFILE_TEMPLATE.meta,
      slug,
      displayName: profile?.global_name || profile?.username || "User",
      pageTitle: `${slug} | under.bio`,
    },
  });

  const admin = createAdminClient();
  const { error } = await admin
    .from("pages")
    .update({ config: next })
    .eq("id", page.id);

  if (error) return { ok: false, error: "Reset failed." };
  revalidatePath("/dashboard");
  return { ok: true, message: "Profile reset to defaults." };
}

export async function syncDiscord(): Promise<ActionResult> {
  // Soft sync: session JWT refresh on next login updates Discord fields.
  // Immediate sync requires re-auth; guide user to re-login.
  return {
    ok: true,
    message: "Discord stats refresh on each login. Sign out and sign in to force sync.",
  };
}

/** Persist free-plan stripping so VOID-only knobs cannot linger after downgrade / pre-sub abuse */
export async function ensureFreePlanCompliance(): Promise<ActionResult> {
  const session = await requireSession();
  const plan = await getPlanByProfileId(session.user.profileId);
  if (plan.isBlack) return { ok: true };

  const page = await getOwnedPage(session.user.profileId);
  const cleaned = enforceFreePlanConfig(page.config);
  const before = JSON.stringify(page.config);
  const after = JSON.stringify(cleaned);
  if (before === after) return { ok: true };

  const admin = createAdminClient();
  const { error } = await admin
    .from("pages")
    .update({ config: cleaned })
    .eq("id", page.id)
    .eq("profile_id", session.user.profileId);
  if (error) return { ok: false, error: "Could not normalize free-plan config." };

  revalidatePath("/dashboard/miscellaneous");
  revalidatePath("/dashboard/extras");
  revalidatePath(`/${cleaned.meta.slug}`);
  return { ok: true, message: "Free-plan limits applied to your page." };
}

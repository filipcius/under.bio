"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPageByProfileId, getProfileById } from "@/lib/data";
import { enforceFreePlanConfig } from "@/lib/plan";
import { getPlanByProfileId } from "@/lib/subscription";
import { rateLimit } from "@/lib/security";
import {
  DEFAULT_APPLY_OPTIONS,
  MAX_TEMPLATES_PER_USER,
  applyOptionsSchema,
  applyStyleConfig,
  buildPreviewSwatch,
  canPublishThemeTemplates,
  extractStyleConfig,
  parseStyleConfig,
  publishThemeSchema,
  type ThemeApplyOptions,
} from "@/lib/theme-template";
import type {
  ThemeTemplateCategory,
  ThemeTemplateRow,
  ThemeTemplateStatus,
} from "@/lib/supabase/types";

export type ActionResult =
  | { ok: true; message?: string; id?: string }
  | { ok: false; error: string };

export type ThemeTemplateListItem = ThemeTemplateRow & {
  author_slug?: string | null;
  author_name?: string | null;
  author_avatar?: string | null;
};

export async function listThemeTemplates(input?: {
  category?: ThemeTemplateCategory | "all" | "featured";
  sort?: "popular" | "newest" | "featured";
  status?: ThemeTemplateStatus;
  authorId?: string;
  limit?: number;
}): Promise<ThemeTemplateListItem[]> {
  const supabase = createAdminClient();
  const limit = Math.min(input?.limit ?? 60, 100);

  let q = supabase.from("theme_templates").select("*").limit(limit);

  // When listing for marketplace, default to approved. Pass status explicitly for admin/mine.
  if (input?.status) q = q.eq("status", input.status);
  else if (!input?.authorId) q = q.eq("status", "approved");

  if (input?.category && input.category !== "all" && input.category !== "featured") {
    q = q.eq("category", input.category);
  }
  if (input?.category === "featured" || input?.sort === "featured") {
    q = q.eq("featured", true);
  }
  if (input?.authorId) q = q.eq("author_id", input.authorId);

  if (input?.sort === "newest") q = q.order("created_at", { ascending: false });
  else if (input?.sort === "featured") {
    q = q.order("featured", { ascending: false }).order("uses_count", { ascending: false });
  } else q = q.order("uses_count", { ascending: false });

  const { data, error } = await q;
  if (error || !data) return [];

  const rows = data as ThemeTemplateRow[];
  const authorIds = [...new Set(rows.map((r) => r.author_id))];
  const { data: authors } = authorIds.length
    ? await supabase
        .from("profiles")
        .select("id, slug, global_name, username, avatar_url")
        .in("id", authorIds)
    : { data: [] as Array<Record<string, unknown>> };

  const byId = new Map(
    (authors || []).map((a) => [a.id as string, a as Record<string, unknown>]),
  );

  return rows.map((row) => {
    const p = byId.get(row.author_id);
    return {
      ...row,
      author_slug: (p?.slug as string) || null,
      author_name: ((p?.global_name as string) || (p?.username as string) || null) as
        | string
        | null,
      author_avatar: (p?.avatar_url as string) || null,
    };
  });
}

export async function getThemeTemplateById(
  id: string,
): Promise<ThemeTemplateListItem | null> {
  const uuid = z.string().uuid().safeParse(id);
  if (!uuid.success) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("theme_templates")
    .select("*")
    .eq("id", uuid.data)
    .maybeSingle();

  if (!data) return null;
  const row = data as ThemeTemplateRow;

  // Approved = public share link. Pending = author only. Rejected/hidden = no access.
  if (row.status === "rejected" || row.status === "hidden") return null;

  let sessionProfileId: string | null = null;
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    sessionProfileId = session?.user?.profileId ?? null;
  } catch {
    sessionProfileId = null;
  }

  if (row.status === "pending") {
    if (!sessionProfileId || sessionProfileId !== row.author_id) return null;
  } else if (row.status !== "approved") {
    return null;
  }

  const { data: author } = await supabase
    .from("profiles")
    .select("slug, global_name, username, avatar_url")
    .eq("id", row.author_id)
    .maybeSingle();

  return {
    ...row,
    author_slug: (author?.slug as string) || null,
    author_name: ((author?.global_name as string) ||
      (author?.username as string) ||
      null) as string | null,
    author_avatar: (author?.avatar_url as string) || null,
  };
}

export async function listMyThemeTemplates(): Promise<ThemeTemplateListItem[]> {
  const session = await requireSession();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("theme_templates")
    .select("*")
    .eq("author_id", session.user.profileId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data || []) as ThemeTemplateListItem[];
}

export async function getPublishEligibility(): Promise<{
  canPublish: boolean;
  reason?: string;
  daysLeft?: number;
  count?: number;
}> {
  const session = await requireSession();
  const profile = await getProfileById(session.user.profileId);
  if (!profile) return { canPublish: false, reason: "Profile not found." };

  const gate = canPublishThemeTemplates(profile);
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("theme_templates")
    .select("id", { count: "exact", head: true })
    .eq("author_id", profile.id)
    .in("status", ["pending", "approved"]);

  return {
    canPublish: gate.ok && (count ?? 0) < MAX_TEMPLATES_PER_USER,
    reason: !gate.ok
      ? gate.reason
      : (count ?? 0) >= MAX_TEMPLATES_PER_USER
        ? `You can have at most ${MAX_TEMPLATES_PER_USER} active themes.`
        : undefined,
    daysLeft: gate.ok ? undefined : gate.daysLeft,
    count: count ?? 0,
  };
}

export async function publishThemeTemplate(input: {
  name: string;
  description?: string;
  category: ThemeTemplateCategory;
}): Promise<ActionResult> {
  const session = await requireSession();
  if (!rateLimit(`tpl-publish:${session.user.profileId}`, 5, 60_000)) {
    return { ok: false, error: "Slow down — try again in a minute." };
  }

  const parsed = publishThemeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid theme details." };

  const profile = await getProfileById(session.user.profileId);
  const page = await getPageByProfileId(session.user.profileId);
  if (!profile || !page) return { ok: false, error: "Profile not found." };

  const gate = canPublishThemeTemplates(profile);
  if (!gate.ok) return { ok: false, error: gate.reason };

  const supabase = createAdminClient();
  const { count } = await supabase
    .from("theme_templates")
    .select("id", { count: "exact", head: true })
    .eq("author_id", profile.id)
    .in("status", ["pending", "approved"]);

  if ((count ?? 0) >= MAX_TEMPLATES_PER_USER) {
    return {
      ok: false,
      error: `You can have at most ${MAX_TEMPLATES_PER_USER} active themes.`,
    };
  }

  const style = extractStyleConfig(page.config);
  const preview = buildPreviewSwatch(page.config);

  const { data, error } = await supabase
    .from("theme_templates")
    .insert({
      author_id: profile.id,
      name: parsed.data.name,
      description: parsed.data.description || "",
      category: parsed.data.category,
      config: style,
      preview,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "Could not publish theme. Is the DB migration applied?" };
  }

  revalidatePath("/templates");
  revalidatePath("/dashboard/templates");
  revalidatePath("/admin");
  return { ok: true, message: "Submitted for review.", id: data.id as string };
}

export async function applyThemeTemplate(
  id: string,
  options?: Partial<ThemeApplyOptions>,
): Promise<ActionResult> {
  const session = await requireSession();
  if (!rateLimit(`tpl-apply:${session.user.profileId}`, 20, 60_000)) {
    return { ok: false, error: "Slow down." };
  }

  const optsParsed = applyOptionsSchema.safeParse({
    ...DEFAULT_APPLY_OPTIONS,
    ...options,
  });
  if (!optsParsed.success) return { ok: false, error: "Invalid apply options." };
  const opts = optsParsed.data;

  const supabase = createAdminClient();
  const { data: tpl } = await supabase
    .from("theme_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!tpl) return { ok: false, error: "Theme not found." };
  const row = tpl as ThemeTemplateRow;
  if (row.status !== "approved" && row.author_id !== session.user.profileId) {
    return { ok: false, error: "Theme is not available." };
  }

  const style = parseStyleConfig(row.config);
  if (!style) return { ok: false, error: "Theme data is invalid." };

  const page = await getPageByProfileId(session.user.profileId);
  if (!page) return { ok: false, error: "Page not found." };

  // Preserve personal content explicitly (mergeTemplate already does; belt & suspenders)
  const before = page.config;
  let next = applyStyleConfig(before, style, opts);
  next = {
    ...next,
    meta: before.meta,
    links: before.links,
    badges: before.badges,
    tags: before.tags,
    tracks: before.tracks,
    showcases: before.showcases,
    options: before.options,
  };

  const plan = await getPlanByProfileId(session.user.profileId);
  if (!plan.isBlack) next = enforceFreePlanConfig(next);

  // Free-plan scrub can touch options — restore personal modules again
  next = {
    ...next,
    meta: before.meta,
    links: before.links,
    badges: before.badges,
    tags: before.tags,
    tracks: before.tracks,
    showcases: before.showcases,
    options: before.options,
    audio: {
      ...next.audio,
      trackPlayer: before.audio.trackPlayer,
      autoPlay: before.audio.autoPlay,
      defaultVolume: before.audio.defaultVolume,
      playbackMode: before.audio.playbackMode,
    },
    banner: {
      ...next.banner,
      url: opts.bannerMedia ? next.banner.url : before.banner.url,
    },
    background: {
      ...next.background,
      url: opts.backgroundMedia ? next.background.url : before.background.url,
    },
  };

  const { error } = await supabase
    .from("pages")
    .update({ config: next })
    .eq("id", page.id);

  if (error) return { ok: false, error: "Failed to apply theme." };

  if (row.status === "approved") {
    await supabase
      .from("theme_templates")
      .update({ uses_count: (row.uses_count || 0) + 1 })
      .eq("id", id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/miscellaneous");
  revalidatePath("/dashboard/templates");
  revalidatePath(`/${session.user.slug}`);
  return {
    ok: true,
    message: "Theme applied. Your links, tags, Discord cards, tracks, and media were kept.",
  };
}

export async function deleteOwnThemeTemplate(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const supabase = createAdminClient();
  const { data: tpl } = await supabase
    .from("theme_templates")
    .select("id, author_id, featured")
    .eq("id", id)
    .maybeSingle();

  if (!tpl) return { ok: false, error: "Not found." };
  if (tpl.author_id !== session.user.profileId) {
    return { ok: false, error: "Not your theme." };
  }
  if (tpl.featured) {
    return { ok: false, error: "Featured themes can only be removed by admins." };
  }

  const { error } = await supabase.from("theme_templates").delete().eq("id", id);
  if (error) return { ok: false, error: "Delete failed." };

  revalidatePath("/templates");
  revalidatePath("/dashboard/templates");
  return { ok: true, message: "Theme deleted." };
}

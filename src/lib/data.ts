import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_PROFILE_TEMPLATE,
  mergeTemplate,
  type ProfileTemplate,
} from "@/lib/profile-template";
import type { PageRow, PageViewRow, ProfileRow } from "@/lib/supabase/types";

export async function getProfileById(profileId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data as ProfileRow | null;
}

export async function getProfileBySlug(slug: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data as ProfileRow | null;
}

export async function getPageByProfileId(profileId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("pages")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as Omit<PageRow, "config"> & { config: Partial<ProfileTemplate> };
  return {
    ...row,
    config: mergeTemplate(DEFAULT_PROFILE_TEMPLATE, row.config ?? {}),
  } as PageRow;
}

export async function getWeeklyViews(pageId: string) {
  const admin = createAdminClient();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 6);
  const startDate = start.toISOString().slice(0, 10);

  const { data, error } = await admin
    .from("page_views")
    .select("viewed_on, count")
    .eq("page_id", pageId)
    .gte("viewed_on", startDate)
    .order("viewed_on", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as Pick<PageViewRow, "viewed_on" | "count">[];
  const map = new Map(rows.map((row) => [row.viewed_on, row.count]));
  const days: { day: string; views: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      views: map.get(key) ?? 0,
    });
  }
  return days;
}

export async function recordPageView(pageId: string) {
  const admin = createAdminClient();
  const { error } = await admin.rpc("increment_page_view", { p_page_id: pageId });
  if (error) throw error;
}

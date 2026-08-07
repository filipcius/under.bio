import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_PROFILE_TEMPLATE,
  mergeTemplate,
  type ProfileTemplate,
} from "@/lib/profile-template";
import { hasBlack } from "@/lib/plan";
import type { PageRow, ProfileRow } from "@/lib/supabase/types";

export type AdminUserRow = {
  id: string;
  discord_id: string;
  username: string;
  global_name: string | null;
  avatar_url: string | null;
  slug: string;
  uid: number;
  email: string | null;
  plan: string;
  plan_status: string;
  plan_period_end: string | null;
  created_at: string;
  isBlack: boolean;
  published: boolean;
  total_views: number;
  page_id: string | null;
};

export type AdminStats = {
  users: number;
  published: number;
  unpublished: number;
  totalViews: number;
  black: number;
  free: number;
  joinedWeek: number;
  joinedDay: number;
  expiringSoon: number;
  avgViews: number;
};

export type AdminAuditRow = {
  id: string;
  action: string;
  actor_discord_id: string;
  target_profile_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
};

export async function getAdminStats(): Promise<AdminStats> {
  const empty: AdminStats = {
    users: 0,
    published: 0,
    unpublished: 0,
    totalViews: 0,
    black: 0,
    free: 0,
    joinedWeek: 0,
    joinedDay: 0,
    expiringSoon: 0,
    avgViews: 0,
  };
  const admin = createAdminClient();
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const soon = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const [
      { count: users },
      pagesRes,
      blackRes,
      weekRes,
      dayRes,
      expireRes,
      profilesRes,
    ] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("pages").select("total_views, published"),
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("plan", "black")
        .in("plan_status", ["active", "trialing", "past_due"]),
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekAgo),
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", dayAgo),
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("plan", "black")
        .gte("plan_period_end", now)
        .lte("plan_period_end", soon),
      admin.from("profiles").select("plan, plan_status, plan_period_end"),
    ]);

    const pages = (pagesRes.data ?? []) as {
      total_views: number;
      published: boolean;
    }[];
    const totalViews = pages.reduce((s, p) => s + (p.total_views || 0), 0);
    const published = pages.filter((p) => p.published).length;
    const userCount = users ?? 0;

    let black = 0;
    for (const p of (profilesRes.data ?? []) as {
      plan: string | null;
      plan_status: string | null;
      plan_period_end: string | null;
    }[]) {
      if (hasBlack(p.plan, p.plan_status, p.plan_period_end)) black += 1;
    }

    return {
      users: userCount,
      published,
      unpublished: pages.length - published,
      totalViews,
      black: black || blackRes.count || 0,
      free: Math.max(0, userCount - (black || blackRes.count || 0)),
      joinedWeek: weekRes.count ?? 0,
      joinedDay: dayRes.count ?? 0,
      expiringSoon: expireRes.count ?? 0,
      avgViews: pages.length ? Math.round(totalViews / pages.length) : 0,
    };
  } catch (err) {
    console.error("[admin:stats]", err);
    return empty;
  }
}

export async function getAdminAudit(limit = 40): Promise<AdminAuditRow[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("admin_audit_log")
      .select("id, action, actor_discord_id, target_profile_id, meta, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.warn("[admin:audit]", error.message);
      return [];
    }
    return (data ?? []) as AdminAuditRow[];
  } catch {
    return [];
  }
}

export async function getTopViewedProfiles(limit = 8): Promise<
  Array<{
    profile_id: string;
    slug: string;
    username: string;
    global_name: string | null;
    avatar_url: string | null;
    total_views: number;
  }>
> {
  const admin = createAdminClient();
  const { data: pages } = await admin
    .from("pages")
    .select("profile_id, total_views")
    .order("total_views", { ascending: false })
    .limit(limit);
  const rows = (pages ?? []) as { profile_id: string; total_views: number }[];
  if (!rows.length) return [];

  const ids = rows.map((r) => r.profile_id);
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, slug, username, global_name, avatar_url")
    .in("id", ids);
  const byId = new Map(
    (
      (profiles ?? []) as Array<{
        id: string;
        slug: string;
        username: string;
        global_name: string | null;
        avatar_url: string | null;
      }>
    ).map((p) => [p.id, p]),
  );

  return rows
    .map((r) => {
      const p = byId.get(r.profile_id);
      if (!p) return null;
      return {
        profile_id: r.profile_id,
        slug: p.slug,
        username: p.username,
        global_name: p.global_name,
        avatar_url: p.avatar_url,
        total_views: r.total_views,
      };
    })
    .filter(Boolean) as Array<{
    profile_id: string;
    slug: string;
    username: string;
    global_name: string | null;
    avatar_url: string | null;
    total_views: number;
  }>;
}

export async function listAdminUsers(q?: string): Promise<AdminUserRow[]> {
  const admin = createAdminClient();
  let query = admin
    .from("profiles")
    .select(
      "id, discord_id, username, global_name, avatar_url, slug, uid, email, plan, plan_status, plan_period_end, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (q?.trim()) {
    const term = q
      .trim()
      .slice(0, 64)
      .replace(/[^a-zA-Z0-9_\-.\s]/g, "")
      .replace(/[%_,]/g, "");
    if (term.length >= 2) {
      query = query.or(
        `slug.ilike.%${term}%,username.ilike.%${term}%,global_name.ilike.%${term}%,discord_id.eq.${term}`,
      );
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error("[admin:listUsers]", error.message);
    // Fallback without plan columns (older DBs)
    const { data: fallback, error: fbErr } = await admin
      .from("profiles")
      .select(
        "id, discord_id, username, global_name, avatar_url, slug, uid, email, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (fbErr) {
      console.error("[admin:listUsers:fallback]", fbErr.message);
      return [];
    }
    const rows = (fallback ?? []) as Array<{
      id: string;
      discord_id: string;
      username: string;
      global_name: string | null;
      avatar_url: string | null;
      slug: string;
      uid: number;
      email: string | null;
      created_at: string;
    }>;
    const ids = rows.map((p) => p.id);
    const pagesByProfile = new Map<
      string,
      { id: string; published: boolean; total_views: number }
    >();
    if (ids.length) {
      const { data: pages } = await admin
        .from("pages")
        .select("id, profile_id, published, total_views")
        .in("profile_id", ids);
      for (const p of (pages ?? []) as {
        id: string;
        profile_id: string;
        published: boolean;
        total_views: number;
      }[]) {
        pagesByProfile.set(p.profile_id, {
          id: p.id,
          published: p.published,
          total_views: p.total_views,
        });
      }
    }
    return rows.map((p) => {
      const page = pagesByProfile.get(p.id);
      return {
        ...p,
        plan: "free",
        plan_status: "inactive",
        plan_period_end: null,
        isBlack: false,
        published: page?.published ?? false,
        total_views: page?.total_views ?? 0,
        page_id: page?.id ?? null,
      };
    });
  }

  const profiles = (data ?? []) as Omit<
    AdminUserRow,
    "isBlack" | "published" | "total_views" | "page_id"
  >[];

  const ids = profiles.map((p) => p.id);
  const pagesByProfile = new Map<
    string,
    { id: string; published: boolean; total_views: number }
  >();

  if (ids.length) {
    const { data: pages } = await admin
      .from("pages")
      .select("id, profile_id, published, total_views")
      .in("profile_id", ids);
    for (const p of (pages ?? []) as {
      id: string;
      profile_id: string;
      published: boolean;
      total_views: number;
    }[]) {
      pagesByProfile.set(p.profile_id, {
        id: p.id,
        published: p.published,
        total_views: p.total_views,
      });
    }
  }

  return profiles.map((p) => {
    const page = pagesByProfile.get(p.id);
    return {
      ...p,
      plan: p.plan || "free",
      plan_status: p.plan_status || "inactive",
      isBlack: hasBlack(p.plan, p.plan_status, p.plan_period_end),
      published: page?.published ?? false,
      total_views: page?.total_views ?? 0,
      page_id: page?.id ?? null,
    };
  });
}

export async function getAdminUser(profileId: string) {
  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;

  const { data: page } = await admin
    .from("pages")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  const p = profile as ProfileRow;
  let pageRow: PageRow | null = null;
  if (page) {
    const row = page as Omit<PageRow, "config"> & {
      config: Partial<ProfileTemplate>;
    };
    pageRow = {
      ...row,
      config: mergeTemplate(DEFAULT_PROFILE_TEMPLATE, row.config ?? {}),
    };
  }

  return {
    profile: p,
    page: pageRow,
    isBlack: hasBlack(p.plan, p.plan_status, p.plan_period_end),
  };
}

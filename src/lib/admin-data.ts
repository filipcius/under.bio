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

export async function getAdminStats() {
  const admin = createAdminClient();
  try {
    const [{ count: users }, pagesRes, blackRes] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("pages").select("total_views, published"),
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("plan", "black")
        .in("plan_status", ["active", "trialing", "past_due"]),
    ]);

    const pages = (pagesRes.data ?? []) as {
      total_views: number;
      published: boolean;
    }[];
    const totalViews = pages.reduce((s, p) => s + (p.total_views || 0), 0);
    const published = pages.filter((p) => p.published).length;

    return {
      users: users ?? 0,
      published,
      unpublished: pages.length - published,
      totalViews,
      black: blackRes.count ?? 0,
    };
  } catch (err) {
    console.error("[admin:stats]", err);
    const [{ count: users }, pagesRes] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("pages").select("total_views, published"),
    ]);
    const pages = (pagesRes.data ?? []) as {
      total_views: number;
      published: boolean;
    }[];
    return {
      users: users ?? 0,
      published: pages.filter((p) => p.published).length,
      unpublished: pages.filter((p) => !p.published).length,
      totalViews: pages.reduce((s, p) => s + (p.total_views || 0), 0),
      black: 0,
    };
  }
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
      isBlack: hasBlack(p.plan, p.plan_status),
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
    isBlack: hasBlack(p.plan, p.plan_status),
  };
}

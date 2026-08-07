"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BlackDiamond } from "@/components/BlackDiamond";
import { AdminQuickActions } from "@/components/admin/AdminControls";
import type {
  AdminAuditRow,
  AdminStats,
  AdminUserRow,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

type Filter = "all" | "void" | "free" | "live" | "hidden" | "expiring";
type Sort = "newest" | "views" | "slug" | "void";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "void", label: "VOID" },
  { id: "free", label: "Free" },
  { id: "live", label: "Live" },
  { id: "hidden", label: "Hidden" },
  { id: "expiring", label: "Expiring ≤7d" },
];

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function actionLabel(action: string) {
  return action.replace(/_/g, " ");
}

export function AdminDashboard({
  stats,
  users,
  top,
  audit,
  initialQuery = "",
}: {
  stats: AdminStats;
  users: AdminUserRow[];
  top: Array<{
    profile_id: string;
    slug: string;
    username: string;
    global_name: string | null;
    avatar_url: string | null;
    total_views: number;
  }>;
  audit: AdminAuditRow[];
  initialQuery?: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [q, setQ] = useState(initialQuery);

  const filtered = useMemo(() => {
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    let list = [...users];

    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (u) =>
          u.slug.toLowerCase().includes(term) ||
          u.username.toLowerCase().includes(term) ||
          (u.global_name || "").toLowerCase().includes(term) ||
          u.discord_id.includes(term) ||
          String(u.uid).includes(term),
      );
    }

    list = list.filter((u) => {
      if (filter === "void") return u.isBlack;
      if (filter === "free") return !u.isBlack;
      if (filter === "live") return u.published;
      if (filter === "hidden") return !u.published;
      if (filter === "expiring") {
        if (!u.isBlack || !u.plan_period_end) return false;
        const t = new Date(u.plan_period_end).getTime();
        return t >= now && t <= now + week;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sort === "views") return b.total_views - a.total_views;
      if (sort === "slug") return a.slug.localeCompare(b.slug);
      if (sort === "void") return Number(b.isBlack) - Number(a.isBlack);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [users, filter, sort, q]);

  const cards = [
    { label: "Users", value: stats.users, hint: `+${stats.joinedWeek} this week` },
    { label: "VOID", value: stats.black, hint: `${stats.free} free` },
    { label: "Live pages", value: stats.published, hint: `${stats.unpublished} hidden` },
    { label: "Total views", value: stats.totalViews, hint: `avg ${stats.avgViews}/page` },
    { label: "Joined today", value: stats.joinedDay, hint: "last 24h" },
    { label: "Expiring soon", value: stats.expiringSoon, hint: "VOID ≤ 7 days" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/35">
            Owner control room
          </p>
          <h1 className="section-title mt-2 text-4xl">Admin</h1>
          <p className="help mt-2">
            Users, plans, pages, comps, and recent operator actions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard" className="btn btn-ghost text-sm">
            Dashboard
          </Link>
          <Link href="/black" className="btn btn-ghost text-sm">
            <BlackDiamond /> VOID shop
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent px-4 py-4"
          >
            <p className="help">{s.label}</p>
            <p className="mt-1 section-title text-2xl tabular-nums">
              {s.value.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-white/35">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title text-lg">Top pages</h2>
            <span className="text-[11px] text-white/35">by views</span>
          </div>
          <div className="space-y-2">
            {top.length === 0 && (
              <p className="text-sm text-white/40">No page data yet.</p>
            )}
            {top.map((t, i) => (
              <Link
                key={t.profile_id}
                href={`/admin/users/${t.profile_id}`}
                className="flex items-center gap-3 rounded-xl border border-white/5 px-3 py-2 transition hover:border-white/15 hover:bg-white/[0.03]"
              >
                <span className="w-5 text-xs tabular-nums text-white/30">
                  {i + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar_url || "/avatar-fallback.svg"}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {t.global_name || t.username}
                  </span>
                  <span className="block truncate text-xs text-white/40">
                    /{t.slug}
                  </span>
                </span>
                <span className="text-sm tabular-nums text-white/60">
                  {t.total_views.toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title text-lg">Recent actions</h2>
            <span className="text-[11px] text-white/35">audit log</span>
          </div>
          <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {audit.length === 0 && (
              <p className="text-sm text-white/40">
                No audit rows yet (or table not created).
              </p>
            )}
            {audit.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-white/5 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium capitalize">
                    {actionLabel(a.action)}
                  </p>
                  <p className="shrink-0 text-[10px] text-white/35">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="mt-0.5 truncate text-xs text-white/40">
                  actor {a.actor_discord_id}
                  {a.target_profile_id
                    ? ` · target ${a.target_profile_id.slice(0, 8)}…`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition",
              filter === f.id
                ? "border-white/30 bg-white/10 text-white"
                : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80",
            )}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            className="soft-input h-9 w-auto py-1 text-xs"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            <option value="newest">Newest</option>
            <option value="views">Most views</option>
            <option value="slug">Slug A–Z</option>
            <option value="void">VOID first</option>
          </select>
          <input
            className="soft-input h-9 w-52 text-xs"
            placeholder="Search slug, user, discord…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="hidden grid-cols-[1.5fr_0.7fr_0.7fr_0.55fr_0.5fr_0.7fr_1.3fr] gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/40 sm:grid">
          <span>User</span>
          <span>Slug</span>
          <span>Plan</span>
          <span>Views</span>
          <span>Page</span>
          <span>Joined</span>
          <span>Actions</span>
        </div>

        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-white/45">
            No users match this filter.
          </p>
        )}

        {filtered.map((u) => (
          <div
            key={u.id}
            className="grid grid-cols-1 items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0 sm:grid-cols-[1.5fr_0.7fr_0.7fr_0.55fr_0.5fr_0.7fr_1.3fr]"
          >
            <Link
              href={`/admin/users/${u.id}`}
              className="flex min-w-0 items-center gap-3 hover:opacity-90"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u.avatar_url || "/avatar-fallback.svg"}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {u.global_name || u.username}
                </span>
                <span className="block truncate text-xs text-white/40">
                  @{u.username} · uid {u.uid}
                </span>
              </span>
            </Link>
            <a
              href={`/${u.slug}`}
              target="_blank"
              rel="noreferrer"
              className="truncate text-sm text-white/60 hover:text-white"
            >
              /{u.slug}
            </a>
            <span className="text-sm">
              {u.isBlack ? (
                <span className="inline-flex flex-col gap-0.5">
                  <span className="inline-flex items-center gap-1">
                    <BlackDiamond /> VOID
                  </span>
                  <span className="text-[10px] text-white/35">
                    until {fmtDate(u.plan_period_end)}
                  </span>
                </span>
              ) : (
                <span className="text-white/45">Free</span>
              )}
            </span>
            <span className="text-sm tabular-nums text-white/60">
              {u.total_views.toLocaleString()}
            </span>
            <span className="text-sm">
              {u.published ? (
                <span className="text-emerald-300/80">Live</span>
              ) : (
                <span className="text-white/35">Off</span>
              )}
            </span>
            <span className="text-xs text-white/45">{fmtDate(u.created_at)}</span>
            <div>
              <AdminQuickActions
                profileId={u.id}
                published={u.published}
                isBlack={u.isBlack}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[11px] text-white/30">
        Showing {filtered.length} of {users.length} loaded users
      </p>
    </div>
  );
}

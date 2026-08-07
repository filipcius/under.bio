import Link from "next/link";
import { getAdminStats, listAdminUsers } from "@/lib/admin-data";
import { BlackDiamond } from "@/components/BlackDiamond";
import { AdminQuickActions } from "@/components/admin/AdminControls";

export const metadata = { title: "Admin · under.bio" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const [stats, users] = await Promise.all([
    getAdminStats(),
    listAdminUsers(sp.q),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/35">Owner only</p>
          <h1 className="section-title mt-2 text-4xl">Admin</h1>
          <p className="help mt-2">Manage every profile, page, and plan.</p>
        </div>
        <form className="flex w-full max-w-sm gap-2 sm:w-auto">
          <input
            name="q"
            defaultValue={sp.q || ""}
            className="soft-input"
            placeholder="Search slug, user, discord id"
          />
          <button type="submit" className="btn btn-ghost shrink-0">
            Search
          </button>
        </form>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Users", value: stats.users },
          { label: "Published", value: stats.published },
          { label: "Hidden", value: stats.unpublished },
          { label: "Views", value: stats.totalViews },
          { label: "VOID", value: stats.black },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4"
          >
            <p className="help">{s.label}</p>
            <p className="mt-1 section-title text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.16em] text-white/40 sm:grid-cols-[1.4fr_0.8fr_0.6fr_0.5fr_0.5fr_1.2fr]">
          <span>User</span>
          <span className="hidden sm:block">Slug</span>
          <span className="hidden sm:block">Plan</span>
          <span className="hidden sm:block">Views</span>
          <span className="hidden sm:block">Page</span>
          <span className="text-right sm:text-left">Actions</span>
        </div>

        {users.length === 0 && (
          <p className="px-4 py-8 text-sm text-white/45">No users match.</p>
        )}

        {users.map((u) => (
          <div
            key={u.id}
            className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0 sm:grid-cols-[1.4fr_0.8fr_0.6fr_0.5fr_0.5fr_1.2fr]"
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
              className="hidden truncate text-sm text-white/60 hover:text-white sm:block"
            >
              /{u.slug}
            </a>
            <span className="hidden text-sm sm:inline-flex sm:items-center sm:gap-1">
              {u.isBlack ? (
                <>
                  <BlackDiamond /> VOID
                </>
              ) : (
                <span className="text-white/45">Free</span>
              )}
            </span>
            <span className="hidden text-sm text-white/60 sm:block">{u.total_views}</span>
            <span className="hidden text-sm sm:block">
              {u.published ? (
                <span className="text-emerald-300/80">Live</span>
              ) : (
                <span className="text-white/35">Off</span>
              )}
            </span>
            <div className="flex justify-end sm:justify-start">
              <AdminQuickActions
                profileId={u.id}
                published={u.published}
                isBlack={u.isBlack}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

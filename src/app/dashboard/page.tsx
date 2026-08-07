import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getPageByProfileId, getProfileById, getWeeklyViews } from "@/lib/data";
import { Icon } from "@/components/Icon";
import { ViewsChart } from "@/components/ViewsChart";
import { syncDiscord } from "@/app/actions/profile";

export default async function DashboardPage() {
  const session = await requireSession();
  const profile = await getProfileById(session.user.profileId);
  const page = await getPageByProfileId(session.user.profileId);

  if (!profile || !page) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="glass-card p-6">
          <h1 className="section-title text-2xl">Almost there</h1>
          <p className="help mt-2">
            Your page is still being created. Sign out and sign in again, or check Supabase
            connection.
          </p>
        </div>
      </div>
    );
  }

  const weekly = await getWeeklyViews(page.id);
  const weekTotal = weekly.reduce((sum, d) => sum + d.views, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-rise">
      <section className="glass-card p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url || "/avatar-fallback.svg"}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white/10"
            />
            <h1 className="section-title text-3xl sm:text-4xl">Overview</h1>
          </div>
          <Link href="/dashboard/account" className="btn btn-ghost text-sm">
            Account
          </Link>
        </div>

        <form
          action={async () => {
            "use server";
            await syncDiscord();
          }}
        >
          <button type="submit" className="btn btn-discord mb-5">
            <Icon name="discord" className="text-lg" glow={false} />
            Sync badges & stats with Discord
          </button>
        </form>

        <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-white/10">
          <div className="grid-stat">
            <p className="help">UID</p>
            <p className="mt-1 text-xl font-semibold">{profile.uid}</p>
          </div>
          <div className="grid-stat border-l border-white/10">
            <p className="help">Username</p>
            <p className="mt-1 text-xl font-semibold">{profile.username}</p>
          </div>
          <div className="grid-stat border-t border-white/10">
            <p className="help">Total views</p>
            <p className="mt-1 text-xl font-semibold">{page.total_views}</p>
          </div>
          <div className="grid-stat border-l border-t border-white/10">
            <p className="help">Discord</p>
            <p className="mt-1 text-xl font-semibold">
              {profile.verified ? "Verified" : "Synced"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">Total views in the last week: {weekTotal}</p>
            <span className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/60">
              Analytics
            </span>
          </div>
          <ViewsChart data={weekly} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/account"
            className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-4 transition hover:bg-white/[0.03]"
          >
            <span className="font-medium">Account</span>
            <Icon name="arrowRight" className="text-xs" />
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-4 transition hover:bg-white/[0.03]"
          >
            <span className="font-medium">Edit profile</span>
            <Icon name="arrowRight" className="text-xs" />
          </Link>
        </div>
      </section>
    </div>
  );
}

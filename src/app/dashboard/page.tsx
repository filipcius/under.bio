import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getPageByProfileId, getProfileById, getWeeklyViews } from "@/lib/data";
import { Icon } from "@/components/Icon";
import { ViewsChart } from "@/components/ViewsChart";
import { syncDiscord } from "@/app/actions/profile";
import { getPlanByProfileId } from "@/lib/subscription";
import { BlackCheckoutButton } from "@/components/BlackCheckoutButton";
import { BlackDiamond } from "@/components/BlackDiamond";
import { BLACK_NAME, BLACK_PRICE_USD } from "@/lib/plan";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ black?: string }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const profile = await getProfileById(session.user.profileId);
  const page = await getPageByProfileId(session.user.profileId);
  const plan = await getPlanByProfileId(session.user.profileId);

  if (!profile || !page) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <div className="glass-card w-full p-6 sm:p-8">
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
    <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:py-10">
      <section className="glass-card w-full p-6 sm:p-8 lg:p-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url || "/avatar-fallback.svg"}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white/10 sm:h-20 sm:w-20"
            />
            <h1 className="section-title text-3xl sm:text-4xl lg:text-5xl">Overview</h1>
          </div>
          <Link href="/dashboard/account" className="btn btn-ghost text-sm">
            Account
          </Link>
        </div>

        {sp.black && (
          <div className="mb-6 rounded-xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
            <BlackDiamond className="mr-1" />
            Checkout started - {BLACK_NAME} unlocks as soon as Stripe confirms payment (usually
            seconds).
          </div>
        )}

        {!plan.isBlack && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-sky-300/25 bg-gradient-to-r from-sky-400/[0.1] to-transparent p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-sky-200/80">
                  <BlackDiamond /> under {BLACK_NAME}
                </p>
                <p className="mt-1 font-medium text-white">
                  Full style lab · ${BLACK_PRICE_USD}/mo · cancel anytime
                </p>
              </div>
              <div className="w-full max-w-xs sm:w-56">
                <BlackCheckoutButton signedIn label={`Unlock ${BLACK_NAME}`} />
              </div>
            </div>
          </div>
        )}

        <form
          action={async () => {
            "use server";
            await syncDiscord();
          }}
        >
          <button type="submit" className="btn btn-discord mb-6 sm:max-w-md">
            <Icon name="discord" className="text-lg" glow={false} />
            Sync badges & stats with Discord
          </button>
        </form>

        <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-white/10 lg:grid-cols-4">
          <div className="grid-stat">
            <p className="help">UID</p>
            <p className="mt-1 text-xl font-semibold sm:text-2xl">{profile.uid}</p>
          </div>
          <div className="grid-stat border-l border-white/10">
            <p className="help">Username</p>
            <p className="mt-1 truncate text-xl font-semibold sm:text-2xl">{profile.username}</p>
          </div>
          <div className="grid-stat border-t border-white/10 lg:border-l lg:border-t-0">
            <p className="help">Total views</p>
            <p className="mt-1 text-xl font-semibold sm:text-2xl">{page.total_views}</p>
          </div>
          <div className="grid-stat border-l border-t border-white/10 lg:border-t-0">
            <p className="help">Discord</p>
            <p className="mt-1 text-xl font-semibold text-emerald-300 sm:text-2xl">
              {profile.verified ? "Verified" : "Synced"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-base font-medium sm:text-lg">
              Total views in the last week: {weekTotal}
            </p>
            <span className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/60">
              Analytics
            </span>
          </div>
          <div className="h-56 w-full sm:h-72">
            <ViewsChart data={weekly} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/account"
            className="flex items-center justify-between rounded-xl border border-white/10 px-5 py-5 transition hover:bg-white/[0.03]"
          >
            <span className="font-medium">Account</span>
            <Icon name="arrowRight" className="text-xs" />
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center justify-between rounded-xl border border-white/10 px-5 py-5 transition hover:bg-white/[0.03]"
          >
            <span className="font-medium">Edit profile</span>
            <Icon name="arrowRight" className="text-xs" />
          </Link>
        </div>
      </section>
    </div>
  );
}

import { requireSession } from "@/lib/session";
import { getProfileById } from "@/lib/data";
import { DashboardShell } from "@/components/DashboardShell";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getPlanByProfileId } from "@/lib/subscription";
import { BlackCheckoutButton, GiftVoidButton } from "@/components/BlackCheckoutButton";
import { ManageBillingButton } from "@/components/ManageBillingButton";
import { BlackDiamond } from "@/components/BlackDiamond";
import { BLACK_NAME, BLACK_PRICE_LINE, BLACK_PRICE_USD } from "@/lib/plan";
import Link from "next/link";

export default async function AccountPage() {
  const session = await requireSession();
  const profile = await getProfileById(session.user.profileId);
  if (!profile) redirect("/dashboard");
  const plan = await getPlanByProfileId(session.user.profileId);

  return (
    <DashboardShell title="Account" avatarUrl={profile.avatar_url} slug={profile.slug}>
      <div className="space-y-6">
        <p className="help">
          Account identity comes from Discord. Password login is not used - keep your Discord
          secure.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white/85">Invite friends</p>
              <p className="mt-1 text-sm text-white/45">
                10 new signups → 14 days free {BLACK_NAME}
              </p>
            </div>
            <Link href="/dashboard/invites" className="btn btn-ghost text-sm">
              Open invites
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-300/25 bg-gradient-to-br from-sky-400/[0.08] to-transparent p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sky-200/80">
                <BlackDiamond /> Plan
              </p>
              <p className="mt-2 section-title text-2xl">
                {plan.isBlack ? `under ${BLACK_NAME}` : "Free"}
              </p>
              <p className="mt-1 text-sm text-white/50">
                {plan.isLifetime
                  ? `Lifetime · one-time $${BLACK_PRICE_USD}`
                  : plan.isBlack && plan.periodEnd
                    ? `Active until ${new Date(plan.periodEnd).toLocaleDateString()} (timed unlock)`
                    : `Full style lab · ${BLACK_PRICE_LINE}`}
              </p>
            </div>
            <div className="flex w-full max-w-xs flex-col gap-2 sm:w-auto">
              {plan.isBlack ? (
                <>
                  {plan.periodEnd ? <ManageBillingButton /> : null}
                  <GiftVoidButton signedIn className="btn btn-ghost text-sm" />
                  <Link href="/black" className="btn btn-ghost text-sm">
                    See {BLACK_NAME} perks
                  </Link>
                </>
              ) : (
                <>
                  <BlackCheckoutButton
                    signedIn
                    label={`Get ${BLACK_NAME} · ${BLACK_PRICE_LINE}`}
                  />
                  <Link href="/black" className="text-center text-xs text-white/45 hover:text-white/70">
                    Compare Free vs {BLACK_NAME}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="label">
            <span>Email</span>
          </div>
          <input className="soft-input" value={profile.email || "Not shared by Discord"} readOnly />
        </div>

        <div>
          <div className="label">
            <span>Discord ID</span>
          </div>
          <input className="soft-input" value={profile.discord_id} readOnly />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 p-4">
            <p className="help">Username</p>
            <p className="mt-1 font-semibold">{profile.username}</p>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <p className="help">UID</p>
            <p className="mt-1 font-semibold">{profile.uid}</p>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <p className="help">Locale</p>
            <p className="mt-1 font-semibold">{profile.locale || "-"}</p>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <p className="help">Nitro / premium type</p>
            <p className="mt-1 font-semibold">{profile.premium_type ?? 0}</p>
          </div>
        </div>

        <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm">
          Discord avatar, banner, avatar decoration, and flags refresh every time you log in.
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="btn btn-danger">
            Logout
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}

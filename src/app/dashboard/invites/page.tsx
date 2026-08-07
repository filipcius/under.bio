import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getProfileById } from "@/lib/data";
import { DashboardShell } from "@/components/DashboardShell";
import { InvitePanel } from "@/components/InvitePanel";
import { getInviteDashboard } from "@/lib/referrals";

export const metadata = { title: "Invites · under.bio" };

export default async function InvitesPage() {
  const session = await requireSession();
  const profile = await getProfileById(session.user.profileId);
  if (!profile) redirect("/dashboard");

  let data;
  try {
    data = await getInviteDashboard(session.user.profileId);
  } catch {
    return (
      <DashboardShell title="Invites" avatarUrl={profile.avatar_url} slug={profile.slug}>
        <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-50/90">
          Invite tables are not ready yet. Run <code className="text-white/80">supabase/referrals.sql</code>{" "}
          in the Supabase SQL editor, then refresh.
        </p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Invites" avatarUrl={profile.avatar_url} slug={profile.slug}>
      <InvitePanel data={data} />
    </DashboardShell>
  );
}

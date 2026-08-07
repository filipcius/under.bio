import { requireSession } from "@/lib/session";
import { getPageByProfileId, getProfileById } from "@/lib/data";
import { DashboardShell } from "@/components/DashboardShell";
import { ExtrasEditor } from "@/components/forms/ExtrasEditor";
import { getPlanByProfileId } from "@/lib/subscription";
import { ensureFreePlanCompliance } from "@/app/actions/profile";
import { redirect } from "next/navigation";

export default async function ExtrasPage() {
  const session = await requireSession();
  const plan = await getPlanByProfileId(session.user.profileId);
  if (!plan.isBlack) {
    await ensureFreePlanCompliance();
  }
  const profile = await getProfileById(session.user.profileId);
  const page = await getPageByProfileId(session.user.profileId);
  if (!profile || !page) redirect("/dashboard");

  return (
    <DashboardShell title="Modules" avatarUrl={profile.avatar_url} slug={profile.slug}>
      <ExtrasEditor initial={page.config} isBlack={plan.isBlack} />
    </DashboardShell>
  );
}

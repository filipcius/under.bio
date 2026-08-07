import { requireSession } from "@/lib/session";
import { getPageByProfileId, getProfileById } from "@/lib/data";
import { DashboardShell } from "@/components/DashboardShell";
import { MiscEditor } from "@/components/forms/MiscEditor";
import { redirect } from "next/navigation";

export default async function MiscellaneousPage() {
  const session = await requireSession();
  const profile = await getProfileById(session.user.profileId);
  const page = await getPageByProfileId(session.user.profileId);
  if (!profile || !page) redirect("/dashboard");

  return (
    <DashboardShell title="Style" avatarUrl={profile.avatar_url} slug={profile.slug}>
      <MiscEditor initial={page.config} />
    </DashboardShell>
  );
}

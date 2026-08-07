import { requireSession } from "@/lib/session";
import { getPageByProfileId, getProfileById } from "@/lib/data";
import { DashboardShell } from "@/components/DashboardShell";
import { OptionsEditor } from "@/components/forms/OptionsEditor";
import { redirect } from "next/navigation";

export default async function OptionsPage() {
  const session = await requireSession();
  const profile = await getProfileById(session.user.profileId);
  const page = await getPageByProfileId(session.user.profileId);
  if (!profile || !page) redirect("/dashboard");

  return (
    <DashboardShell title="Visibility" avatarUrl={profile.avatar_url} slug={profile.slug}>
      <OptionsEditor initial={page.config} />
    </DashboardShell>
  );
}

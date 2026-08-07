import { requireSession } from "@/lib/session";
import { getPageByProfileId, getProfileById } from "@/lib/data";
import { DashboardShell } from "@/components/DashboardShell";
import { ProfileEditor } from "@/components/forms/ProfileEditor";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await requireSession();
  const profile = await getProfileById(session.user.profileId);
  const page = await getPageByProfileId(session.user.profileId);
  if (!profile || !page) redirect("/dashboard");

  return (
    <DashboardShell title="Identity" avatarUrl={profile.avatar_url} slug={profile.slug}>
      <ProfileEditor initial={page.config} slug={profile.slug} />
    </DashboardShell>
  );
}

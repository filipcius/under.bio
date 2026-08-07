import { requireSession } from "@/lib/session";
import { getPageByProfileId, getProfileById } from "@/lib/data";
import { DashboardShell } from "@/components/DashboardShell";
import { MiscEditor } from "@/components/forms/MiscEditor";
import { getPlanByProfileId } from "@/lib/subscription";
import { ensureFreePlanCompliance } from "@/app/actions/profile";
import { profileDecorationAsset } from "@/lib/discord";
import { discordAvatarDecorationUrl } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function MiscellaneousPage() {
  const session = await requireSession();
  const plan = await getPlanByProfileId(session.user.profileId);
  if (!plan.isBlack) {
    await ensureFreePlanCompliance();
  }

  const profile = await getProfileById(session.user.profileId);
  const page = await getPageByProfileId(session.user.profileId);
  if (!profile || !page) redirect("/dashboard");

  return (
    <DashboardShell
      title="Style"
      avatarUrl={profile.avatar_url}
      slug={profile.slug}
      wide
    >
      <MiscEditor
        initial={page.config}
        isBlack={plan.isBlack}
        avatarUrl={profile.avatar_url}
        avatarDecorationUrl={discordAvatarDecorationUrl(profileDecorationAsset(profile))}
        uid={profile.uid}
        discordUsername={profile.global_name || profile.username || profile.slug}
      />
    </DashboardShell>
  );
}

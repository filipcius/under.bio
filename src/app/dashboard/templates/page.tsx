import { requireSession } from "@/lib/session";
import { DashboardShell } from "@/components/DashboardShell";
import { getProfileById } from "@/lib/data";
import { redirect } from "next/navigation";
import {
  getPublishEligibility,
  listMyThemeTemplates,
  listThemeTemplates,
} from "@/app/actions/templates";
import { TemplatesBrowser } from "@/components/TemplatesBrowser";

export const metadata = { title: "Templates · under.bio" };

export default async function DashboardTemplatesPage() {
  const session = await requireSession();
  const profile = await getProfileById(session.user.profileId);
  if (!profile) redirect("/dashboard");

  const [themes, mine, eligibility] = await Promise.all([
    listThemeTemplates({ sort: "popular", limit: 60 }),
    listMyThemeTemplates(),
    getPublishEligibility(),
  ]);

  return (
    <DashboardShell
      title="Templates"
      avatarUrl={profile.avatar_url}
      slug={profile.slug}
      wide
    >
      <p className="help mb-6 max-w-2xl">
        Browse community styles, apply one to your page, or publish your current look for review.
      </p>
      <TemplatesBrowser
        mode="dashboard"
        themes={themes}
        mine={mine}
        signedIn
        canPublish={eligibility.canPublish}
        publishReason={eligibility.reason}
        daysLeft={eligibility.daysLeft}
        myCount={eligibility.count}
      />
    </DashboardShell>
  );
}

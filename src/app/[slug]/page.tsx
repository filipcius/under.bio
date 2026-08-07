import { notFound } from "next/navigation";
import { getPageByProfileId, getProfileBySlug } from "@/lib/data";
import { maybeRecordPageView, getViewRank } from "@/lib/views";
import { PublicProfile } from "@/components/PublicProfile";
import { OWNER_DISCORD_IDS } from "@/lib/socials";
import { enforceFreePlanConfig, hasBlack } from "@/lib/plan";
import type { Metadata } from "next";

const reserved = new Set([
  "api",
  "login",
  "dashboard",
  "auth",
  "terms",
  "privacy",
  "faq",
  "templates",
  "shop",
  "black",
  "admin",
  "_next",
]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (reserved.has(slug.toLowerCase())) return {};
  const profile = await getProfileBySlug(slug);
  if (!profile) return { title: "Not found · under.bio" };
  const page = await getPageByProfileId(profile.id);
  return {
    title: page?.config.meta.pageTitle || `${profile.slug} · under.bio`,
    description: page?.config.meta.description || "under.bio profile",
  };
}

export default async function PublicSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (reserved.has(slug.toLowerCase())) notFound();

  const profile = await getProfileBySlug(slug);
  if (!profile) notFound();

  const page = await getPageByProfileId(profile.id);
  if (!page || !page.published) notFound();

  let counted = false;
  try {
    const result = await maybeRecordPageView(page.id, profile.discord_id);
    counted = result.counted;
  } catch {
    // analytics should never break the page
  }

  const totalViews = page.total_views + (counted ? 1 : 0);
  const black = hasBlack(
    profile.plan,
    profile.plan_status,
    profile.plan_period_end,
  );
  const config = black ? page.config : enforceFreePlanConfig(page.config);
  const rank = config.options.showRank ? await getViewRank(totalViews) : null;

  return (
    <PublicProfile
      config={config}
      avatarUrl={profile.avatar_url}
      uid={profile.uid}
      totalViews={totalViews}
      rank={rank}
      joinedAt={profile.created_at}
      discordUsername={profile.username}
      isOwner={OWNER_DISCORD_IDS.has(profile.discord_id)}
      discordVerified={Boolean(profile.verified)}
      isBlack={black}
    />
  );
}

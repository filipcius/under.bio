import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { DashboardChrome } from "@/components/DashboardSidebar";
import { requireAdmin } from "@/lib/admin";
import { getProfileById } from "@/lib/data";
import { profileDecorationAsset } from "@/lib/discord";
import { discordAvatarDecorationUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin · under.bio",
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const profile = await getProfileById(session.user.profileId);
  const decorationUrl = discordAvatarDecorationUrl(
    profile ? profileDecorationAsset(profile) : null,
  );

  return (
    <DashboardChrome
      user={{
        name: session.user.name,
        image: profile?.avatar_url || session.user.image,
        decorationUrl,
        slug: session.user.slug,
      }}
      isAdmin
    >
      {children}
      <Footer />
    </DashboardChrome>
  );
}

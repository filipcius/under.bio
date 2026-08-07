import { auth } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardChrome } from "@/components/DashboardSidebar";
import { VoidShop } from "@/components/VoidShop";
import { BLACK_NAME } from "@/lib/plan";
import { getPlanByProfileId } from "@/lib/subscription";
import { isAdminDiscordId } from "@/lib/admin-ids";

export const metadata = {
  title: `under ${BLACK_NAME} · lifetime`,
  description: "Unlock under.bio VOID forever. One-time payment. Gift it to a friend.",
};

export default async function BlackPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const session = await auth().catch(() => null);
  const sp = await searchParams;
  const plan = session?.user?.profileId
    ? await getPlanByProfileId(session.user.profileId)
    : null;

  const body = (
    <>
      <main className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(125,211,252,0.08),transparent_35%)]" />
        <VoidShop
          signedIn={Boolean(session?.user)}
          isVoid={Boolean(plan?.isBlack)}
          isLifetime={Boolean(plan?.isLifetime)}
          canceled={Boolean(sp.canceled)}
        />
      </main>
      <Footer />
    </>
  );

  if (session?.user?.profileId) {
    return (
      <DashboardChrome
        user={{
          name: session.user.name,
          image: session.user.image,
          slug: session.user.slug,
        }}
        isAdmin={isAdminDiscordId(session.user.discordId)}
      >
        {body}
      </DashboardChrome>
    );
  }

  return (
    <>
      <Navbar />
      {body}
    </>
  );
}

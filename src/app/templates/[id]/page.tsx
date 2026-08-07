import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getThemeTemplateById } from "@/app/actions/templates";
import {
  buildThemePreviewConfig,
  parseStyleConfig,
} from "@/lib/theme-template";
import { PublicProfile } from "@/components/PublicProfile";
import { ThemeShareOverlay } from "@/components/ThemeShareOverlay";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const theme = await getThemeTemplateById(id);
  if (!theme) return { title: "Theme · under.bio" };
  return {
    title: `${theme.name} · theme · under.bio`,
    description: theme.description || `Preview the ${theme.name} theme on under.bio`,
  };
}

export default async function ThemePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [theme, session] = await Promise.all([
    getThemeTemplateById(id),
    auth().catch(() => null),
  ]);
  if (!theme) notFound();

  const style = parseStyleConfig(theme.config);
  if (!style) notFound();

  const config = buildThemePreviewConfig(style, theme.name);
  const signedIn = Boolean(session?.user?.profileId);

  return (
    <div className="relative h-dvh overflow-hidden bg-black">
      <div className="h-full w-full">
        <PublicProfile
          config={config}
          avatarUrl={theme.author_avatar || "/avatar-fallback.svg"}
          uid={0}
          totalViews={theme.uses_count}
          rank={null}
          joinedAt={theme.created_at}
          discordUsername={theme.author_slug || "preview"}
          isOwner={false}
          discordVerified={false}
          isBlack
          preview
        />
      </div>
      <ThemeShareOverlay theme={theme} signedIn={signedIn} startOpen />
      <div className="pointer-events-none fixed left-4 top-4 z-50 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/50 backdrop-blur">
        Theme preview
      </div>
    </div>
  );
}

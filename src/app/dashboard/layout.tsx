import { Footer } from "@/components/Footer";
import { DashboardChrome } from "@/components/DashboardSidebar";
import { requireSession } from "@/lib/session";
import { isAdminDiscordId } from "@/lib/admin-ids";
import { getProfileById } from "@/lib/data";
import {
  decorationAssetFromUser,
  enrichDiscordUser,
  fetchGuildMember,
  mapDiscordProfile,
  profileDecorationAsset,
} from "@/lib/discord";
import { createAdminClient } from "@/lib/supabase/admin";
import { discordAvatarDecorationUrl } from "@/lib/utils";

/** Pull decoration from Discord bot if DB is stale (no re-login needed). */
async function ensureDecorationSynced(profileId: string, discordId: string) {
  const profile = await getProfileById(profileId);
  if (!profile) return null;
  if (profileDecorationAsset(profile)) return profile;

  try {
    const member = await fetchGuildMember(discordId);
    if (!member?.user) return profile;
    const user = await enrichDiscordUser(member.user);
    const asset = decorationAssetFromUser(user);
    if (!asset) return profile;

    const mapped = mapDiscordProfile(user);
    const admin = createAdminClient();
    const payload = {
      avatar_url: mapped.avatar_url,
      avatar_hash: mapped.avatar_hash,
      avatar_decoration_asset: mapped.avatar_decoration_asset,
      discord_raw: mapped.discord_raw,
      global_name: mapped.global_name,
      username: mapped.username,
    };
    let { error } = await admin.from("profiles").update(payload).eq("id", profileId);
    if (error) {
      const { avatar_decoration_asset: _d, ...rest } = payload;
      await admin.from("profiles").update(rest).eq("id", profileId);
    }
    return (await getProfileById(profileId)) ?? profile;
  } catch {
    return profile;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const profile = await ensureDecorationSynced(
    session.user.profileId,
    session.user.discordId,
  );
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
      isAdmin={isAdminDiscordId(session.user.discordId)}
    >
      {children}
      <Footer />
    </DashboardChrome>
  );
}

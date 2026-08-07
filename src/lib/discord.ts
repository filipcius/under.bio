import { getServerEnv } from "@/lib/env";
import { discordAvatarUrl, discordBannerUrl, slugify } from "@/lib/utils";

export type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  banner?: string | null;
  accent_color?: number | null;
  email?: string | null;
  discriminator?: string;
  locale?: string;
  verified?: boolean;
  mfa_enabled?: boolean;
  premium_type?: number;
  public_flags?: number;
};

export async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Discord profile");
  }

  return res.json();
}

/** Hard gate: bot must see the member in the required guild */
export async function isGuildMember(discordUserId: string): Promise<boolean> {
  const env = getServerEnv();
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/members/${discordUserId}`,
    {
      headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` },
      cache: "no-store",
    },
  );

  if (res.status === 404) return false;
  if (!res.ok) {
    throw new Error("Discord guild membership check failed");
  }
  return true;
}

export function mapDiscordProfile(user: DiscordUser) {
  const baseSlug = slugify(user.username) || `user${user.id.slice(-6)}`;
  return {
    discord_id: user.id,
    username: user.username,
    global_name: user.global_name ?? user.username,
    avatar_hash: user.avatar ?? null,
    avatar_url: discordAvatarUrl(user.id, user.avatar),
    banner_url: discordBannerUrl(user.id, user.banner),
    accent_color: user.accent_color ?? null,
    email: user.email ?? null,
    discriminator: user.discriminator ?? "0",
    locale: user.locale ?? null,
    verified: user.verified ?? false,
    mfa_enabled: user.mfa_enabled ?? false,
    premium_type: user.premium_type ?? 0,
    public_flags: user.public_flags ?? 0,
    suggested_slug: baseSlug.slice(0, 25),
    discord_raw: user as unknown as Record<string, unknown>,
  };
}

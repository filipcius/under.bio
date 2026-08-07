import { getServerEnv } from "@/lib/env";
import { discordAvatarUrl, discordBannerUrl, slugify } from "@/lib/utils";

export type DiscordAvatarDecorationData = {
  asset: string;
  sku_id?: string;
  expires_at?: number | null;
};

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
  avatar_decoration_data?: DiscordAvatarDecorationData | null;
  /** Legacy field — some payloads still use this hash string */
  avatar_decoration?: string | null;
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

type GuildMemberPayload = {
  user?: DiscordUser;
  avatar?: string | null;
};

/** Bot fetch — includes avatar_decoration_data on the nested user. */
export async function fetchGuildMember(
  discordUserId: string,
): Promise<GuildMemberPayload | null> {
  const env = getServerEnv();
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/members/${discordUserId}`,
    {
      headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` },
      cache: "no-store",
    },
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error("Discord guild membership check failed");
  }
  return res.json();
}

/** Hard gate: bot must see the member in the required guild */
export async function isGuildMember(discordUserId: string): Promise<boolean> {
  const member = await fetchGuildMember(discordUserId);
  return Boolean(member?.user?.id);
}

/** Enrich OAuth @me user with guild member fields Discord sometimes omits. */
export async function enrichDiscordUser(user: DiscordUser): Promise<DiscordUser> {
  try {
    const member = await fetchGuildMember(user.id);
    const fromGuild = member?.user;
    if (!fromGuild) return user;

    const decoration =
      user.avatar_decoration_data ??
      fromGuild.avatar_decoration_data ??
      (fromGuild.avatar_decoration
        ? { asset: fromGuild.avatar_decoration }
        : null);

    return {
      ...fromGuild,
      ...user,
      // Prefer fresh @me identity, but keep decoration / flags from richest source
      avatar_decoration_data: decoration,
      banner: user.banner ?? fromGuild.banner ?? null,
      accent_color: user.accent_color ?? fromGuild.accent_color ?? null,
      public_flags: user.public_flags ?? fromGuild.public_flags ?? 0,
      premium_type: user.premium_type ?? fromGuild.premium_type ?? 0,
    };
  } catch {
    return user;
  }
}

export function decorationAssetFromUser(user: DiscordUser | null | undefined): string | null {
  if (!user) return null;
  if (user.avatar_decoration_data?.asset) return user.avatar_decoration_data.asset;
  if (typeof user.avatar_decoration === "string" && user.avatar_decoration.length > 0) {
    return user.avatar_decoration;
  }
  return null;
}

export function mapDiscordProfile(user: DiscordUser) {
  const baseSlug = slugify(user.username) || `user${user.id.slice(-6)}`;
  const decorationAsset = decorationAssetFromUser(user);
  return {
    discord_id: user.id,
    username: user.username,
    global_name: user.global_name ?? user.username,
    avatar_hash: user.avatar ?? null,
    avatar_url: discordAvatarUrl(user.id, user.avatar),
    banner_url: discordBannerUrl(user.id, user.banner),
    avatar_decoration_asset: decorationAsset,
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

/** Prefer synced column; fall back to last Discord payload. */
export function profileDecorationAsset(profile: {
  avatar_decoration_asset?: string | null;
  discord_raw?: Record<string, unknown> | null;
}): string | null {
  if (profile.avatar_decoration_asset) return profile.avatar_decoration_asset;
  const raw = profile.discord_raw;
  if (!raw || typeof raw !== "object") return null;

  const data = raw.avatar_decoration_data;
  if (data && typeof data === "object" && data !== null && "asset" in data) {
    const asset = (data as { asset?: unknown }).asset;
    if (typeof asset === "string" && asset.length > 0) return asset;
  }

  const legacy = raw.avatar_decoration;
  if (typeof legacy === "string" && legacy.length > 0) return legacy;

  return null;
}

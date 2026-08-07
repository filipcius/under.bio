export function extractInviteCode(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  if (/^[a-zA-Z0-9-]+$/.test(raw)) return raw;

  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "discord.gg") {
      const code = url.pathname.split("/").filter(Boolean)[0];
      return code || null;
    }
    if (host === "discord.com" || host === "discordapp.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      const inviteIdx = parts.findIndex((p) => p === "invite");
      if (inviteIdx >= 0 && parts[inviteIdx + 1]) return parts[inviteIdx + 1];
    }
  } catch {
    return null;
  }

  return null;
}

export type DiscordInviteInfo = {
  code: string;
  title: string;
  image: string;
  online: number;
  members: number;
  inviteUrl: string;
};

export async function fetchDiscordInvite(code: string): Promise<DiscordInviteInfo | null> {
  const res = await fetch(
    `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true&with_expiration=true`,
    {
      headers: {
        "User-Agent": "under.bio (profile showcase)",
        ...(process.env.DISCORD_BOT_TOKEN
          ? { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
          : {}),
      },
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) return null;
  const data = await res.json();
  const guild = data.guild;
  if (!guild?.id) return null;

  const icon = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${
        String(guild.icon).startsWith("a_") ? "gif" : "png"
      }?size=128`
    : "/avatar-fallback.svg";

  return {
    code: data.code || code,
    title: guild.name || "Discord Server",
    image: icon,
    online: Number(data.approximate_presence_count ?? 0),
    members: Number(data.approximate_member_count ?? 0),
    inviteUrl: `https://discord.gg/${data.code || code}`,
  };
}

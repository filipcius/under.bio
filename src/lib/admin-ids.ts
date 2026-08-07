import { OWNER_DISCORD_IDS } from "@/lib/socials";

/** Edge-safe owner check (middleware). Server actions use requireAdmin() for full gate. */
export function isAdminDiscordId(discordId?: string | null) {
  return Boolean(discordId && OWNER_DISCORD_IDS.has(discordId));
}

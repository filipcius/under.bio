import { BLACK_NAME, BLACK_PRICE_USD } from "@/lib/plan";

/** Notify Discord channel on new under VOID checkout (Vercel-safe HTTP POST). */
export async function notifyDiscordSubscription(input: {
  profileId?: string | null;
  discordId?: string | null;
  slug?: string | null;
  email?: string | null;
  customerId?: string | null;
}) {
  const url = process.env.DISCORD_SUB_WEBHOOK_URL?.trim();
  if (!url?.startsWith("https://discord.com/api/webhooks/")) return;

  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://under.bio").replace(
    /\/$/,
    "",
  );
  const slug = input.slug || "unknown";

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: `New under ${BLACK_NAME} subscriber`,
            description: `Someone unlocked **under ${BLACK_NAME}** ($${BLACK_PRICE_USD}/mo).`,
            color: 0x7dd3fc,
            fields: [
              { name: "Page", value: `${site}/${slug}`, inline: false },
              {
                name: "Discord",
                value: input.discordId ? `<@${input.discordId}> \`${input.discordId}\`` : "-",
                inline: true,
              },
              {
                name: "Email",
                value: input.email || "-",
                inline: true,
              },
              {
                name: "Profile ID",
                value: input.profileId ? `\`${input.profileId}\`` : "-",
                inline: false,
              },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "under.bio · Stripe" },
          },
        ],
      }),
    });
  } catch (err) {
    console.error("Discord sub webhook failed", err);
  }
}

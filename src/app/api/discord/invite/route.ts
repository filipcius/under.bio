import { NextResponse } from "next/server";
import { extractInviteCode, fetchDiscordInvite } from "@/lib/discord-invite";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("code") || searchParams.get("url") || "";
  const code = extractInviteCode(raw);

  if (!code) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 400 });
  }

  const info = await fetchDiscordInvite(code);
  if (!info) {
    return NextResponse.json({ error: "Invite not found or expired" }, { status: 404 });
  }

  return NextResponse.json(info, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}

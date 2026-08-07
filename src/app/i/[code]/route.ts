import { NextResponse } from "next/server";
import {
  INVITE_COOKIE,
  INVITE_COOKIE_MAX_AGE,
  normalizeInviteCode,
} from "@/lib/referrals";
import { createAdminClient } from "@/lib/supabase/admin";

const isProd =
  process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code: raw } = await ctx.params;
  const code = normalizeInviteCode(raw);
  const url = new URL(req.url);
  const login = new URL("/login", url.origin);

  if (!code) {
    login.searchParams.set("error", "bad_invite");
    return NextResponse.redirect(login);
  }

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("invite_code", code)
      .maybeSingle();

    if (!data) {
      login.searchParams.set("error", "bad_invite");
      return NextResponse.redirect(login);
    }
  } catch {
    login.searchParams.set("error", "bad_invite");
    return NextResponse.redirect(login);
  }

  login.searchParams.set("ref", code);
  login.searchParams.set("next", "/dashboard");

  const res = NextResponse.redirect(login);
  res.cookies.set(INVITE_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: INVITE_COOKIE_MAX_AGE,
    ...(isProd ? { domain: ".under.bio" } : {}),
  });
  return res;
}

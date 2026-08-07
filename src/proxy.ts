import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAdminDiscordId } from "@/lib/admin-ids";

/**
 * Lightweight admin gate only. Real auth lives in requireAdmin() (layout).
 * Do NOT import @/lib/auth here — bundling NextAuth + Supabase into proxy
 * caused production 500s on /admin.
 */
export async function proxy(req: NextRequest) {
  try {
    const path = req.nextUrl.pathname;
    if (!path.startsWith("/admin")) {
      return NextResponse.next();
    }

    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      return NextResponse.redirect(new URL("/login?next=/admin", req.url));
    }

    const token = await getToken({
      req,
      secret,
      secureCookie: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
    });

    if (!token) {
      const login = new URL("/login", req.url);
      login.searchParams.set("next", "/admin");
      return NextResponse.redirect(login);
    }

    const discordId =
      typeof token.discordId === "string" ? token.discordId : undefined;
    if (!isAdminDiscordId(discordId)) {
      return new NextResponse("Not Found", {
        status: 404,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "private, no-store",
          "x-robots-tag": "noindex, nofollow",
        },
      });
    }

    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.headers.set("Cache-Control", "private, no-store, max-age=0");
    res.headers.set("Referrer-Policy", "no-referrer");
    return res;
  } catch (err) {
    console.error("[proxy:admin]", err);
    return NextResponse.redirect(new URL("/login?next=/admin", req.url));
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminDiscordId } from "@/lib/admin-ids";

/** Admin-only gate. Matcher excludes /api/auth so OAuth cookies are untouched. */
export default auth((req) => {
  const path = req.nextUrl.pathname;
  if (!path.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!req.auth?.user) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("next", "/admin");
    return NextResponse.redirect(login);
  }

  if (!isAdminDiscordId(req.auth.user.discordId)) {
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
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

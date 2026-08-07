"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { BlackDiamond } from "@/components/BlackDiamond";
import { DISCORD_INVITE_URL } from "@/lib/site";

/**
 * Public / marketing navbar.
 * Logged-in dashboard chrome lives in DashboardSidebar — do not pack editor links here.
 */
export function Navbar({
  user,
  isAdmin = false,
}: {
  user?: {
    name?: string | null;
    image?: string | null;
    slug?: string;
  } | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    for (const href of ["/dashboard", "/dashboard/account", "/black", "/templates"]) {
      router.prefetch(href);
    }
  }, [user, router]);

  function go(href: string) {
    if (href === pathname) return;
    setPendingHref(href);
    setOpen(false);
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href={user ? "/dashboard" : "/"}
          prefetch
          onClick={(e) => {
            if (!user) return;
            e.preventDefault();
            go("/dashboard");
          }}
          className="section-title text-xl tracking-tight"
        >
          under<span className="text-white/40">.</span>bio
        </Link>

        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-white/10 p-0.5 pr-2 transition hover:border-white/25"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.image || "/avatar-fallback.svg"}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="hidden max-w-[100px] truncate text-sm text-white/70 sm:block">
                {user.name}
              </span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#121212] shadow-2xl animate-rise">
                <div className="border-b border-white/5 px-4 py-3">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-white/45">under.bio/{user.slug}</p>
                </div>
                <Link
                  href="/dashboard"
                  prefetch
                  className="block px-4 py-2.5 text-sm text-white/80 hover:bg-white/5"
                  onClick={(e) => {
                    e.preventDefault();
                    go("/dashboard");
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  href="/black"
                  prefetch
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-sky-200 hover:bg-white/5"
                  onClick={(e) => {
                    e.preventDefault();
                    go("/black");
                  }}
                >
                  <BlackDiamond /> VOID
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    prefetch
                    className="block px-4 py-2.5 text-sm text-white/80 hover:bg-white/5"
                    onClick={(e) => {
                      e.preventDefault();
                      go("/admin");
                    }}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard/account"
                  prefetch
                  className="block px-4 py-2.5 text-sm text-white/80 hover:bg-white/5"
                  onClick={(e) => {
                    e.preventDefault();
                    go("/dashboard/account");
                  }}
                >
                  Account
                </Link>
                <a
                  href="/api/auth/logout"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-300 hover:bg-white/5"
                >
                  <Icon name="logout" className="text-xs" />
                  Logout
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/black"
              prefetch
              className="btn btn-ghost !h-9 !px-3 !text-sm text-sky-100"
            >
              <BlackDiamond className="scale-90" />
              Upgrade VOID
            </Link>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost !h-9 !px-3 !text-sm"
              aria-label="Join Discord"
            >
              <Icon name="discord" className="text-sm" glow={false} />
              <span className="hidden sm:inline">Discord</span>
            </a>
            <Link
              href="/login"
              prefetch
              className="btn btn-primary !h-9 !px-3.5 !text-sm !text-[#0a0a0a]"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

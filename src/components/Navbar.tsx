"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { BlackDiamond } from "@/components/BlackDiamond";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Identity" },
  { href: "/dashboard/options", label: "Visibility" },
  { href: "/dashboard/miscellaneous", label: "Style" },
  { href: "/dashboard/extras", label: "Modules" },
  { href: "/black", label: "VOID" },
];

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
  const navLinks = isAdmin
    ? [...links, { href: "/admin", label: "Admin" }]
    : links;

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    const hrefs = [
      ...links.map((l) => l.href),
      ...(isAdmin ? ["/admin"] : []),
      "/dashboard/account",
    ];
    for (const href of hrefs) router.prefetch(href);
  }, [user, router, isAdmin]);

  const activePath = pendingHref || pathname;

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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
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
          <>
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => {
                const active =
                  activePath === link.href ||
                  (link.href !== "/dashboard" && activePath.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch
                    onClick={(e) => {
                      e.preventDefault();
                      go(link.href);
                    }}
                    className={cn(
                      "nav-link inline-flex items-center gap-1 text-sm transition-colors duration-150",
                      pendingHref === link.href && "text-white",
                    )}
                    data-active={active}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.href === "/black" && <BlackDiamond />}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

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
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#121212] shadow-2xl animate-rise">
                  <div className="border-b border-white/5 px-4 py-3">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-white/45">under.bio/{user.slug}</p>
                  </div>
                  <Link
                    href="/black"
                    prefetch
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-sky-200 hover:bg-white/5"
                    onClick={(e) => {
                      e.preventDefault();
                      go("/black");
                    }}
                  >
                    <BlackDiamond /> Get VOID
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
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/black"
              prefetch
              className="hidden items-center gap-1.5 rounded-full border border-sky-300/25 px-3 py-1.5 text-xs text-sky-100 sm:inline-flex"
            >
              <BlackDiamond /> VOID
            </Link>
            <Link href="/login" prefetch className="btn btn-primary text-sm">
              Sign in
            </Link>
          </div>
        )}
      </div>

      {user && (
        <div className="flex gap-4 overflow-x-auto border-t border-white/5 px-4 py-2 md:hidden">
          {navLinks.map((link) => {
            const active =
              activePath === link.href ||
              (link.href !== "/dashboard" && activePath.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                onClick={(e) => {
                  e.preventDefault();
                  go(link.href);
                }}
                className={cn(
                  "whitespace-nowrap text-xs transition-colors duration-150",
                  active ? "text-white" : "text-white/45",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

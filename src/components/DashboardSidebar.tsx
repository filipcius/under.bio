"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { BlackDiamond } from "@/components/BlackDiamond";
import { Icon } from "@/components/Icon";
import {
  DashboardUserProvider,
  DashboardAvatar,
} from "@/components/DashboardUserContext";
import { DISCORD_INVITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  match: (path: string) => boolean;
};

const primary: Item[] = [
  {
    href: "/dashboard",
    label: "Overview",
    match: (p) => p === "/dashboard",
  },
  {
    href: "/dashboard/profile",
    label: "Identity",
    match: (p) => p.startsWith("/dashboard/profile"),
  },
  {
    href: "/dashboard/options",
    label: "Visibility",
    match: (p) => p.startsWith("/dashboard/options"),
  },
  {
    href: "/dashboard/miscellaneous",
    label: "Style",
    match: (p) => p.startsWith("/dashboard/miscellaneous"),
  },
  {
    href: "/dashboard/extras",
    label: "Modules",
    match: (p) => p.startsWith("/dashboard/extras"),
  },
];

const secondary: Item[] = [
  {
    href: "/dashboard/templates",
    label: "Templates",
    match: (p) =>
      p.startsWith("/dashboard/templates") || p.startsWith("/templates"),
  },
  {
    href: "/dashboard/invites",
    label: "Invites",
    match: (p) => p.startsWith("/dashboard/invites"),
  },
];

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: Item;
  active: boolean;
  onNavigate: (href: string) => void;
}) {
  return (
    <Link
      href={item.href}
      prefetch
      onClick={(e) => {
        e.preventDefault();
        onNavigate(item.href);
      }}
      className={cn(
        "flex items-center rounded-md px-2 py-[7px] text-[13px] transition",
        active
          ? "bg-white/[0.07] text-white"
          : "text-white/40 hover:text-white/75",
      )}
      aria-current={active ? "page" : undefined}
    >
      {item.label}
    </Link>
  );
}

export function DashboardSidebar({
  user,
  isAdmin = false,
}: {
  user: {
    name?: string | null;
    image?: string | null;
    decorationUrl?: string | null;
    slug?: string;
  };
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const extra: Item[] = isAdmin
    ? [
        {
          href: "/admin",
          label: "Admin",
          match: (p) => p.startsWith("/admin"),
        },
      ]
    : [];

  useEffect(() => {
    setPendingHref(null);
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    for (const href of [
      ...primary,
      ...secondary,
      ...extra,
      { href: "/dashboard/account" },
    ].map((i) => i.href)) {
      router.prefetch(href);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, isAdmin]);

  const activePath = pendingHref || pathname;

  function go(href: string) {
    if (href === pathname) {
      setOpen(false);
      return;
    }
    setPendingHref(href);
    setOpen(false);
    startTransition(() => {
      router.push(href);
    });
  }

  const sidebar = (
    <aside className="flex h-full w-[200px] flex-col border-r border-white/[0.05] bg-[#090909]">
      <div className="px-4 pb-4 pt-5">
        <Link
          href="/dashboard"
          prefetch
          onClick={(e) => {
            e.preventDefault();
            go("/dashboard");
          }}
          className="section-title text-[17px] tracking-tight"
        >
          under<span className="text-white/35">.</span>bio
        </Link>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-2.5">
        <div className="space-y-0.5">
          {primary.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={item.match(activePath)}
              onNavigate={go}
            />
          ))}
        </div>

        <div className="mx-2 border-t border-white/[0.06]" />

        <div className="space-y-0.5">
          {[...secondary, ...extra].map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={item.match(activePath)}
              onNavigate={go}
            />
          ))}
        </div>
      </nav>

      <div className="space-y-2.5 border-t border-white/[0.05] p-3">
        <Link
          href="/black"
          prefetch
          onClick={(e) => {
            e.preventDefault();
            go("/black");
          }}
          className={cn(
            "flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[13px] font-medium transition",
            activePath.startsWith("/black")
              ? "border-sky-300/35 bg-sky-400/15 text-sky-50"
              : "border-sky-300/20 bg-sky-400/[0.08] text-sky-100/90 hover:border-sky-300/35 hover:bg-sky-400/[0.14]",
          )}
        >
          <BlackDiamond className="scale-90" />
          Upgrade to VOID
        </Link>

        <Link
          href="/dashboard/account"
          prefetch
          onClick={(e) => {
            e.preventDefault();
            go("/dashboard/account");
          }}
          className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 transition hover:bg-white/[0.04]"
        >
          <DashboardAvatar size={28} avatarUrl={user.image} />
          <div className="min-w-0">
            <p className="truncate text-[13px] text-white/80">{user.name}</p>
            <p className="truncate text-[11px] text-white/30">Account</p>
          </div>
        </Link>

        <div className="flex items-center gap-1 px-0.5">
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] text-[#5865F2]/90 transition hover:bg-white/[0.04]"
          >
            <Icon name="discord" className="text-[11px]" glow={false} />
            Discord
          </a>
          <a
            href="/api/auth/logout"
            className="inline-flex flex-1 items-center justify-center rounded-lg px-2 py-1.5 text-[12px] text-white/35 transition hover:bg-white/[0.04] hover:text-white/60"
          >
            Log out
          </a>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-12 items-center gap-3 border-b border-white/[0.05] bg-[#090909]/95 px-3 backdrop-blur md:hidden">
        <button
          type="button"
          className="text-[13px] text-white/55 transition hover:text-white"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          Menu
        </button>
        <span className="section-title text-[15px] tracking-tight">
          under<span className="text-white/35">.</span>bio
        </span>
      </div>

      <div className="fixed inset-y-0 left-0 z-40 hidden md:block">{sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/65"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 shadow-2xl">{sidebar}</div>
        </div>
      )}
    </>
  );
}

export function DashboardChrome({
  user,
  isAdmin = false,
  children,
}: {
  user: {
    name?: string | null;
    image?: string | null;
    decorationUrl?: string | null;
    slug?: string;
  };
  isAdmin?: boolean;
  children: React.ReactNode;
}) {
  return (
    <DashboardUserProvider user={user}>
      <div className="flex min-h-dvh flex-col md:pl-[200px]">
        <DashboardSidebar user={user} isAdmin={isAdmin} />
        <div className="flex min-h-dvh min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </DashboardUserProvider>
  );
}

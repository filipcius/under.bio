import Link from "next/link";
import { Icon } from "@/components/Icon";
import { DashboardAvatar } from "@/components/DashboardUserContext";

export function DashboardShell({
  title,
  avatarUrl,
  slug,
  children,
  actions,
  wide = false,
}: {
  title: string;
  avatarUrl?: string | null;
  slug: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  wide?: boolean;
}) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "under.bio").replace(
    /^https?:\/\//,
    "",
  );

  const header = (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <DashboardAvatar
        size={64}
        avatarUrl={avatarUrl}
        ringClassName="ring-2 ring-white/10"
      />
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <h1 className="section-title text-3xl sm:text-4xl">{title}</h1>
        {actions}
      </div>
    </div>
  );

  return (
    <div
      className={`mx-auto w-full min-w-0 px-4 py-8 ${wide ? "max-w-7xl" : "max-w-4xl"}`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className="btn btn-ghost text-sm">
          <Icon name="arrowLeft" className="text-xs" />
          Back
        </Link>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
          <span className="text-white/70">
            {site}/{slug}
          </span>
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-1.5 hover:bg-white/10"
            title="Open profile"
          >
            <Icon name="external" className="text-xs" />
          </a>
        </div>
      </div>

      {/* Wide layouts keep children outside glass-card so sticky preview works
          (backdrop-filter on glass-card breaks position:sticky). */}
      {wide ? (
        <>
          <section className="glass-card mb-6 w-full p-5 sm:p-7">{header}</section>
          <div className="w-full min-w-0">{children}</div>
        </>
      ) : (
        <section className="glass-card w-full p-5 sm:p-7">
          {header}
          <div className="w-full min-w-0">{children}</div>
        </section>
      )}
    </div>
  );
}

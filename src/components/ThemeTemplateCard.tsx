"use client";

import Link from "next/link";
import type { ThemeTemplateListItem } from "@/app/actions/templates";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export function ThemeTemplateCard({
  theme,
  onApply,
  onDelete,
  applying,
  showStatus,
  className,
}: {
  theme: ThemeTemplateListItem;
  onApply?: () => void;
  onDelete?: () => void;
  applying?: boolean;
  showStatus?: boolean;
  className?: string;
}) {
  const p = theme.preview || {
    primary: "#FFFFFF",
    secondary: "#AAAAAA",
    bg: "#0A0A0A",
    accent: "#7DD3FC",
    font: "sans",
    box: "#141414",
  };

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0c]",
        className,
      )}
    >
      <div
        className="relative aspect-[5/4] w-full overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${p.bg}, ${p.box} 60%, ${p.accent}33)`,
        }}
      >
        {/* Soft abstract wash (blurred) — real preview is on /templates/[id] */}
        <div
          className="absolute inset-0 scale-110 blur-2xl"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, ${p.accent}66, transparent 45%),
              radial-gradient(circle at 70% 70%, ${p.primary}33, transparent 40%),
              linear-gradient(145deg, ${p.bg}, ${p.box})
            `,
          }}
        />
        <div className="absolute inset-0 bg-black/35 backdrop-blur-md" />

        <Link
          href={`/templates/${theme.id}`}
          target="_blank"
          rel="noreferrer"
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-xl backdrop-blur-md transition group-hover:border-white/40 group-hover:bg-black/70">
            <Icon name="external" className="text-[11px]" glow={false} />
            Preview
          </span>
        </Link>

        {theme.featured && (
          <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full border border-sky-300/30 bg-black/55 px-2 py-0.5 text-[10px] uppercase tracking-wider text-sky-100">
            Featured
          </span>
        )}
        {showStatus && (
          <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-full border border-white/15 bg-black/55 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/70">
            {theme.status}
          </span>
        )}
      </div>

      <div className="space-y-2 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">{theme.name}</h3>
            {theme.description ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-white/45">{theme.description}</p>
            ) : null}
          </div>
          <span className="shrink-0 text-[10px] uppercase tracking-wider text-white/35">
            {theme.category}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px] text-white/40">
          <span className="truncate">
            {theme.author_slug
              ? `@${theme.author_slug}`
              : theme.author_name || "Community"}
          </span>
          <span>{theme.uses_count.toLocaleString()} uses</span>
        </div>
        {(onApply || onDelete) && (
          <div className="flex gap-2 pt-1">
            {onApply && (
              <button
                type="button"
                className="btn btn-primary flex-1 text-xs"
                disabled={applying}
                onClick={onApply}
              >
                {applying ? "…" : "Apply"}
              </button>
            )}
            <Link
              href={`/templates/${theme.id}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost text-xs"
            >
              <Icon name="external" className="text-[10px]" glow={false} />
              Share
            </Link>
            {onDelete && (
              <button
                type="button"
                className="btn btn-ghost text-xs text-red-300"
                disabled={applying}
                onClick={onDelete}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

"use client";

import Link from "next/link";
import { BlackDiamond } from "@/components/BlackDiamond";
import { BLACK_NAME, BLACK_PRICE_USD } from "@/lib/plan";

export function BlackUpsellBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link
        href="/black"
        className="flex items-center justify-between gap-3 rounded-xl border border-sky-300/25 bg-sky-400/[0.07] px-4 py-3 text-sm transition hover:bg-sky-400/[0.12]"
      >
        <span className="inline-flex items-center gap-2 text-sky-100">
          <BlackDiamond />
          Unlock with {BLACK_NAME} · ${BLACK_PRICE_USD}/mo
        </span>
        <span className="text-xs text-white/45">Open →</span>
      </Link>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-sky-300/25 bg-gradient-to-r from-sky-400/[0.1] via-white/[0.03] to-transparent p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sky-200/80">
            <BlackDiamond /> under {BLACK_NAME}
          </p>
          <p className="mt-2 text-base font-medium text-white">
            Effects lab, cursors, particles, Discord cards - ${BLACK_PRICE_USD}/mo
          </p>
          <p className="mt-1 text-sm text-white/50">
            Locked options show a diamond. Tap any of them to unlock.
          </p>
        </div>
        <Link href="/black" className="btn btn-primary shrink-0">
          <BlackDiamond /> Get {BLACK_NAME}
        </Link>
      </div>
    </div>
  );
}

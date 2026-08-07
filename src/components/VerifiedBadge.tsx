"use client";

import { useId } from "react";

export function VerifiedBadge({
  title = "Verified",
  size = 16,
}: {
  title?: string;
  size?: number;
}) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block shrink-0"
      aria-label={title}
      role="img"
      style={{ filter: "drop-shadow(0 0 6px rgba(56,189,248,0.55))" }}
    >
      <path
        d="M11 1.2l2.35 1.55 2.75-.35.95 2.6 2.5 1.2-.55 2.7 1.7 2.2-1.7 2.2.55 2.7-2.5 1.2-.95 2.6-2.75-.35L11 20.8l-2.35-1.55-2.75.35-.95-2.6-2.5-1.2.55-2.7L1.3 11l1.7-2.2-.55-2.7 2.5-1.2.95-2.6 2.75.35L11 1.2z"
        fill={`url(#vg-${gid})`}
      />
      <path
        d="M11 1.2l2.35 1.55 2.75-.35.95 2.6 2.5 1.2-.55 2.7 1.7 2.2-1.7 2.2.55 2.7-2.5 1.2-.95 2.6-2.75-.35L11 20.8l-2.35-1.55-2.75.35-.95-2.6-2.5-1.2.55-2.7L1.3 11l1.7-2.2-.55-2.7 2.5-1.2.95-2.6 2.75.35L11 1.2z"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.6"
      />
      <path
        d="M6.8 11.15l2.7 2.75 5.7-5.9"
        stroke="#041018"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={`vg-${gid}`} x1="3" y1="2" x2="19" y2="20">
          <stop stopColor="#7DD3FC" />
          <stop offset="0.45" stopColor="#38BDF8" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function OwnerBadge({ size = 16 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-amber-300/35 bg-gradient-to-r from-amber-400/20 to-orange-400/10 px-1.5 py-0.5 font-semibold uppercase tracking-[0.14em] text-amber-50 shadow-[0_0_14px_rgba(251,191,36,0.28)]"
      title="under.bio owner"
      style={{ fontSize: Math.max(9, size * 0.65) }}
    >
      <svg width={size - 1} height={size - 1} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4.5 9l2.2-5.2L12 7.5l5.3-3.7L19.5 9 21 14.5H3L4.5 9z"
          fill="#FBBF24"
          stroke="#F59E0B"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path d="M5 16.5h14v2.2a1.3 1.3 0 01-1.3 1.3H6.3A1.3 1.3 0 015 18.7v-2.2z" fill="#F59E0B" />
        <circle cx="12" cy="13.2" r="1.3" fill="#78350F" />
      </svg>
      Owner
    </span>
  );
}

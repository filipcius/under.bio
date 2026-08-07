"use client";

import { useState } from "react";
import { BlackDiamond } from "@/components/BlackDiamond";
import { Icon } from "@/components/Icon";
import type { InviteDashboard } from "@/lib/referrals";
import { BLACK_NAME } from "@/lib/plan";

export function InvitePanel({ data }: { data: InviteDashboard }) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  const towardNext = data.qualified % data.goal;
  const pct = Math.min(100, Math.round((towardNext / data.goal) * 100));

  function copy(kind: "link" | "code") {
    const value = kind === "link" ? data.shareUrl : data.code;
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sky-300/20 bg-gradient-to-br from-sky-400/[0.08] via-transparent to-white/[0.02] p-5 sm:p-6">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sky-200/75">
          <BlackDiamond /> Invite program
        </p>
        <h2 className="section-title mt-2 text-2xl sm:text-3xl">
          {data.goal} friends → {data.rewardDays} days {BLACK_NAME}
        </h2>
        <p className="mt-2 max-w-xl text-sm text-white/50">
          Share your link. When someone new joins under.bio through it and signs in with Discord,
          they count. Hit {data.goal} and you unlock free {BLACK_NAME} for {data.rewardDays} days
          — stacks every {data.goal}.
        </p>

        <div className="mt-5">
          <div className="mb-2 flex items-end justify-between gap-3 text-sm">
            <span className="text-white/70">
              {towardNext}/{data.goal} to next reward
            </span>
            <span className="text-white/40">{data.qualified} total · {data.rewardsClaimed} claimed</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-sky-300/80 transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:items-stretch">
        <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">Invite link</p>
          <p className="mt-3 min-h-[2rem] truncate font-mono text-sm leading-8 text-white/80">
            {data.shareUrl}
          </p>
          <button
            type="button"
            className="btn btn-primary mt-auto h-11 w-full text-sm"
            onClick={() => copy("link")}
          >
            <Icon name="external" className="text-[10px]" glow={false} />
            {copied === "link" ? "Copied" : "Copy link"}
          </button>
        </div>
        <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">Invite code</p>
          <p className="mt-3 min-h-[2rem] font-mono text-sm leading-8 tracking-[0.22em] text-white">
            {data.code}
          </p>
          <button
            type="button"
            className="btn btn-primary mt-auto h-11 w-full text-sm"
            onClick={() => copy("code")}
          >
            {copied === "code" ? "Copied" : "Copy code"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-white/85">Recent signups</h3>
          <span className="text-xs text-white/35">Only new accounts count</span>
        </div>
        {data.recent.length === 0 ? (
          <p className="help py-6 text-center">No invites redeemed yet. Share your link.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {data.recent.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.avatar || "/avatar-fallback.svg"}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white/85">{p.name || "Member"}</p>
                  <p className="truncate text-xs text-white/35">
                    {p.slug ? `under.bio/${p.slug}` : "—"}
                  </p>
                </div>
                <time className="shrink-0 text-[11px] text-white/30">
                  {new Date(p.at).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs leading-relaxed text-white/35">
        Anti-abuse: only first-time Discord accounts created through your link/code count. Existing
        users logging in again never credit. Self-invites are blocked. Rewards grant {BLACK_NAME}
        for {data.rewardDays} days (extends if you already have it).
      </p>
    </div>
  );
}

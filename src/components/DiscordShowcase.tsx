"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type Live = {
  title: string;
  image: string;
  online: number;
  members: number;
  inviteUrl: string;
};

export function DiscordShowcase({
  inviteCode,
  fallback,
  panelStyle,
  panelClass,
  secondary,
}: {
  inviteCode: string;
  fallback?: Partial<Live>;
  panelStyle: React.CSSProperties;
  panelClass?: string;
  secondary: string;
}) {
  const [live, setLive] = useState<Live>({
    title: fallback?.title || "Discord Server",
    image: fallback?.image || "/avatar-fallback.svg",
    online: fallback?.online || 0,
    members: fallback?.members || 0,
    inviteUrl: fallback?.inviteUrl || `https://discord.gg/${inviteCode}`,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inviteCode) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/discord/invite?url=${encodeURIComponent(inviteCode)}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setLive({
          title: data.title,
          image: data.image,
          online: data.online,
          members: data.members,
          inviteUrl: data.inviteUrl,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [inviteCode]);

  return (
    <div style={panelStyle} className={`flex items-center gap-3 px-3 py-3 ${panelClass || "ub-panel"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={live.image}
        alt=""
        className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-sm font-semibold">
          <Icon name="discord" className="text-sm text-[#5865F2]" glow={false} />
          {live.title}
        </p>
        <p className="truncate text-xs" style={{ color: secondary }}>
          <span className="mr-2 text-emerald-400">● {live.online} Online</span>
          <span>● {live.members} Members</span>
          {loading && <span className="ml-2 text-white/30">syncing…</span>}
        </p>
      </div>
      <a
        href={live.inviteUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold transition hover:scale-105 hover:bg-white/90"
        style={{ color: "#0a0a0a" }}
      >
        Join
      </a>
    </div>
  );
}

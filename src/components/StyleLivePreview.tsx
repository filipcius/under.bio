"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { ProfileTemplate } from "@/lib/profile-template";
import { PublicProfile } from "@/components/PublicProfile";

export function StyleLivePreview({
  config,
  avatarUrl,
  uid,
  discordUsername,
  dirty,
  isBlack = false,
}: {
  config: ProfileTemplate;
  avatarUrl?: string | null;
  uid: number;
  discordUsername: string;
  dirty: boolean;
  isBlack?: boolean;
}) {
  const deferred = useDeferredValue(config);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const panel = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
    >
      <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2">
        <p className="text-[11px] text-white/50">Preview</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={dirty ? "dirty" : "saved"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-[10px] ${
              dirty ? "text-amber-200/90" : "text-white/35"
            }`}
          >
            {dirty ? "Unsaved" : "Saved"}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative h-[min(640px,calc(100vh-7.5rem))] overflow-hidden bg-[#050505]">
        <PublicProfile
          config={deferred}
          avatarUrl={avatarUrl}
          uid={uid}
          totalViews={1284}
          rank={12}
          joinedAt={new Date().toISOString()}
          discordUsername={discordUsername}
          isOwner={false}
          discordVerified
          isBlack={isBlack}
          preview
        />
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Spacer keeps the grid column so the editor doesn't stretch full width */}
      <aside className="hidden w-[360px] shrink-0 xl:block" aria-hidden />

      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed top-20 right-4 z-40 hidden w-[min(360px,calc(100vw-2rem))] xl:block 2xl:right-[max(1rem,calc((100vw-80rem)/2+1rem))]">
            <div className="pointer-events-auto">{panel}</div>
          </div>,
          document.body,
        )}
    </>
  );
}

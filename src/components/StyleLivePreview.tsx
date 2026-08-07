"use client";

import { useDeferredValue } from "react";
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

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-20 flex justify-center px-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c]"
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
      </div>
    </aside>
  );
}

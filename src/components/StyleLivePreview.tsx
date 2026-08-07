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
    <aside className="hidden xl:block xl:self-start">
      <div className="sticky top-20">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-[11px] text-white/45">Preview</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dirty ? "dirty" : "ok"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-[10px] ${
                  dirty ? "text-amber-200/80" : "text-white/30"
                }`}
              >
                {dirty ? "Unsaved" : "Live"}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="relative mx-2 mb-2 h-[min(620px,calc(100vh-8rem))] overflow-hidden rounded-xl border border-white/[0.06] bg-[#050505]">
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
        </div>
      </div>
    </aside>
  );
}

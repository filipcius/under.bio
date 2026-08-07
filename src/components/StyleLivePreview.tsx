"use client";

import { useDeferredValue, useState } from "react";
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
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-20">
        <motion.div
          onHoverStart={() => setExpanded(true)}
          onHoverEnd={() => setExpanded(false)}
          animate={{
            width: expanded ? 420 : 280,
          }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c]"
        >
          <div className="flex items-center justify-between border-b border-white/8 px-3 py-2">
            <p className="text-[11px] text-white/50">
              Preview
              <span className="ml-1.5 text-white/25">
                · {expanded ? "expanded" : "hover to expand"}
              </span>
            </p>
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

          <motion.div
            animate={{ height: expanded ? 640 : 420 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden bg-[#050505]"
          >
            <div className="absolute inset-0">
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
        </motion.div>
      </div>
    </aside>
  );
}

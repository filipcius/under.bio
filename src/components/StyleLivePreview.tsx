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
      <div className="sticky top-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0b] shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <motion.span
                className="h-2 w-2 rounded-full bg-emerald-300"
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.25, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <div>
                <p className="text-[11px] font-medium tracking-wide text-white/80">
                  Live preview
                </p>
                <p className="text-[10px] text-white/35">under.bio/{deferred.meta.slug || "you"}</p>
              </div>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dirty ? "dirty" : "saved"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                  dirty
                    ? "bg-amber-400/15 text-amber-100 ring-1 ring-amber-300/30"
                    : "bg-white/5 text-white/45 ring-1 ring-white/10"
                }`}
              >
                {dirty ? "Unsaved" : "Saved"}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="px-4 pb-4">
            <div className="relative mx-auto w-full max-w-[300px]">
              {/* phone shell */}
              <div className="relative overflow-hidden rounded-[34px] border border-white/15 bg-black p-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/5">
                <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
                <div className="relative aspect-[9/19] overflow-hidden rounded-[26px] bg-[#050505]">
                  <motion.div
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
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
                  </motion.div>
                </div>
              </div>

              {/* ambient glow under phone */}
              <motion.div
                className="pointer-events-none absolute inset-x-8 -bottom-2 h-10 rounded-full bg-white/10 blur-2xl"
                animate={
                  dirty
                    ? { opacity: [0.15, 0.35, 0.15] }
                    : { opacity: 0.12 }
                }
                transition={{ duration: 2.2, repeat: dirty ? Infinity : 0 }}
              />
            </div>
          </div>
        </motion.div>

        <p className="mt-3 text-center text-[11px] text-white/35">
          Tweaks update live · audio muted in preview
        </p>
      </div>
    </aside>
  );
}

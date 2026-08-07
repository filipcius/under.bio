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
          initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-black/50 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-emerald-300"
                animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.35, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                Live preview
              </p>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dirty ? "dirty" : "saved"}
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  dirty
                    ? "border border-amber-300/35 bg-amber-400/15 text-amber-50 shadow-[0_0_18px_rgba(251,191,36,0.18)]"
                    : "border border-white/10 bg-white/5 text-white/45"
                }`}
              >
                {dirty ? "Unsaved" : "Saved look"}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="relative h-[min(72vh,680px)] overflow-hidden bg-[#050505]">
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-40"
              animate={{
                background: [
                  "radial-gradient(420px circle at 20% 20%, rgba(255,255,255,0.08), transparent 55%)",
                  "radial-gradient(420px circle at 80% 30%, rgba(255,255,255,0.08), transparent 55%)",
                  "radial-gradient(420px circle at 40% 70%, rgba(255,255,255,0.08), transparent 55%)",
                  "radial-gradient(420px circle at 20% 20%, rgba(255,255,255,0.08), transparent 55%)",
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            <div
              className="pointer-events-none absolute left-1/2 top-4 origin-top"
              style={{
                width: 390,
                height: 844,
                transform: "translateX(-50%) scale(0.5)",
              }}
            >
              <motion.div
                className="h-full w-full overflow-hidden rounded-[32px] border border-white/12 shadow-[0_30px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/5"
                animate={dirty ? { boxShadow: ["0 30px 80px rgba(0,0,0,0.65)", "0 30px 90px rgba(251,191,36,0.12)", "0 30px 80px rgba(0,0,0,0.65)"] } : undefined}
                transition={{ duration: 2.4, repeat: dirty ? Infinity : 0 }}
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

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black via-black/70 to-transparent" />
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-2 text-center text-[11px] text-white/35"
        >
          Updates as you tweak · Save to publish
        </motion.p>
      </div>
    </aside>
  );
}

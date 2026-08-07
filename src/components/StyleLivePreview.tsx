"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ProfileTemplate } from "@/lib/profile-template";
import { PublicProfile } from "@/components/PublicProfile";
import { cn } from "@/lib/utils";

const STICKY_TOP = 80; // matches navbar + gap (top-20)

export function StyleLivePreview({
  config,
  avatarUrl,
  avatarDecorationUrl,
  uid,
  discordUsername,
  dirty,
  isBlack = false,
}: {
  config: ProfileTemplate;
  avatarUrl?: string | null;
  avatarDecorationUrl?: string | null;
  uid: number;
  discordUsername: string;
  dirty: boolean;
  isBlack?: boolean;
}) {
  const deferred = useDeferredValue(config);
  const colRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stuckRef = useRef(false);
  const [stuck, setStuck] = useState(false);
  const [box, setBox] = useState({ width: 360, height: 640, left: 0 });

  useEffect(() => {
    const col = colRef.current;
    const panel = panelRef.current;
    if (!col || !panel) return;

    const sync = () => {
      const cr = col.getBoundingClientRect();
      const shouldStick = cr.top <= STICKY_TOP;

      if (shouldStick && !stuckRef.current) {
        const pr = panel.getBoundingClientRect();
        stuckRef.current = true;
        setBox({ width: cr.width, height: pr.height, left: cr.left });
        setStuck(true);
        return;
      }

      if (!shouldStick && stuckRef.current) {
        stuckRef.current = false;
        setStuck(false);
        return;
      }

      if (stuckRef.current) {
        setBox((b) =>
          b.left === cr.left && b.width === cr.width
            ? b
            : { ...b, left: cr.left, width: cr.width },
        );
      }
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    const ro = new ResizeObserver(() => {
      if (!stuckRef.current) {
        const cr = col.getBoundingClientRect();
        const pr = panel.getBoundingClientRect();
        setBox({ width: cr.width, height: pr.height, left: cr.left });
      } else {
        sync();
      }
    });
    ro.observe(col);
    ro.observe(panel);

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      ro.disconnect();
    };
  }, []);

  return (
    <aside ref={colRef} className="hidden w-full xl:block xl:self-start">
      {stuck ? <div style={{ height: box.height }} aria-hidden /> : null}
      <div
        ref={panelRef}
        className={cn(
          "overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] transition-shadow duration-200",
          stuck && "shadow-[0_24px_60px_rgba(0,0,0,0.45)]",
        )}
        style={
          stuck
            ? {
                position: "fixed",
                top: STICKY_TOP,
                left: box.left,
                width: box.width,
                zIndex: 30,
              }
            : undefined
        }
      >
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
        <div className="relative mx-2 mb-2 h-[min(580px,calc(100vh-9rem))] overflow-y-auto overflow-x-hidden rounded-xl border border-white/[0.06] bg-[#050505]">
          {/* Top pad so Discord avatar decorations aren't clipped by the preview frame */}
          <div className="pt-5">
            <PublicProfile
              config={deferred}
              avatarUrl={avatarUrl}
              avatarDecorationUrl={avatarDecorationUrl}
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

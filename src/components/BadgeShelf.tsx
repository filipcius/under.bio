"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/Icon";
import { hexToRgba } from "@/lib/utils";

type Badge = {
  name: string;
  icon: string;
  description?: string;
};

export function BadgeShelf({
  badges,
  theme,
  alignCenter,
  size = 32,
  gap = 6,
  glow = true,
  style = "glass",
  shake = false,
}: {
  badges: Badge[];
  theme: string;
  alignCenter?: boolean;
  size?: number;
  gap?: number;
  glow?: boolean;
  style?: "glass" | "flat" | "neon" | "minimal";
  shake?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);

  const shell =
    style === "flat"
      ? "border-transparent bg-white/10"
      : style === "neon"
        ? "border-current bg-transparent shadow-[0_0_12px_currentColor]"
        : style === "minimal"
          ? "border-transparent bg-transparent"
          : "border-white/12 bg-white/[0.04]";

  return (
    <div
      className={`relative mt-3 flex flex-wrap ${alignCenter ? "justify-center" : ""}`}
      style={{ gap }}
    >
      {badges.map((badge, i) => {
        const tip = (badge.description || badge.name).trim();
        const open = active === i;
        return (
          <div
            key={`${badge.name}-${badge.icon}-${i}`}
            className="relative"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
          >
            <motion.button
              type="button"
              data-cursor-hover
              className={`flex items-center justify-center rounded-lg border text-sm transition duration-150 hover:scale-110 ${shell}`}
              style={{
                width: size,
                height: size,
                color: theme,
                boxShadow: open ? `0 0 16px ${hexToRgba(theme, 35)}` : undefined,
              }}
              animate={shake && open ? { rotate: [0, -6, 6, 0] } : undefined}
              transition={{ duration: 0.28 }}
              aria-label={tip}
            >
              <Icon name={badge.icon} className="text-sm" glow={glow} />
            </motion.button>

            <AnimatePresence>
              {open && tip && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-[#0a0a0a]/95 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-[0_8px_28px_rgba(0,0,0,0.55)] backdrop-blur-md"
                  role="tooltip"
                >
                  {tip}
                  <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-[#0a0a0a]/95" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import type { ProfileTemplate } from "@/lib/profile-template";
import { hexToRgba } from "@/lib/utils";

function particleColor(
  mode: ProfileTemplate["page"]["particleColor"],
  theme: string,
) {
  if (mode === "theme") return theme;
  if (mode === "warm") return "#FFB070";
  if (mode === "cool") return "#8EC5FF";
  return "#FFFFFF";
}

export function ProfileParticles({
  mode,
  density,
  speed,
  colorMode,
  theme,
}: {
  mode: ProfileTemplate["page"]["particles"];
  density: number;
  speed: number;
  colorMode: ProfileTemplate["page"]["particleColor"];
  theme: string;
}) {
  if (mode === "none") return null;
  const count = Math.round((density / 100) * (mode === "matrix" ? 40 : 36));
  const durBase = 9 - speed / 20;
  const color = particleColor(colorMode, theme);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = `${(i * 47 + 13) % 100}%`;
        if (mode === "matrix") {
          return (
            <motion.span
              key={i}
              className="absolute font-mono text-[10px] opacity-40"
              style={{ left, top: "-10%", color }}
              animate={{ y: ["0vh", "120vh"], opacity: [0, 0.7, 0] }}
              transition={{
                duration: durBase + (i % 5),
                repeat: Infinity,
                delay: i * 0.15,
                ease: "linear",
              }}
            >
              {String.fromCharCode(0x30a0 + ((i * 7) % 90))}
            </motion.span>
          );
        }
        if (mode === "rain") {
          return (
            <motion.span
              key={i}
              className="absolute w-px rounded-full"
              style={{
                left,
                top: "-10%",
                height: 10 + (i % 5) * 4,
                background: color,
                opacity: 0.35,
              }}
              animate={{ y: ["0vh", "120vh"] }}
              transition={{
                duration: durBase * 0.45 + (i % 3) * 0.2,
                repeat: Infinity,
                delay: i * 0.08,
                ease: "linear",
              }}
            />
          );
        }
        if (mode === "stars" || mode === "sparkle") {
          return (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left,
                top: `${(i * 29) % 100}%`,
                width: mode === "sparkle" ? 2 : 1.5,
                height: mode === "sparkle" ? 2 : 1.5,
                background: color,
              }}
              animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.4, 0.8] }}
              transition={{
                duration: 1.8 + (i % 4) * 0.4,
                repeat: Infinity,
                delay: i * 0.12,
              }}
            />
          );
        }
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              width: mode === "snow" ? 3 + (i % 3) : mode === "ash" ? 2 : 2,
              height: mode === "snow" ? 3 + (i % 3) : 2,
              left,
              top: "-10%",
              background:
                mode === "embers" || mode === "ash"
                  ? colorMode === "white"
                    ? "rgba(255,180,120,0.55)"
                    : color
                  : color,
              opacity: 0.55,
            }}
            animate={{ y: ["0vh", "110vh"], opacity: [0, 1, 0], x: mode === "ash" ? [0, 20, -10] : 0 }}
            transition={{
              duration: durBase + (i % 5),
              repeat: Infinity,
              delay: i * 0.18,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
}

export function ProfileAurora({
  mode,
  intensity,
  theme,
}: {
  mode: ProfileTemplate["effects"]["aurora"];
  intensity: number;
  theme: string;
}) {
  if (mode === "none") return null;
  const op = intensity / 100;
  const strong = mode === "strong" || mode === "pulse";
  return (
    <>
      <motion.div
        className="pointer-events-none absolute -left-24 top-1/4 rounded-full blur-3xl"
        style={{
          width: strong ? 340 : 260,
          height: strong ? 340 : 260,
          background: hexToRgba(theme, Math.round(22 * op)),
        }}
        animate={
          mode === "pulse"
            ? { opacity: [0.3, 0.7, 0.3], scale: [1, 1.08, 1] }
            : { x: [0, 40, 0], y: [0, -30, 0], opacity: [0.35, 0.55, 0.35] }
        }
        transition={{ duration: mode === "pulse" ? 4 : 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 bottom-1/4 rounded-full blur-3xl"
        style={{
          width: strong ? 360 : 280,
          height: strong ? 360 : 280,
          background: hexToRgba(theme, Math.round(14 * op)),
        }}
        animate={{ x: [0, -35, 0], y: [0, 25, 0], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

export function ProfileOrbs({
  enabled,
  count,
  intensity,
  theme,
}: {
  enabled: boolean;
  count: number;
  intensity: number;
  theme: string;
}) {
  if (!enabled) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-2xl"
          style={{
            width: 80 + (i % 4) * 30,
            height: 80 + (i % 4) * 30,
            left: `${(i * 17) % 80}%`,
            top: `${(i * 23) % 70}%`,
            background: hexToRgba(theme, Math.round((intensity / 100) * 18)),
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}

export function PageOverlay({
  mode,
  opacity,
}: {
  mode: ProfileTemplate["page"]["overlay"];
  opacity: number;
}) {
  if (mode === "none") return null;
  const op = opacity / 100;
  const style: React.CSSProperties = { opacity: op };
  if (mode === "vignette") {
    style.background = "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.78))";
  } else if (mode === "scanlines" || mode === "crt") {
    style.background =
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.035), rgba(255,255,255,0.035) 1px, transparent 2px, transparent 4px)";
  } else if (mode === "grid") {
    style.backgroundImage =
      "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)";
    style.backgroundSize = "40px 40px";
  } else if (mode === "fog") {
    style.background =
      "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08), transparent 45%), radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.05), transparent 40%)";
  } else if (mode === "chromatic") {
    style.boxShadow = "inset 8px 0 24px rgba(255,0,80,0.12), inset -8px 0 24px rgba(0,200,255,0.12)";
  } else if (mode === "stars") {
    style.backgroundImage =
      "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.35), transparent), radial-gradient(1px 1px at 80% 20%, rgba(255,255,255,0.4), transparent)";
  } else if (mode === "noise") {
    style.backgroundImage =
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
    style.mixBlendMode = "overlay";
  }
  return <div className="pointer-events-none absolute inset-0" style={style} />;
}

export function BoxPattern({
  pattern,
  opacity,
}: {
  pattern: ProfileTemplate["box"]["pattern"];
  opacity: number;
}) {
  if (pattern === "none") return null;
  const op = opacity / 100;
  let backgroundImage = "";
  let backgroundSize = "auto";
  if (pattern === "dots") {
    backgroundImage = "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)";
    backgroundSize = "12px 12px";
  } else if (pattern === "grid") {
    backgroundImage =
      "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)";
    backgroundSize = "24px 24px";
  } else if (pattern === "diagonal") {
    backgroundImage =
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 8px)";
  } else if (pattern === "noise") {
    backgroundImage =
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
  }
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage, backgroundSize, opacity: op, mixBlendMode: "overlay" }}
    />
  );
}

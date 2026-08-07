"use client";

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

/** CSS-only particles — same look, far cheaper than dozens of Framer nodes */
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
  const count = Math.min(
    Math.round((density / 100) * (mode === "matrix" ? 28 : 24)),
    32,
  );
  const durBase = Math.max(3.5, 9 - speed / 20);
  const color = particleColor(colorMode, theme);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      style={{ ["--ub-p-color" as string]: color }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const left = `${(i * 47 + 13) % 100}%`;
        const delay = `${(i * 0.17).toFixed(2)}s`;
        const duration = `${(durBase + (i % 5) * 0.55).toFixed(2)}s`;
        if (mode === "matrix") {
          return (
            <span
              key={i}
              className="ub-particle ub-particle-matrix absolute font-mono text-[10px] opacity-40"
              style={{
                left,
                top: "-12%",
                color,
                animationDuration: duration,
                animationDelay: delay,
              }}
            >
              {String.fromCharCode(0x30a0 + ((i * 7) % 90))}
            </span>
          );
        }
        if (mode === "rain") {
          return (
            <span
              key={i}
              className="ub-particle ub-particle-fall absolute w-px rounded-full"
              style={{
                left,
                top: "-12%",
                height: 10 + (i % 5) * 4,
                background: color,
                opacity: 0.35,
                animationDuration: `${(durBase * 0.45 + (i % 3) * 0.2).toFixed(2)}s`,
                animationDelay: delay,
              }}
            />
          );
        }
        if (mode === "stars" || mode === "sparkle") {
          return (
            <span
              key={i}
              className="ub-particle ub-particle-twinkle absolute rounded-full"
              style={{
                left,
                top: `${(i * 29) % 100}%`,
                width: mode === "sparkle" ? 2 : 1.5,
                height: mode === "sparkle" ? 2 : 1.5,
                background: color,
                animationDuration: `${(1.8 + (i % 4) * 0.4).toFixed(2)}s`,
                animationDelay: delay,
              }}
            />
          );
        }
        return (
          <span
            key={i}
            className="ub-particle ub-particle-fall absolute rounded-full"
            style={{
              width: mode === "snow" ? 3 + (i % 3) : 2,
              height: mode === "snow" ? 3 + (i % 3) : 2,
              left,
              top: "-12%",
              background:
                mode === "embers" || mode === "ash"
                  ? colorMode === "white"
                    ? "rgba(255,180,120,0.55)"
                    : color
                  : color,
              opacity: 0.55,
              animationDuration: duration,
              animationDelay: delay,
              ["--ub-drift" as string]: mode === "ash" ? "14px" : "0px",
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
      <div
        className={`pointer-events-none absolute -left-24 top-1/4 rounded-full blur-3xl ${
          mode === "pulse" ? "ub-aurora-pulse" : "ub-aurora-drift"
        }`}
        style={{
          width: strong ? 340 : 260,
          height: strong ? 340 : 260,
          background: hexToRgba(theme, Math.round(22 * op)),
        }}
      />
      <div
        className="ub-aurora-drift-alt pointer-events-none absolute -right-16 bottom-1/4 rounded-full blur-3xl"
        style={{
          width: strong ? 360 : 280,
          height: strong ? 360 : 280,
          background: hexToRgba(theme, Math.round(14 * op)),
        }}
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
  const n = Math.min(count, 8);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="ub-orb absolute rounded-full blur-2xl"
          style={{
            width: 80 + (i % 4) * 30,
            height: 80 + (i % 4) * 30,
            left: `${(i * 17) % 80}%`,
            top: `${(i * 23) % 70}%`,
            background: hexToRgba(theme, Math.round((intensity / 100) * 18)),
            animationDuration: `${8 + i}s`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function PageOverlay({
  mode,
  opacity,
}: {
  mode: ProfileTemplate["page"]["overlay"];
  opacity: number;
}) {
  if (mode === "none") return null;
  const op = Math.min(1, Math.max(0, opacity / 100));

  if (mode === "vhs") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: op }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.42))",
          }}
        />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 3px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-25 mix-blend-soft-light"
          style={{ backgroundImage: NOISE_SVG }}
        />
        <div
          className="absolute inset-0"
          style={{
            boxShadow:
              "inset 12px 0 40px rgba(255,40,80,0.07), inset -12px 0 40px rgba(40,180,255,0.07)",
          }}
        />
        <div className="ub-vhs-track absolute inset-x-0 h-10 bg-gradient-to-b from-white/[0.07] to-transparent" />
      </div>
    );
  }

  if (mode === "crt") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: op }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.5))",
          }}
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 4px)",
          }}
        />
      </div>
    );
  }

  if (mode === "scanlines") {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: op * 0.85,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 4px)",
        }}
      />
    );
  }

  if (mode === "vignette") {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: op,
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.62))",
        }}
      />
    );
  }

  if (mode === "fog") {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: op * 0.9,
          background:
            "radial-gradient(ellipse at 25% 15%, rgba(255,255,255,0.06), transparent 42%), radial-gradient(ellipse at 78% 85%, rgba(255,255,255,0.04), transparent 38%)",
        }}
      />
    );
  }

  if (mode === "chromatic") {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: op,
          boxShadow:
            "inset 14px 0 36px rgba(255,50,90,0.08), inset -14px 0 36px rgba(40,190,255,0.08)",
        }}
      />
    );
  }

  if (mode === "grid") {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: op * 0.75,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    );
  }

  if (mode === "stars") {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: op,
          backgroundImage:
            "radial-gradient(1px 1px at 12% 22%, rgba(255,255,255,0.45), transparent), radial-gradient(1px 1px at 38% 64%, rgba(255,255,255,0.28), transparent), radial-gradient(1px 1px at 72% 18%, rgba(255,255,255,0.35), transparent), radial-gradient(1.2px 1.2px at 86% 70%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 54% 40%, rgba(255,255,255,0.22), transparent)",
        }}
      />
    );
  }

  if (mode === "noise") {
    return (
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{ opacity: op * 0.45, backgroundImage: NOISE_SVG }}
      />
    );
  }

  return null;
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

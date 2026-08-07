"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "system" | "minimal" | "dot" | "cross" | "custom";

export function CustomCursor({
  mode,
  customUrl,
  color = "#FFFFFF",
  size = 12,
  trail = "none",
  trailLength = 10,
}: {
  mode: Mode;
  customUrl?: string;
  color?: string;
  size?: number;
  trail?: "none" | "fade" | "spark" | "smoke";
  trailLength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [hovering, setHovering] = useState(false);
  const dots = useRef<{ x: number; y: number }[]>([]);

  const active =
    mode === "minimal" ||
    mode === "dot" ||
    mode === "cross" ||
    (mode === "custom" && Boolean(customUrl));

  useEffect(() => {
    if (!active) return;

    document.documentElement.classList.add("ub-hide-cursor");
    document.body.classList.add("ub-hide-cursor");

    const el = ref.current;
    if (!el) return;

    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      setOn(true);
      const t = e.target as HTMLElement | null;
      setHovering(
        Boolean(t?.closest("a, button, [data-cursor-hover], input, textarea, select, label")),
      );
      if (trail !== "none") {
        dots.current = [{ x, y }, ...dots.current].slice(0, trailLength);
      }
    };
    const leave = () => setOn(false);

    const tick = () => {
      const ease = mode === "dot" ? 0.28 : 0.2;
      cx += (x - cx) * ease;
      cy += (y - cy) * ease;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;

      if (trail !== "none") {
        const layer = el.querySelector("[data-trail]") as HTMLElement | null;
        if (layer) {
          layer.innerHTML = dots.current
            .map((d, i) => {
              const o = 1 - i / Math.max(1, dots.current.length);
              const s = Math.max(2, size * 0.35 * o);
              return `<span style="position:fixed;left:${d.x}px;top:${d.y}px;width:${s}px;height:${s}px;margin-left:${-s / 2}px;margin-top:${-s / 2}px;border-radius:999px;background:${color};opacity:${o * (trail === "smoke" ? 0.25 : 0.55)};pointer-events:none;filter:blur(${trail === "smoke" ? 3 : trail === "spark" ? 0 : 1}px)"></span>`;
            })
            .join("");
        }
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("ub-hide-cursor");
      document.body.classList.remove("ub-hide-cursor");
    };
  }, [active, mode, trail, trailLength, color, size]);

  if (!active) return null;

  const s = hovering ? size * 1.25 : size;

  return (
    <>
      {trail !== "none" && (
        <div data-trail className="pointer-events-none fixed inset-0 z-[99998]" aria-hidden />
      )}
      <div
        ref={ref}
        className="pointer-events-none fixed left-0 top-0 z-[99999]"
        style={{ opacity: on ? 1 : 0 }}
        aria-hidden
      >
        {mode === "custom" && customUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={customUrl}
            alt=""
            className="-translate-x-1 -translate-y-1 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
            style={{ maxHeight: s * 2.2, maxWidth: s * 2.2 }}
          />
        ) : mode === "cross" ? (
          <div className="relative" style={{ width: s * 1.6, height: s * 1.6, marginLeft: -s * 0.8, marginTop: -s * 0.8 }}>
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2" style={{ background: color }} />
            <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2" style={{ background: color }} />
          </div>
        ) : mode === "dot" ? (
          <div
            className="rounded-full"
            style={{
              width: s,
              height: s,
              marginLeft: -s / 2,
              marginTop: -s / 2,
              background: color,
              boxShadow: `0 0 16px ${color}99`,
            }}
          />
        ) : (
          <div
            className="rounded-full border"
            style={{
              width: s * 2.2,
              height: s * 2.2,
              marginLeft: -s * 1.1,
              marginTop: -s * 1.1,
              borderColor: color,
              background: hovering ? `${color}22` : "transparent",
              boxShadow: `0 0 18px ${color}44`,
            }}
          />
        )}
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export function TiltPanel({
  enabled,
  strength = 12,
  hoverScale = 1.015,
  className,
  style,
  children,
}: {
  enabled?: boolean;
  strength?: number;
  hoverScale?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ rx: 0, ry: 0, s: 1 });
  const current = useRef({ rx: 0, ry: 0, s: 1 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (ref.current) ref.current.style.transform = "";
      return;
    }

    const tick = () => {
      const el = ref.current;
      if (!el) return;
      // smooth spring-ish lerp
      const ease = 0.085;
      current.current.rx += (target.current.rx - current.current.rx) * ease;
      current.current.ry += (target.current.ry - current.current.ry) * ease;
      current.current.s += (target.current.s - current.current.s) * ease;

      const { rx, ry, s } = current.current;
      if (
        Math.abs(rx - target.current.rx) < 0.01 &&
        Math.abs(ry - target.current.ry) < 0.01 &&
        Math.abs(s - target.current.s) < 0.001
      ) {
        current.current.rx = target.current.rx;
        current.current.ry = target.current.ry;
        current.current.s = target.current.s;
      }

      el.style.transform = `perspective(1200px) rotateX(${current.current.rx.toFixed(3)}deg) rotateY(${current.current.ry.toFixed(3)}deg) scale3d(${current.current.s.toFixed(4)}, ${current.current.s.toFixed(4)}, 1)`;
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    // clamp soft edges
    const nx = Math.min(1, Math.max(0, px));
    const ny = Math.min(1, Math.max(0, py));
    target.current.rx = (0.5 - ny) * strength;
    target.current.ry = (nx - 0.5) * strength;
    target.current.s = hoverScale;
  }

  function onLeave() {
    target.current.rx = 0;
    target.current.ry = 0;
    target.current.s = 1;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transformStyle: "preserve-3d",
        willChange: enabled ? "transform" : undefined,
        transition: enabled ? undefined : "transform 0.35s ease",
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

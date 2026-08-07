"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Scales children down so the whole profile fits in the viewport — no scroll */
export function FitViewport({
  children,
  className,
  style,
  pad = 24,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  pad?: number;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shell = outer.current;
    const content = inner.current;
    if (!shell || !content) return;

    const fit = () => {
      content.style.transform = "none";
      content.style.width = "";
      const availW = shell.clientWidth - pad * 2;
      const availH = shell.clientHeight - pad * 2;
      const needW = content.scrollWidth;
      const needH = content.scrollHeight;
      if (needW <= 0 || needH <= 0) return;
      const scale = Math.min(1, availW / needW, availH / needH);
      content.style.transformOrigin = "center center";
      content.style.transform = `scale(${scale})`;
      // keep layout box centered after scale
      content.style.width = `${needW}px`;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(shell);
    ro.observe(content);
    window.addEventListener("resize", fit);
    // fonts / images can change height
    const t = window.setTimeout(fit, 120);
    const t2 = window.setTimeout(fit, 480);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [pad]);

  return (
    <div
      ref={outer}
      className={className}
      style={{
        height: "100dvh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <div ref={inner} className="relative will-change-transform">
        {children}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type NameMode =
  | "none"
  | "flashing"
  | "typing"
  | "glitch"
  | "shine"
  | "wave"
  | "bounce"
  | "neon"
  | "rainbow"
  | "blur";

export function AnimatedName({
  text,
  mode,
  speed,
  className,
  style,
  theme = "#ffffff",
}: {
  text: string;
  mode: NameMode;
  speed: number;
  className?: string;
  style?: React.CSSProperties;
  theme?: string;
}) {
  // Higher speed = snappier. Range ~0.9s … 3.4s
  const durSec = Math.max(0.9, 3.4 - speed / 42);
  const dur = `${durSec}s`;
  const baseStyle = {
    ...style,
    ["--ub-name-dur" as string]: dur,
    ["--ub-name-theme" as string]: theme,
  } as React.CSSProperties;

  if (mode === "none") {
    return (
      <h1 className={className} style={style}>
        {text}
      </h1>
    );
  }

  if (mode === "typing") {
    return <TypingName text={text} className={className} style={baseStyle} durSec={durSec} />;
  }

  if (mode === "wave" || mode === "bounce") {
    const letters = Array.from(text);
    return (
      <h1
        className={cn(className, "ub-name", `ub-name--${mode}`)}
        style={baseStyle}
        aria-label={text}
      >
        {letters.map((ch, i) => (
          <span
            key={`${ch}-${i}`}
            className="ub-name-letter"
            style={{ ["--i" as string]: i }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </h1>
    );
  }

  if (mode === "glitch") {
    return (
      <h1
        className={cn(className, "ub-name ub-name--glitch")}
        style={baseStyle}
        data-text={text}
      >
        <span className="ub-name-glitch-main">{text}</span>
      </h1>
    );
  }

  return (
    <h1
      className={cn(className, "ub-name", `ub-name--${mode}`)}
      style={baseStyle}
    >
      {text}
    </h1>
  );
}

function TypingName({
  text,
  className,
  style,
  durSec,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  durSec: number;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    let phase: "type" | "hold" | "erase" = "type";
    let timer: number;

    const stepMs = Math.max(28, (durSec * 1000) / Math.max(text.length, 1) / 1.6);
    const holdMs = 1100;
    const eraseMs = Math.max(18, stepMs * 0.55);

    const tick = () => {
      if (phase === "type") {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          phase = "hold";
          timer = window.setTimeout(tick, holdMs);
          return;
        }
        timer = window.setTimeout(tick, stepMs);
        return;
      }
      if (phase === "hold") {
        phase = "erase";
        timer = window.setTimeout(tick, eraseMs);
        return;
      }
      i -= 1;
      setShown(text.slice(0, Math.max(0, i)));
      if (i <= 0) {
        phase = "type";
        timer = window.setTimeout(tick, 420);
        return;
      }
      timer = window.setTimeout(tick, eraseMs);
    };

    timer = window.setTimeout(tick, 280);
    return () => window.clearTimeout(timer);
  }, [text, durSec]);

  return (
    <h1 className={cn(className, "ub-name ub-name--typing")} style={style}>
      <span>{shown}</span>
      <span className="ub-name-caret" aria-hidden />
    </h1>
  );
}

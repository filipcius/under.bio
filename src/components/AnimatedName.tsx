"use client";

import { motion } from "framer-motion";

export function AnimatedName({
  text,
  mode,
  speed,
  className,
  style,
}: {
  text: string;
  mode:
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
  speed: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const duration = Math.max(0.35, 2.2 - speed / 70);

  if (mode === "shine" || mode === "rainbow") {
    return (
      <h1
        className={`${className} ${mode === "rainbow" ? "name-rainbow" : "name-shine"}`}
        style={style}
      >
        {text}
      </h1>
    );
  }

  if (mode === "flashing" || mode === "neon") {
    return (
      <motion.h1
        className={className}
        style={style}
        animate={{
          opacity: [1, mode === "neon" ? 0.75 : 0.35, 1],
          textShadow:
            mode === "neon"
              ? [
                  "0 0 6px currentColor",
                  "0 0 22px currentColor",
                  "0 0 6px currentColor",
                ]
              : ["0 0 0px #fff", "0 0 18px #fff", "0 0 0px #fff"],
        }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      >
        {text}
      </motion.h1>
    );
  }

  if (mode === "glitch") {
    return (
      <motion.h1
        className={`${className} relative`}
        style={style}
        animate={{ x: [0, -1, 1, 0], skewX: [0, -2, 2, 0] }}
        transition={{ duration: duration * 0.55, repeat: Infinity }}
      >
        <span className="absolute inset-0 -translate-x-[2px] text-cyan-300/40" aria-hidden>
          {text}
        </span>
        <span className="absolute inset-0 translate-x-[2px] text-rose-300/40" aria-hidden>
          {text}
        </span>
        <span className="relative">{text}</span>
      </motion.h1>
    );
  }

  if (mode === "typing") {
    return (
      <motion.h1 className={className} style={style}>
        <motion.span
          className="inline-block overflow-hidden whitespace-nowrap border-r border-white/50 pr-1"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{
            duration: duration + 0.6,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1.2,
          }}
        >
          {text}
        </motion.span>
      </motion.h1>
    );
  }

  if (mode === "wave") {
    return (
      <h1 className={className} style={style}>
        {text.split("").map((ch, i) => (
          <motion.span
            key={`${ch}-${i}`}
            className="inline-block"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.05,
              ease: "easeInOut",
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        ))}
      </h1>
    );
  }

  if (mode === "bounce") {
    return (
      <motion.h1
        className={className}
        style={style}
        animate={{ y: [0, -5, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: duration, repeat: Infinity, ease: "easeInOut" }}
      >
        {text}
      </motion.h1>
    );
  }

  if (mode === "blur") {
    return (
      <motion.h1
        className={className}
        style={style}
        animate={{ filter: ["blur(0px)", "blur(2px)", "blur(0px)"], opacity: [1, 0.85, 1] }}
        transition={{ duration: duration * 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {text}
      </motion.h1>
    );
  }

  return (
    <h1 className={className} style={style}>
      {text}
    </h1>
  );
}

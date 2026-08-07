"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/utils";

const PRESETS = [
  "#FFFFFF",
  "#F5F5F5",
  "#A3A3A3",
  "#525252",
  "#1A1A1A",
  "#0A0A0A",
  "#000000",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#38BDF8",
  "#6366F1",
  "#A855F7",
  "#EC4899",
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizeHex(input: string) {
  let v = input.trim();
  if (!v.startsWith("#")) v = `#${v}`;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    v = `#${r}${r}${g}${g}${b}${b}`;
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(v)) return null;
  return v.toUpperCase();
}

function hexToRgb(hex: string) {
  const n = normalizeHex(hex) ?? "#FFFFFF";
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const h = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function hsvToRgb(h: number, s: number, v: number) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  return {
    r: (rp + m) * 255,
    g: (gp + m) * 255,
    b: (bp + m) * 255,
  };
}

export function ColorPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const hex = normalizeHex(value) ?? "#FFFFFF";
  const { r, g, b } = hexToRgb(hex);
  const initial = useMemo(() => rgbToHsv(r, g, b), [hex]);
  const [h, setH] = useState(initial.h);
  const [s, setS] = useState(initial.s);
  const [v, setV] = useState(initial.v);
  const [text, setText] = useState(hex);

  useEffect(() => {
    const next = rgbToHsv(r, g, b);
    setH(next.h);
    setS(next.s);
    setV(next.v);
    setText(hex);
  }, [hex, r, g, b]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  function commitHsv(nh: number, ns: number, nv: number) {
    setH(nh);
    setS(ns);
    setV(nv);
    const rgb = hsvToRgb(nh, ns, nv);
    const next = rgbToHex(rgb.r, rgb.g, rgb.b);
    setText(next);
    onChange(next);
  }

  function onSvPointer(e: ReactPointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ns = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const nv = 1 - clamp((e.clientY - rect.top) / rect.height, 0, 1);
    commitHsv(h, ns, nv);
  }

  const hueRgb = hsvToRgb(h, 1, 1);
  const hueColor = rgbToHex(hueRgb.r, hueRgb.g, hueRgb.b);

  return (
    <div ref={root} className={cn("relative", className)}>
      <div className="flex gap-2">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="relative h-11 w-12 shrink-0 overflow-hidden rounded-xl border border-white/15 shadow-inner transition hover:border-white/30"
          style={{ background: hex }}
          title="Pick color"
        >
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
        </button>
        <input
          className="soft-input font-mono uppercase tracking-wide"
          value={text}
          onChange={(e) => {
            const raw = e.target.value;
            setText(raw);
            const n = normalizeHex(raw);
            if (n) onChange(n);
          }}
          onBlur={() => setText(hex)}
          spellCheck={false}
          maxLength={7}
        />
      </div>

      {open && (
        <div
          id={panelId}
          role="dialog"
          className="absolute left-0 z-50 mt-2 w-[260px] overflow-hidden rounded-2xl border border-white/12 bg-[#121212]/97 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl"
        >
          <div
            className="relative h-36 w-full cursor-crosshair touch-none overflow-hidden rounded-xl"
            style={{
              backgroundImage: `
                linear-gradient(to top, #000, transparent),
                linear-gradient(to right, #fff, ${hueColor})
              `,
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              onSvPointer(e);
            }}
            onPointerMove={(e) => {
              if (e.buttons !== 1) return;
              onSvPointer(e);
            }}
          >
            <span
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.55)]"
              style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%`, background: hex }}
            />
          </div>

          <div className="mt-3">
            <input
              type="range"
              min={0}
              max={360}
              value={Math.round(h)}
              onChange={(e) => commitHsv(Number(e.target.value), s, v)}
              className="ub-hue-range w-full"
              aria-label="Hue"
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div
              className="h-9 w-9 shrink-0 rounded-lg border border-white/15"
              style={{ background: hex }}
            />
            <input
              className="soft-input h-9 font-mono text-xs uppercase"
              value={text}
              onChange={(e) => {
                const raw = e.target.value;
                setText(raw);
                const n = normalizeHex(raw);
                if (n) onChange(n);
              }}
            />
          </div>

          <div className="mt-3 grid grid-cols-8 gap-1.5">
            {PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => onChange(c)}
                className={cn(
                  "h-6 w-full rounded-md border transition hover:scale-105",
                  hex === c ? "border-white ring-1 ring-white/40" : "border-white/10",
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import type { CSSProperties } from "react";
import type { ProfileTemplate } from "@/lib/profile-template";
import { hexToRgba } from "@/lib/utils";

/** Build panel surface + CSS vars for a visible layout border ring (::after). */
export function buildPanelChrome(
  box: ProfileTemplate["box"],
  opts: {
    primary: string;
    theme: string;
    accentGlow: number;
  },
): { style: CSSProperties; borderAttr: ProfileTemplate["box"]["borderStyle"] } {
  const panelBg = box.gradientFill
    ? `linear-gradient(160deg, ${hexToRgba(box.gradientFrom, box.opacity)}, ${hexToRgba(box.gradientTo, box.opacity)})`
    : hexToRgba(box.color, box.opacity);

  const styleKind = box.borderStyle;
  const rawW = Math.max(0, box.borderWidth);
  // Dashed/dotted/double need a bit more weight to read clearly
  const width =
    styleKind === "none"
      ? 0
      : styleKind === "dashed" || styleKind === "dotted"
        ? Math.max(rawW, 2)
        : styleKind === "double"
          ? Math.max(rawW, 3)
          : Math.max(rawW, styleKind === "soft" ? 1 : 0);

  const opacity =
    styleKind === "soft"
      ? Math.max(8, box.borderOpacity * 0.5)
      : styleKind === "dashed" || styleKind === "dotted"
        ? Math.max(box.borderOpacity, 28)
        : box.borderOpacity;

  const borderColor = hexToRgba(box.borderColor, opacity);

  const style: CSSProperties = {
    background: panelBg,
    borderRadius: box.radius,
    // Real border lives on ::after so it always paints above banner/content
    border: "none",
    boxShadow: [
      `0 ${box.shadowY}px ${box.shadowBlur}px ${hexToRgba(box.shadowColor, box.shadowOpacity)}`,
      box.glow || styleKind === "glow"
        ? `0 0 ${Math.max(opts.accentGlow, 20)}px ${hexToRgba(box.borderColor, styleKind === "glow" ? Math.max(28, box.borderOpacity) : 22)}`
        : "",
      box.innerGlow
        ? `inset 0 0 40px ${hexToRgba(opts.theme, box.innerGlowOpacity)}`
        : "",
    ]
      .filter(Boolean)
      .join(", "),
    color: opts.primary,
    backdropFilter: box.blur ? `blur(${box.blur}px)` : undefined,
    position: "relative",
    overflow: "hidden",
    // CSS vars for .ub-panel::after
    ["--ub-bw" as string]: `${width}px`,
    ["--ub-bc" as string]: borderColor,
    ["--ub-br" as string]: `${box.radius}px`,
  };

  return { style, borderAttr: styleKind };
}

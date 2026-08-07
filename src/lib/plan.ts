import type { ProfileTemplate } from "@/lib/profile-template";
import { DEFAULT_PROFILE_TEMPLATE, mergeTemplate } from "@/lib/profile-template";

export type PlanId = "free" | "black";

export const BLACK_PRICE_USD = 4.99;
export const BLACK_PRICE_CENTS = 499;
/** Paid tier display name (DB plan id stays `black`) */
export const BLACK_NAME = "VOID";
export const BLACK_TAGLINE = "Full control. Zero limits.";

export function hasBlack(
  plan?: string | null,
  status?: string | null,
  periodEnd?: string | null,
) {
  if (plan !== "black") return false;
  if (!(status === "active" || status === "trialing" || status === "past_due")) {
    return false;
  }
  // Comp / billing window ended
  if (periodEnd && new Date(periodEnd).getTime() < Date.now()) return false;
  return true;
}

/** Features locked on free — shown with diamond in Style editor */
export const BLACK_FEATURES = [
  {
    id: "effects-lab",
    label: "Effects lab",
    free: "Basic look only",
    black: "Aurora, orbs, bloom, spotlight, film bars, RGB",
  },
  {
    id: "particles",
    label: "Particles & overlays",
    free: "None / vignette",
    black: "Embers, matrix, CRT, fog, density controls",
  },
  {
    id: "name-fx",
    label: "Name animations",
    free: "Shine / flash",
    black: "Glitch, wave, neon, rainbow, blur + speed",
  },
  {
    id: "tilt",
    label: "3D tilt",
    free: "Off / standard",
    black: "Strong + extreme + scale",
  },
  {
    id: "cursor",
    label: "Custom cursor",
    free: "System cursor",
    black: "Dot, ring, cross, trail, custom image",
  },
  {
    id: "audio-style",
    label: "Audio styles",
    free: "Basic player",
    black: "Neon / glass player + EQ themes",
  },
  {
    id: "limits",
    label: "Modules capacity",
    free: "6 socials · 6 badges · 3 tags · 0 Discord cards",
    black: "40 socials · 24 badges · 20 tags · Discord live cards",
  },
  {
    id: "badge-mark",
    label: "VOID mark",
    free: "-",
    black: "Subtle VOID chip on your page",
  },
] as const;

export const FREE_CAPS = {
  links: 6,
  badges: 6,
  tags: 3,
  showcases: 0,
} as const;

/** Strip paid-only styling when user is on free */
export function enforceFreePlanConfig(config: ProfileTemplate): ProfileTemplate {
  const base = mergeTemplate(DEFAULT_PROFILE_TEMPLATE, {
    ...config,
    links: config.links.slice(0, FREE_CAPS.links),
    badges: config.badges.slice(0, FREE_CAPS.badges),
    tags: config.tags.slice(0, FREE_CAPS.tags),
    showcases: [],
  });

  const allowedTitle = new Set(["none", "flashing", "shine"]);
  const allowedEnter = new Set(["none", "fade", "slide-up"]);
  const allowedOverlay = new Set(["none", "vignette"]);
  const allowedTilt = new Set(["none", "standard"]);

  return {
    ...base,
    page: {
      ...base.page,
      titleAnimation: allowedTitle.has(base.page.titleAnimation)
        ? base.page.titleAnimation
        : "shine",
      enterAnimation: allowedEnter.has(base.page.enterAnimation)
        ? base.page.enterAnimation
        : "slide-up",
      overlay: allowedOverlay.has(base.page.overlay) ? base.page.overlay : "none",
      particles: "none",
      particleDensity: 40,
    },
    effects: {
      ...DEFAULT_PROFILE_TEMPLATE.effects,
      pulseRank: base.effects.pulseRank,
      nameGradient: false,
    },
    appearance: {
      ...base.appearance,
      cursor: "system",
      customCursorUrl: "",
      cursorTrail: "none",
      avatarDecoration:
        base.appearance.avatarDecoration === "spin-ring" ||
        base.appearance.avatarDecoration === "hex"
          ? "glow"
          : base.appearance.avatarDecoration,
      grain: Math.min(base.appearance.grain, 15),
      tagStyle:
        base.appearance.tagStyle === "neon" ? "pill" : base.appearance.tagStyle,
    },
    box: {
      ...base.box,
      tilt: allowedTilt.has(base.box.tilt) ? base.box.tilt : "standard",
      pattern: "none",
      gradientFill: false,
      innerGlow: false,
      blur: Math.min(base.box.blur, 8),
    },
    audio: {
      ...base.audio,
      playerStyle: "default",
      eqColor: "white",
      eqStyle: "bars",
    },
    background: {
      ...base.background,
      gradient: base.background.gradient === "mesh" ? "none" : base.background.gradient,
      animatedGradient: false,
      zoom: 100,
    },
    options: {
      ...base.options,
      showCornerAccents: false,
    },
  };
}

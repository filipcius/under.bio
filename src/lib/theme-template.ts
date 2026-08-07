import { z } from "zod";
import {
  DEFAULT_PROFILE_TEMPLATE,
  mergeTemplate,
  type ProfileTemplate,
} from "@/lib/profile-template";
import { isAdminDiscordId } from "@/lib/admin-ids";
import type {
  ProfileRow,
  ThemeTemplateCategory,
  ThemeTemplatePreview,
} from "@/lib/supabase/types";

export const THEME_TEMPLATE_CATEGORIES: {
  id: ThemeTemplateCategory;
  label: string;
}[] = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "minimal", label: "Minimal" },
  { id: "neon", label: "Neon" },
  { id: "aesthetic", label: "Aesthetic" },
  { id: "other", label: "Other" },
];

export const ACCOUNT_AGE_DAYS_FOR_TEMPLATES = 4;
export const MAX_TEMPLATES_PER_USER = 5;

/** Style-only slice stored in marketplace templates */
export type StyleConfigSlice = Pick<
  ProfileTemplate,
  | "appearance"
  | "box"
  | "background"
  | "banner"
  | "effects"
  | "page"
  | "layout"
  | "audio"
>;

export type ThemeApplyOptions = {
  /** Colors, fonts, cursor look */
  colors: boolean;
  /** Panel / box chrome */
  box: boolean;
  /** Effects lab (aurora, particles gate via page, etc.) */
  effects: boolean;
  /** Layout alignment / gaps */
  layout: boolean;
  /** Reveal, overlay, enter animation */
  page: boolean;
  /** Player chrome (not your tracks) */
  audioStyle: boolean;
  /** Background color / gradient / blur — keeps your image unless media on */
  backgroundLook: boolean;
  /** Replace your background image/video with the theme's */
  backgroundMedia: boolean;
  /** Banner height / overlay styling — keeps your banner unless media on */
  bannerLook: boolean;
  /** Replace your banner media with the theme's */
  bannerMedia: boolean;
};

export const DEFAULT_APPLY_OPTIONS: ThemeApplyOptions = {
  colors: true,
  box: true,
  effects: true,
  layout: true,
  page: true,
  audioStyle: true,
  backgroundLook: true,
  backgroundMedia: false,
  bannerLook: true,
  bannerMedia: false,
};

const styleSliceSchema = z.object({
  appearance: z.record(z.string(), z.unknown()).optional(),
  box: z.record(z.string(), z.unknown()).optional(),
  background: z.record(z.string(), z.unknown()).optional(),
  banner: z.record(z.string(), z.unknown()).optional(),
  effects: z.record(z.string(), z.unknown()).optional(),
  page: z.record(z.string(), z.unknown()).optional(),
  layout: z.record(z.string(), z.unknown()).optional(),
  audio: z.record(z.string(), z.unknown()).optional(),
});

export const applyOptionsSchema = z.object({
  colors: z.boolean(),
  box: z.boolean(),
  effects: z.boolean(),
  layout: z.boolean(),
  page: z.boolean(),
  audioStyle: z.boolean(),
  backgroundLook: z.boolean(),
  backgroundMedia: z.boolean(),
  bannerLook: z.boolean(),
  bannerMedia: z.boolean(),
});

export function extractStyleConfig(config: ProfileTemplate): StyleConfigSlice {
  return {
    appearance: { ...config.appearance },
    box: { ...config.box },
    background: { ...config.background },
    banner: { ...config.banner },
    effects: { ...config.effects },
    page: { ...config.page },
    layout: { ...config.layout },
    audio: { ...config.audio },
  };
}

export function buildPreviewSwatch(config: ProfileTemplate): ThemeTemplatePreview {
  return {
    primary: config.appearance.primaryText,
    secondary: config.appearance.secondaryText,
    bg: config.background.color,
    accent: config.appearance.themeColor,
    font: config.appearance.font,
    box: config.box.color,
  };
}

/** Full demo profile for /templates/[id] live preview (not the author's personal content). */
export function buildThemePreviewConfig(
  style: Partial<StyleConfigSlice>,
  themeName: string,
): ProfileTemplate {
  const label = themeName.trim().slice(0, 28) || "Theme";
  const base = mergeTemplate(DEFAULT_PROFILE_TEMPLATE, {
    meta: {
      slug: "preview",
      displayName: label,
      description: "Live theme preview · under.bio",
      location: "",
      pageTitle: `${label} · preview`,
      statusText: "preview",
    },
    options: {
      ...DEFAULT_PROFILE_TEMPLATE.options,
      showRevealScreen: false,
      showMusic: false,
      showTags: true,
      showSocialIcons: true,
      showBio: true,
      showViews: true,
      showRank: true,
      showStatusDot: true,
      showBadges: false,
    },
    audio: {
      ...DEFAULT_PROFILE_TEMPLATE.audio,
      trackPlayer: "none",
      autoPlay: false,
    },
    links: [
      {
        label: "Discord",
        url: "https://discord.gg/xkyQjTsGts",
        icon: "discord",
      },
      {
        label: "under.bio",
        url: "https://under.bio",
        icon: "link",
      },
    ],
    tags: ["theme", "preview"],
    tracks: [],
    showcases: [],
  });

  const themed = applyStyleConfig(base, style, {
    colors: true,
    box: true,
    effects: true,
    layout: true,
    page: true,
    audioStyle: true,
    backgroundLook: true,
    backgroundMedia: true,
    bannerLook: true,
    bannerMedia: true,
  });

  return {
    ...themed,
    options: { ...themed.options, showRevealScreen: false, showMusic: false },
    audio: { ...themed.audio, trackPlayer: "none", autoPlay: false },
    tracks: [],
    showcases: [],
  };
}

/**
 * Apply marketplace style onto a profile.
 * Never touches meta, links, badges, tags, tracks, showcases.
 * Media URLs stay on the player unless explicitly opted in.
 */
export function applyStyleConfig(
  base: ProfileTemplate,
  style: Partial<StyleConfigSlice>,
  options: ThemeApplyOptions = DEFAULT_APPLY_OPTIONS,
): ProfileTemplate {
  const patch: Partial<ProfileTemplate> = {};

  if (options.colors && style.appearance) {
    patch.appearance = {
      ...base.appearance,
      ...(style.appearance as ProfileTemplate["appearance"]),
    };
  }

  if (options.box && style.box) {
    patch.box = {
      ...base.box,
      ...(style.box as ProfileTemplate["box"]),
    };
  }

  if (options.effects && style.effects) {
    patch.effects = {
      ...base.effects,
      ...(style.effects as ProfileTemplate["effects"]),
    };
  }

  if (options.layout && style.layout) {
    patch.layout = {
      ...base.layout,
      ...(style.layout as ProfileTemplate["layout"]),
    };
  }

  if (options.page && style.page) {
    patch.page = {
      ...base.page,
      ...(style.page as ProfileTemplate["page"]),
    };
  }

  if (options.audioStyle && style.audio) {
    const audioIn = style.audio as ProfileTemplate["audio"];
    patch.audio = {
      ...base.audio,
      playerStyle: audioIn.playerStyle ?? base.audio.playerStyle,
      eqStyle: audioIn.eqStyle ?? base.audio.eqStyle,
      eqColor: audioIn.eqColor ?? base.audio.eqColor,
      showCover: audioIn.showCover ?? base.audio.showCover,
      playerSize: audioIn.playerSize ?? base.audio.playerSize,
      visualizer: audioIn.visualizer ?? base.audio.visualizer,
      // Keep track wiring / autoplay prefs
      trackPlayer: base.audio.trackPlayer,
      autoPlay: base.audio.autoPlay,
      defaultVolume: base.audio.defaultVolume,
      playbackMode: base.audio.playbackMode,
    };
  }

  if ((options.backgroundLook || options.backgroundMedia) && style.background) {
    const bgIn = style.background as ProfileTemplate["background"];
    patch.background = {
      ...base.background,
      ...(options.backgroundLook
        ? {
            color: bgIn.color,
            size: bgIn.size,
            blur: bgIn.blur,
            opacity: bgIn.opacity,
            position: bgIn.position,
            dim: bgIn.dim,
            gradient: bgIn.gradient,
            gradientColor: bgIn.gradientColor,
            animatedGradient: bgIn.animatedGradient,
            zoom: bgIn.zoom,
          }
        : {}),
      url: options.backgroundMedia ? bgIn.url : base.background.url,
    };
  }

  if ((options.bannerLook || options.bannerMedia) && style.banner) {
    const bnIn = style.banner as ProfileTemplate["banner"];
    patch.banner = {
      ...base.banner,
      ...(options.bannerLook
        ? {
            opacity: bnIn.opacity,
            blur: bnIn.blur,
            height: bnIn.height,
            position: bnIn.position,
            overlay: bnIn.overlay,
            overlayOpacity: bnIn.overlayOpacity,
            saturate: bnIn.saturate,
            grayscale: bnIn.grayscale,
            parallax: bnIn.parallax,
          }
        : {}),
      url: options.bannerMedia ? bnIn.url : base.banner.url,
    };
  }

  // mergeTemplate keeps links/badges/tags/tracks/showcases from base when omitted
  return mergeTemplate(base, patch);
}

export function parseStyleConfig(input: unknown): StyleConfigSlice | null {
  const parsed = styleSliceSchema.safeParse(input);
  if (!parsed.success) return null;
  return parsed.data as StyleConfigSlice;
}

export function canPublishThemeTemplates(
  profile: Pick<ProfileRow, "created_at" | "can_publish_templates" | "discord_id">,
): { ok: true } | { ok: false; reason: string; daysLeft?: number } {
  if (isAdminDiscordId(profile.discord_id)) return { ok: true };
  if (profile.can_publish_templates) return { ok: true };

  const created = new Date(profile.created_at).getTime();
  const needMs = ACCOUNT_AGE_DAYS_FOR_TEMPLATES * 24 * 60 * 60 * 1000;
  const age = Date.now() - created;
  if (age >= needMs) return { ok: true };

  const daysLeft = Math.ceil((needMs - age) / (24 * 60 * 60 * 1000));
  return {
    ok: false,
    reason: `Your account must be at least ${ACCOUNT_AGE_DAYS_FOR_TEMPLATES} days old to publish themes.`,
    daysLeft,
  };
}

export const publishThemeSchema = z.object({
  name: z.string().trim().min(3).max(48),
  description: z.string().trim().max(280).default(""),
  category: z.enum([
    "dark",
    "light",
    "minimal",
    "neon",
    "aesthetic",
    "other",
  ]),
});

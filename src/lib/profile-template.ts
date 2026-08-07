import { z } from "zod";

const mediaUrl = z
  .string()
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v),
    "Must be empty, relative path, or http(s) URL",
  );

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

/** Canonical under.bio AI profile JSON template - keep in sync with UI + renderer */
export const profileTemplateSchema = z.object({
  version: z.literal("1.0.0"),
  meta: z.object({
    slug: z
      .string()
      .min(3)
      .max(25)
      .regex(/^[a-z0-9]([a-z0-9_-]{1,23}[a-z0-9])?$/, "Invalid slug"),
    displayName: z.string().min(1).max(32),
    description: z.string().max(2000).default(""),
    location: z.string().max(80).default(""),
    pageTitle: z.string().max(60).default(""),
    statusText: z.string().max(80).default(""),
  }),
  options: z.object({
    showThemeOnIcons: z.boolean().default(true),
    showViews: z.boolean().default(true),
    showUid: z.boolean().default(false),
    showDiscordPresence: z.boolean().default(true),
    showJoinDate: z.boolean().default(true),
    showRevealScreen: z.boolean().default(false),
    showLocation: z.boolean().default(true),
    showTags: z.boolean().default(true),
    showSocialIcons: z.boolean().default(true),
    showUnderBadge: z.boolean().default(true),
    showBadges: z.boolean().default(true),
    showRank: z.boolean().default(true),
    showVerified: z.boolean().default(true),
    showOwnerBadge: z.boolean().default(true),
    showStatusDot: z.boolean().default(true),
    showBio: z.boolean().default(true),
    showMusic: z.boolean().default(true),
    showCornerAccents: z.boolean().default(true),
  }),
  layout: z.object({
    style: z.enum(["default", "simple", "stack", "compact", "wide"]).default("default"),
    alignment: z.enum(["left", "center", "right"]).default("left"),
    gap: z.number().min(2).max(36).default(12),
    contentScale: z.number().min(70).max(110).default(100),
    compact: z.boolean().default(false),
    avatarSide: z.enum(["left", "center", "right"]).default("left"),
    socialPosition: z.enum(["under-bio", "under-name", "bottom"]).default("under-bio"),
    tagsPosition: z.enum(["under-name", "under-badges", "under-bio"]).default("under-badges"),
    presenceStyle: z.enum(["card", "pill", "minimal"]).default("card"),
  }),
  audio: z.object({
    trackPlayer: z.enum(["none", "embed", "mini"]).default("none"),
    playbackMode: z.enum(["loop", "shuffle", "once"]).default("loop"),
    autoPlay: z.boolean().default(true),
    defaultVolume: z.number().min(0).max(100).default(80),
    visualizer: z.boolean().default(true),
    playerStyle: z.enum(["default", "glass", "minimal", "neon"]).default("default"),
    showCover: z.boolean().default(true),
    eqStyle: z.enum(["bars", "wave", "dots"]).default("bars"),
    eqColor: z.enum(["white", "theme", "rainbow"]).default("white"),
  }),
  page: z.object({
    titleAnimation: z
      .enum([
        "none",
        "flashing",
        "typing",
        "glitch",
        "shine",
        "wave",
        "bounce",
        "neon",
        "rainbow",
        "blur",
      ])
      .default("none"),
    titleAnimationSpeed: z.number().min(1).max(100).default(50),
    overlay: z
      .enum([
        "none",
        "vignette",
        "scanlines",
        "noise",
        "grid",
        "crt",
        "vhs",
        "fog",
        "chromatic",
        "stars",
      ])
      .default("none"),
    overlayOpacity: z.number().min(0).max(100).default(55),
    enterAnimation: z
      .enum(["none", "fade", "slide-up", "zoom", "blur-in", "bounce", "flip"])
      .default("slide-up"),
    enterAnimationSpeed: z.number().min(1).max(100).default(55),
    revealText: z.string().max(120).default("Click to enter"),
    revealBlur: z.number().min(0).max(40).default(12),
    revealStyle: z.enum(["fade", "blur", "zoom", "glitch"]).default("fade"),
    particles: z
      .enum(["none", "dust", "snow", "embers", "rain", "stars", "sparkle", "matrix", "ash"])
      .default("none"),
    particleDensity: z.number().min(10).max(100).default(40),
    particleSpeed: z.number().min(10).max(100).default(50),
    particleColor: z.enum(["white", "theme", "warm", "cool"]).default("white"),
  }),
  effects: z.object({
    aurora: z.enum(["none", "soft", "strong", "pulse"]).default("none"),
    auroraIntensity: z.number().min(0).max(100).default(40),
    floatingOrbs: z.boolean().default(false),
    orbCount: z.number().min(2).max(12).default(4),
    orbIntensity: z.number().min(0).max(100).default(35),
    ambientPulse: z.boolean().default(false),
    rgbSplit: z.boolean().default(false),
    rgbIntensity: z.number().min(0).max(20).default(4),
    bloom: z.boolean().default(false),
    bloomIntensity: z.number().min(0).max(100).default(30),
    filmBars: z.boolean().default(false),
    filmBarSize: z.number().min(4).max(80).default(28),
    bgMotion: z.enum(["none", "drift", "zoom", "kenburns"]).default("none"),
    bgMotionSpeed: z.number().min(10).max(100).default(40),
    cardSheen: z.boolean().default(false),
    borderAnimate: z.boolean().default(false),
    borderAnimateSpeed: z.number().min(10).max(100).default(40),
    nameGradient: z.boolean().default(false),
    nameGradientFrom: hex.default("#FFFFFF"),
    nameGradientTo: hex.default("#888888"),
    magneticSocials: z.boolean().default(false),
    hoverLift: z.number().min(0).max(16).default(4),
    watermark: z.boolean().default(false),
    watermarkText: z.string().max(40).default("under.bio"),
    watermarkOpacity: z.number().min(0).max(40).default(8),
    shakeBadges: z.boolean().default(false),
    pulseRank: z.boolean().default(true),
    spotlight: z.boolean().default(false),
    spotlightIntensity: z.number().min(0).max(100).default(35),
  }),
  appearance: z.object({
    themeColor: hex.default("#FFFFFF"),
    accentSecondary: hex.default("#A8A8A8"),
    primaryText: hex.default("#FFFFFF"),
    secondaryText: hex.default("#A8A8A8"),
    font: z
      .enum([
        "syne",
        "outfit",
        "space-grotesk",
        "dm-sans",
        "bebas",
        "rubik",
        "cinzel",
        "space-mono",
      ])
      .default("syne"),
    bioFont: z.enum(["inherit", "outfit", "dm-sans", "space-mono", "cinzel"]).default("inherit"),
    usernameSparkles: z.enum(["none", "white", "black", "theme"]).default("none"),
    avatarRadius: z.number().min(0).max(50).default(50),
    avatarDecoration: z
      .enum(["none", "ring", "glow", "pulse", "spin-ring", "hex", "square-glow"])
      .default("glow"),
    avatarSize: z.number().min(48).max(140).default(76),
    avatarBorderWidth: z.number().min(0).max(8).default(0),
    avatarBorderColor: hex.default("#FFFFFF"),
    avatarShadow: z.number().min(0).max(100).default(40),
    avatarOffsetY: z.number().min(-20).max(40).default(0),
    cursor: z.enum(["system", "minimal", "dot", "cross", "custom"]).default("system"),
    customCursorUrl: mediaUrl.default(""),
    cursorSize: z.number().min(8).max(48).default(12),
    cursorTrail: z.enum(["none", "fade", "spark", "smoke"]).default("none"),
    cursorTrailLength: z.number().min(4).max(24).default(10),
    clickSound: z.enum(["none", "soft", "click", "pop"]).default("none"),
    tagStyle: z.enum(["pill", "square", "ghost", "outline", "neon"]).default("pill"),
    tagSize: z.number().min(10).max(18).default(12),
    tagBgOpacity: z.number().min(0).max(100).default(0),
    tagBorderWidth: z.number().min(0).max(3).default(1),
    iconStyle: z.enum(["colored", "mono", "theme", "invert"]).default("colored"),
    socialShape: z.enum(["rounded", "circle", "square", "soft"]).default("rounded"),
    socialSize: z.number().min(28).max(56).default(40),
    socialGap: z.number().min(4).max(20).default(10),
    socialBgOpacity: z.number().min(0).max(100).default(8),
    socialGlow: z.number().min(0).max(100).default(20),
    badgeSize: z.number().min(24).max(44).default(32),
    badgeGap: z.number().min(2).max(14).default(6),
    badgeGlow: z.boolean().default(true),
    badgeStyle: z.enum(["glass", "flat", "neon", "minimal"]).default("glass"),
    grain: z.number().min(0).max(100).default(0),
    accentGlow: z.number().min(0).max(100).default(35),
    nameSize: z.number().min(16).max(56).default(28),
    nameWeight: z.number().min(400).max(900).default(700),
    nameLetterSpacing: z.number().min(-4).max(12).default(0),
    nameUppercase: z.boolean().default(false),
    nameItalic: z.boolean().default(false),
    bioSize: z.number().min(11).max(20).default(14),
    bioOpacity: z.number().min(30).max(100).default(100),
    bioItalic: z.boolean().default(false),
    bioAlign: z.enum(["inherit", "left", "center", "right"]).default("inherit"),
    bioLineHeight: z.number().min(120).max(200).default(160),
    dividerStyle: z.enum(["none", "line", "gradient", "dots"]).default("gradient"),
    statusDotColor: hex.default("#34D399"),
    textShadow: z.number().min(0).max(100).default(0),
    hueRotate: z.number().min(0).max(360).default(0),
    saturate: z.number().min(50).max(200).default(100),
    contrast: z.number().min(80).max(140).default(100),
    brightness: z.number().min(70).max(130).default(100),
    globalBlur: z.number().min(0).max(8).default(0),
  }),
  box: z.object({
    width: z.number().min(280).max(900).default(560),
    innerSpacing: z.number().min(8).max(80).default(20),
    color: hex.default("#141414"),
    opacity: z.number().min(0).max(100).default(100),
    radius: z.number().min(0).max(48).default(18),
    blur: z.number().min(0).max(60).default(0),
    tilt: z.enum(["none", "subtle", "standard", "strong", "extreme"]).default("standard"),
    tiltScale: z.number().min(100).max(108).default(102),
    shadowColor: hex.default("#000000"),
    shadowOpacity: z.number().min(0).max(100).default(45),
    shadowBlur: z.number().min(0).max(120).default(50),
    shadowY: z.number().min(0).max(80).default(18),
    borderWidth: z.number().min(0).max(8).default(1),
    borderColor: hex.default("#FFFFFF"),
    borderOpacity: z.number().min(0).max(100).default(10),
    borderStyle: z
      .enum(["solid", "dashed", "dotted", "double", "soft", "glow", "none"])
      .default("solid"),
    glow: z.boolean().default(true),
    innerGlow: z.boolean().default(false),
    innerGlowOpacity: z.number().min(0).max(60).default(20),
    pattern: z.enum(["none", "dots", "grid", "diagonal", "noise"]).default("none"),
    patternOpacity: z.number().min(0).max(40).default(10),
    gradientFill: z.boolean().default(false),
    gradientFrom: hex.default("#141414"),
    gradientTo: hex.default("#0A0A0A"),
    saturate: z.number().min(50).max(160).default(100),
  }),
  banner: z.object({
    url: mediaUrl.default(""),
    opacity: z.number().min(0).max(100).default(100),
    blur: z.number().min(0).max(40).default(0),
    height: z.number().min(60).max(260).default(140),
    position: z.enum(["center", "top", "bottom"]).default("center"),
    overlay: z.enum(["none", "dark", "theme", "gradient"]).default("gradient"),
    overlayOpacity: z.number().min(0).max(100).default(55),
    saturate: z.number().min(0).max(200).default(100),
    grayscale: z.number().min(0).max(100).default(0),
    parallax: z.boolean().default(false),
  }),
  background: z.object({
    url: mediaUrl.default(""),
    size: z.enum(["cover", "contain", "auto"]).default("cover"),
    blur: z.number().min(0).max(40).default(0),
    opacity: z.number().min(0).max(100).default(100),
    color: hex.default("#0A0A0A"),
    position: z.enum(["center", "top", "bottom"]).default("center"),
    dim: z.number().min(0).max(80).default(0),
    gradient: z.enum(["none", "radial", "linear", "mesh"]).default("none"),
    gradientColor: hex.default("#1A1A1A"),
    animatedGradient: z.boolean().default(false),
    zoom: z.number().min(100).max(140).default(100),
  }),
  links: z
    .array(
      z.object({
        label: z.string().min(1).max(40),
        url: z.string().url(),
        icon: z.string().max(40).default("link"),
      }),
    )
    .max(40)
    .default([]),
  badges: z
    .array(
      z.object({
        name: z.string().min(1).max(40),
        icon: z.string().max(40).default("certificate"),
        description: z.string().max(120).default(""),
      }),
    )
    .max(24)
    .default([]),
  tags: z.array(z.string().min(1).max(24)).max(20).default([]),
  tracks: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        url: mediaUrl,
        cover: mediaUrl.optional().default(""),
      }),
    )
    .max(10)
    .default([]),
  showcases: z
    .array(
      z.object({
        type: z.enum(["discord"]).default("discord"),
        inviteCode: z.string().max(40).default(""),
        title: z.string().max(80).default(""),
        subtitle: z.string().max(120).default(""),
        url: z.string().max(200).default(""),
        image: mediaUrl.default(""),
        online: z.number().min(0).max(1000000).default(0),
        members: z.number().min(0).max(10000000).default(0),
      }),
    )
    .max(5)
    .default([]),
});

export type ProfileTemplate = z.infer<typeof profileTemplateSchema>;

/** Clean starter for brand-new accounts - no fake bio/location/tags */
export const DEFAULT_PROFILE_TEMPLATE: ProfileTemplate = profileTemplateSchema.parse({
  version: "1.0.0",
  meta: {
    slug: "user",
    displayName: "User",
    description: "",
    location: "",
    pageTitle: "under.bio",
    statusText: "",
  },
  options: {},
  layout: {},
  audio: {},
  page: {},
  effects: {},
  appearance: {},
  box: {},
  banner: {},
  background: {},
  links: [],
  badges: [],
  tags: [],
  tracks: [],
  showcases: [],
});

export function parseProfileTemplate(input: unknown) {
  return profileTemplateSchema.safeParse(input);
}

export function mergeTemplate(
  base: ProfileTemplate,
  patch: Partial<ProfileTemplate>,
): ProfileTemplate {
  return profileTemplateSchema.parse({
    ...base,
    ...patch,
    meta: { ...base.meta, ...patch.meta },
    options: { ...base.options, ...patch.options },
    layout: { ...base.layout, ...patch.layout },
    audio: { ...base.audio, ...patch.audio },
    page: { ...base.page, ...patch.page },
    effects: { ...base.effects, ...patch.effects },
    appearance: { ...base.appearance, ...patch.appearance },
    box: { ...base.box, ...patch.box },
    banner: { ...base.banner, ...patch.banner },
    background: { ...base.background, ...patch.background },
    links: patch.links ?? base.links,
    badges: patch.badges ?? base.badges,
    tags: patch.tags ?? base.tags,
    tracks: patch.tracks ?? base.tracks,
    showcases: patch.showcases ?? base.showcases,
  });
}

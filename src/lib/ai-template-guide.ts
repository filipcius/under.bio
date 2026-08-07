import { BADGE_PRESETS, SOCIAL_PLATFORMS } from "@/lib/socials";

const socialIds = SOCIAL_PLATFORMS.map((s) => s.id).join(", ");
const badgeIds = BADGE_PRESETS.map((b) => b.id).join(", ");

/** Shared field dictionary for AI — exact allowed values */
export const AI_FIELD_GUIDE = `
## under.bio profile JSON — field options (USE ONLY THESE VALUES)

version: must be exactly "1.0.0"
Colors: hex strings like "#FFFFFF" (6 hex digits, with #)
Media URLs: "" or "/path" or "https://..."

### meta
- slug: string 3–25, lowercase a-z0-9_- (start/end alphanumeric)
- displayName: string 1–32
- description: string max 2000 (\\n for line breaks)
- location: string max 80
- pageTitle: string max 60
- statusText: string max 80

### options (booleans)
showThemeOnIcons, showViews, showUid, showDiscordPresence, showJoinDate,
showRevealScreen, showLocation, showTags, showSocialIcons, showUnderBadge,
showBadges, showRank, showVerified, showOwnerBadge, showStatusDot, showBio,
showMusic, showCornerAccents

### layout
- style: "default" | "simple" | "stack" | "compact" | "wide"
- alignment: "left" | "center" | "right"
- gap: number 2–36
- contentScale: number 70–110
- compact: boolean
- avatarSide: "left" | "center" | "right"
- socialPosition: "under-bio" | "under-name" | "bottom"
- tagsPosition: "under-name" | "under-badges" | "under-bio"
- presenceStyle: "card" | "pill" | "minimal"

### audio
- trackPlayer: "none" | "embed" | "mini"
- playbackMode: "loop" | "shuffle" | "once"
- autoPlay: boolean
- defaultVolume: 0–100
- visualizer: boolean
- playerStyle: "default" | "glass" | "minimal" | "neon"   [neon/glass = VOID]
- showCover: boolean
- playerSize: 72–168 (square cover edge in px; album art stays 1:1)
- eqStyle: "bars" | "wave" | "dots"
- eqColor: "white" | "theme" | "rainbow"

### page
- titleAnimation: "none" | "flashing" | "typing" | "glitch" | "shine" | "wave" | "bounce" | "neon" | "rainbow" | "blur"
  FREE only: "none" | "flashing" | "shine"
- titleAnimationSpeed: 1–100
- overlay: "none" | "vignette" | "scanlines" | "noise" | "grid" | "crt" | "vhs" | "fog" | "chromatic" | "stars"
  FREE only: "none" | "vignette"
- overlayOpacity: 0–100
- enterAnimation: "none" | "fade" | "slide-up" | "zoom" | "blur-in" | "bounce" | "flip"
  FREE only: "none" | "fade" | "slide-up"
- enterAnimationSpeed: 1–100
- revealText: string max 120
- revealHint: string max 80
- revealBlur: 0–40
- revealStyle: "fade" | "blur" | "zoom" | "glitch"   [blur/zoom/glitch = VOID]
- revealUseTheme: boolean (true = gate uses page bg + primary text)
- revealTextColor / revealBgColor: hex (used when revealUseTheme is false)
- particles: "none" | "dust" | "snow" | "embers" | "rain" | "stars" | "sparkle" | "matrix" | "ash"
  FREE: must be "none"
- particleDensity: 10–100
- particleSpeed: 10–100
- particleColor: "white" | "theme" | "warm" | "cool"

### effects (most are VOID)
- aurora: "none" | "soft" | "strong" | "pulse"
- auroraIntensity: 0–100
- floatingOrbs, ambientPulse, rgbSplit, bloom, filmBars, cardSheen, borderAnimate,
  nameGradient, magneticSocials, watermark, shakeBadges, pulseRank, spotlight: boolean
- orbCount: 2–12 · orbIntensity: 0–100 · rgbIntensity: 0–20 · bloomIntensity: 0–100
- filmBarSize: 4–80 · bgMotionSpeed: 10–100 · borderAnimateSpeed: 10–100
- bgMotion: "none" | "drift" | "zoom" | "kenburns"
- nameGradientFrom / nameGradientTo: hex
- hoverLift: 0–16 · watermarkText max 40 · watermarkOpacity 0–40 · spotlightIntensity 0–100
FREE: keep effects at defaults / off (only pulseRank may stay true)

### appearance
- themeColor, accentSecondary, primaryText, secondaryText, avatarBorderColor, statusDotColor: hex
- font: "syne" | "outfit" | "space-grotesk" | "dm-sans" | "bebas" | "rubik" | "cinzel" | "space-mono"
- bioFont: "inherit" | "outfit" | "dm-sans" | "space-mono" | "cinzel"
- usernameSparkles: "none" | "white" | "black" | "theme"
- avatarDecoration: "none" | "ring" | "glow" | "pulse" | "spin-ring" | "hex" | "square-glow" (CSS effect — separate from Discord Nitro decoration toggle showDiscordAvatarDecoration)
- showDiscordAvatarDecoration: boolean (Discord shop/Nitro avatar decoration overlay)
  FREE: avoid "spin-ring" | "hex"
- avatarRadius 0–50 · avatarSize 48–140 · avatarBorderWidth 0–8 · avatarShadow 0–100 · avatarOffsetY -20–40
- cursor: "system" | "minimal" | "dot" | "cross" | "custom"   FREE: "system" only
- customCursorUrl: media url · cursorSize 8–48
- cursorTrail: "none" | "fade" | "spark" | "smoke"   FREE: "none"
- cursorTrailLength 4–24
- clickSound: "none" | "soft" | "click" | "pop"
- tagStyle: "pill" | "square" | "ghost" | "outline" | "neon"   FREE: no "neon"
- tagSize 10–18 · tagBgOpacity 0–100 · tagBorderWidth 0–3
- iconStyle: "colored" | "mono" | "theme" | "invert"
- socialShape: "rounded" | "circle" | "square" | "soft"
- socialSize 28–56 · socialGap 4–20 · socialBgOpacity 0–100 · socialGlow 0–100
- badgeSize 24–44 · badgeGap 2–14 · badgeGlow boolean
- badgeStyle: "glass" | "flat" | "neon" | "minimal"
- grain 0–100 (FREE max ~15) · accentGlow 0–100
- nameSize 16–56 · nameWeight 400–900 · nameLetterSpacing -4–12 · nameUppercase/nameItalic boolean
- bioSize 11–20 · bioOpacity 30–100 · bioItalic boolean
- bioAlign: "inherit" | "left" | "center" | "right"
- bioLineHeight 120–200
- dividerStyle: "none" | "line" | "gradient" | "dots"
- textShadow 0–100 · hueRotate 0–360 · saturate 50–200 · contrast 80–140 · brightness 70–130 · globalBlur 0–8

### box (layout panels)
- width 280–900 · innerSpacing 8–80 · color hex · opacity 0–100 · radius 0–48
- blur 0–60 (FREE max 8)
- tilt: "none" | "subtle" | "standard" | "strong" | "extreme"
  FREE: "none" | "standard"
- tiltScale 100–108
- shadowColor hex · shadowOpacity 0–100 · shadowBlur 0–120 · shadowY 0–80
- borderWidth 0–8 · borderColor hex · borderOpacity 0–100
- borderStyle: "solid" | "dashed" | "dotted" | "double" | "soft" | "glow" | "none"
- glow boolean · innerGlow boolean (VOID) · innerGlowOpacity 0–60
- pattern: "none" | "dots" | "grid" | "diagonal" | "noise"   FREE: "none"
- patternOpacity 0–40
- gradientFill boolean (VOID) · gradientFrom/To hex · saturate 50–160

### banner
- url media · opacity 0–100 · blur 0–40 · height 60–260
- position: "center" | "top" | "bottom"
- overlay: "none" | "dark" | "theme" | "gradient"
- overlayOpacity 0–100 · saturate 0–200 · grayscale 0–100 · parallax boolean

### background
- url media · size: "cover" | "contain" | "auto"
- blur 0–40 · opacity 0–100 · color hex
- position: "center" | "top" | "bottom"
- dim 0–80
- gradient: "none" | "radial" | "linear" | "mesh"   FREE: no "mesh"
- gradientColor hex · animatedGradient boolean (VOID) · zoom 100–140 (FREE keep 100)

### links[] (FREE max 6, VOID max 40)
{ "label": string, "url": "https://...", "icon": one of: ${socialIds} }

### badges[] (FREE max 6, VOID max 24)
{ "name": string, "icon": one of: ${badgeIds}, "description": tooltip string }

### tags[] (FREE max 3, VOID max 20) — strings max 24 chars

### tracks[] (max 10)
{ "title": string, "url": media, "cover": media }

### showcases[] Discord cards (FREE: [], VOID max 5)
{ "type": "discord", "inviteCode": string, "title": string, "subtitle": string,
  "url": "https://discord.gg/...", "image": media, "online": number, "members": number }

## Rules
1. Return ONE valid JSON object only (no markdown fences).
2. Do not invent enum values — pick from lists above.
3. Keep version "1.0.0".
4. You may keep keys starting with "_" out of the final JSON (or leave them; importer strips them).
`.trim();

export function buildAiPrompt(tier: "void" | "free", templateJson: string) {
  const tierNote =
    tier === "void"
      ? `TIER: VOID (paid). You MAY use every option listed, including particles, VHS/CRT overlays, custom cursors, Discord showcases, neon tags, aurora, etc.`
      : `TIER: FREE. ONLY use free-allowed values marked above. No particles, no custom cursor, overlay only none|vignette, titleAnimation only none|flashing|shine, enterAnimation only none|fade|slide-up, showcases must be [], max 6 links / 6 badges / 3 tags.`;

  return `${tierNote}

${AI_FIELD_GUIDE}

## Task
Fill the following under.bio profile JSON for a clean, distinctive public page.
Replace placeholders (yourname, bio, links, colors) with a coherent design.
Return ONLY the completed JSON object.

## Template to fill
${templateJson}
`;
}

export const TEMPLATE_FILES = {
  void: {
    label: "VOID",
    blurb: "Full schema — particles, VHS, cursors, Discord cards, all effects.",
    example: "/templates/example-void.json",
    template: "/templates/underbio-void.template.json",
    guide: "/templates/ai-guide-void.txt",
  },
  free: {
    label: "Free",
    blurb: "Free-safe options only — valid without a VOID subscription.",
    example: "/templates/example-free.json",
    template: "/templates/underbio-free.template.json",
    guide: "/templates/ai-guide-free.txt",
  },
} as const;

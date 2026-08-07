/**
 * Regenerates public AI JSON templates from the live Zod schema defaults.
 * Run: npx tsx scripts/generate-templates.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  DEFAULT_PROFILE_TEMPLATE,
  profileTemplateSchema,
} from "../src/lib/profile-template";
import { enforceFreePlanConfig } from "../src/lib/plan";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const voidFilled = profileTemplateSchema.parse({
  ...DEFAULT_PROFILE_TEMPLATE,
  meta: {
    slug: "yourname",
    displayName: "Your Name",
    description: "Short bio.\nSecond line ok.",
    location: "City / Region",
    pageTitle: "yourname | under.bio",
    statusText: "Custom status",
  },
  options: {
    ...DEFAULT_PROFILE_TEMPLATE.options,
    showRevealScreen: false,
    showCornerAccents: true,
  },
  layout: {
    ...DEFAULT_PROFILE_TEMPLATE.layout,
    style: "default",
    alignment: "left",
    presenceStyle: "card",
  },
  page: {
    ...DEFAULT_PROFILE_TEMPLATE.page,
    titleAnimation: "shine",
    overlay: "vhs",
    enterAnimation: "fade",
    particles: "dust",
    particleColor: "warm",
  },
  effects: {
    ...DEFAULT_PROFILE_TEMPLATE.effects,
    aurora: "soft",
    cardSheen: true,
    nameGradient: true,
    nameGradientFrom: "#FFFFFF",
    nameGradientTo: "#A8A8A8",
  },
  appearance: {
    ...DEFAULT_PROFILE_TEMPLATE.appearance,
    themeColor: "#FFFFFF",
    primaryText: "#FFFFFF",
    secondaryText: "#A8A8A8",
    font: "syne",
    cursor: "minimal",
    cursorTrail: "fade",
    avatarDecoration: "ring",
    tagStyle: "ghost",
    iconStyle: "mono",
    socialShape: "soft",
    badgeStyle: "minimal",
    dividerStyle: "line",
  },
  box: {
    ...DEFAULT_PROFILE_TEMPLATE.box,
    width: 560,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderOpacity: 12,
    tilt: "subtle",
    glow: false,
  },
  banner: {
    ...DEFAULT_PROFILE_TEMPLATE.banner,
    url: "",
    overlay: "gradient",
  },
  background: {
    ...DEFAULT_PROFILE_TEMPLATE.background,
    color: "#0A0A0A",
    gradient: "radial",
    gradientColor: "#1A1A1A",
  },
  audio: {
    ...DEFAULT_PROFILE_TEMPLATE.audio,
    trackPlayer: "embed",
    playerStyle: "glass",
  },
  links: [
    {
      label: "Discord",
      url: "https://discord.com/users/000000000000000000",
      icon: "discord",
    },
    {
      label: "Instagram",
      url: "https://instagram.com/you",
      icon: "instagram",
    },
  ],
  badges: [{ name: "Star", icon: "star", description: "Hover tip" }],
  tags: ["design", "music"],
  tracks: [{ title: "Artist - Track", url: "", cover: "" }],
  showcases: [
    {
      type: "discord",
      inviteCode: "xkyQjTsGts",
      title: "My Discord Server",
      subtitle: "",
      url: "https://discord.gg/xkyQjTsGts",
      image: "",
      online: 0,
      members: 0,
    },
  ],
});

const freeFilled = enforceFreePlanConfig(
  profileTemplateSchema.parse({
    ...DEFAULT_PROFILE_TEMPLATE,
    meta: {
      slug: "yourname",
      displayName: "Your Name",
      description: "Short bio.\nSecond line ok.",
      location: "City / Region",
      pageTitle: "yourname | under.bio",
      statusText: "Custom status",
    },
    page: {
      ...DEFAULT_PROFILE_TEMPLATE.page,
      titleAnimation: "shine",
      overlay: "vignette",
      enterAnimation: "slide-up",
      particles: "none",
    },
    appearance: {
      ...DEFAULT_PROFILE_TEMPLATE.appearance,
      themeColor: "#FFFFFF",
      primaryText: "#FFFFFF",
      secondaryText: "#A8A8A8",
      font: "syne",
      cursor: "system",
      cursorTrail: "none",
      avatarDecoration: "glow",
      tagStyle: "pill",
      iconStyle: "colored",
    },
    box: {
      ...DEFAULT_PROFILE_TEMPLATE.box,
      width: 560,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#FFFFFF",
      borderOpacity: 10,
      tilt: "standard",
      blur: 0,
    },
    background: {
      ...DEFAULT_PROFILE_TEMPLATE.background,
      color: "#0A0A0A",
      gradient: "none",
    },
    audio: {
      ...DEFAULT_PROFILE_TEMPLATE.audio,
      trackPlayer: "embed",
      playerStyle: "default",
    },
    links: [
      {
        label: "Discord",
        url: "https://discord.com/users/000000000000000000",
        icon: "discord",
      },
      {
        label: "Instagram",
        url: "https://instagram.com/you",
        icon: "instagram",
      },
    ],
    badges: [{ name: "Star", icon: "star", description: "Hover tip" }],
    tags: ["design", "music"],
    tracks: [{ title: "Artist - Track", url: "", cover: "" }],
    showcases: [],
  }),
);

function wrap(
  tier: "void" | "free",
  body: Record<string, unknown>,
  instructions: string,
) {
  const { version: _v, ...rest } = body as { version: string } & Record<string, unknown>;
  return {
    version: "1.0.0" as const,
    _tier: tier,
    _schemaVersion: "1.0.0",
    _updated: new Date().toISOString().slice(0, 10),
    _instructions: instructions,
    ...rest,
  };
}

const voidOut = wrap(
  "void",
  voidFilled as unknown as Record<string, unknown>,
  "VOID / full under.bio AI template. Fill every field, then import in Dashboard → Identity → Import JSON. Uses VOID-only options (particles, VHS, cursors, Discord cards, neon tags, etc.). Free accounts will have locked fields stripped on save.",
);

const freeOut = wrap(
  "free",
  freeFilled as unknown as Record<string, unknown>,
  "FREE under.bio AI template. Only free-tier options. Max 6 links, 6 badges, 3 tags, no Discord showcase cards, no custom cursors/particles/VHS. Import in Dashboard → Identity → Import JSON.",
);

const emptyVoid = wrap(
  "void",
  {
    ...DEFAULT_PROFILE_TEMPLATE,
    meta: {
      slug: "yourname",
      displayName: "Your Name",
      description: "",
      location: "",
      pageTitle: "under.bio",
      statusText: "",
    },
  } as unknown as Record<string, unknown>,
  "Empty VOID schema shell — all current fields with defaults. Give to an AI to fill a full profile.",
);

const emptyFree = wrap(
  "free",
  enforceFreePlanConfig({
    ...DEFAULT_PROFILE_TEMPLATE,
    meta: {
      slug: "yourname",
      displayName: "Your Name",
      description: "",
      location: "",
      pageTitle: "under.bio",
      statusText: "",
    },
  }) as unknown as Record<string, unknown>,
  "Empty FREE schema shell — free-safe defaults only. Give to an AI to fill a free profile.",
);

const targets: [string, unknown][] = [
  ["public/templates/underbio-void.template.json", emptyVoid],
  ["public/templates/underbio-free.template.json", emptyFree],
  ["public/templates/example-void.json", voidOut],
  ["public/templates/example-free.json", freeOut],
  ["public/templates/underbio-profile.template.json", emptyVoid],
  ["public/templates/example-profile.json", voidOut],
  ["templates/underbio-void.template.json", emptyVoid],
  ["templates/underbio-free.template.json", emptyFree],
  ["templates/example-void.json", voidOut],
  ["templates/example-free.json", freeOut],
  ["templates/underbio-profile.template.json", emptyVoid],
  ["templates/example-profile.json", voidOut],
];

for (const [rel, data] of targets) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log("wrote", rel);
}

console.log("OK — void + free templates regenerated");

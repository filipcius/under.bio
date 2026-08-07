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
import { AI_FIELD_GUIDE, buildAiPrompt } from "../src/lib/ai-template-guide";

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
    _aiGuide: AI_FIELD_GUIDE,
    ...rest,
  };
}

const voidBrief =
  "VOID template. Paste into an AI WITH _aiGuide (lists every allowed enum). Fill all fields. Import in Dashboard → Identity. Free accounts will strip VOID-only values on save.";
const freeBrief =
  "FREE template. Paste into an AI WITH _aiGuide. Only free-safe enums. Caps: 6 links, 6 badges, 3 tags, showcases []. Import in Dashboard → Identity.";

const voidOut = wrap("void", voidFilled as unknown as Record<string, unknown>, voidBrief);
const freeOut = wrap("free", freeFilled as unknown as Record<string, unknown>, freeBrief);

const emptyVoidBody = {
  ...DEFAULT_PROFILE_TEMPLATE,
  meta: {
    slug: "yourname",
    displayName: "Your Name",
    description: "",
    location: "",
    pageTitle: "under.bio",
    statusText: "",
  },
};
const emptyFreeBody = enforceFreePlanConfig({
  ...DEFAULT_PROFILE_TEMPLATE,
  meta: {
    slug: "yourname",
    displayName: "Your Name",
    description: "",
    location: "",
    pageTitle: "under.bio",
    statusText: "",
  },
});

const emptyVoid = wrap(
  "void",
  emptyVoidBody as unknown as Record<string, unknown>,
  voidBrief,
);
const emptyFree = wrap(
  "free",
  emptyFreeBody as unknown as Record<string, unknown>,
  freeBrief,
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

const textGuides: [string, string][] = [
  [
    "public/templates/ai-guide-void.txt",
    buildAiPrompt("void", JSON.stringify(emptyVoid, null, 2)),
  ],
  [
    "public/templates/ai-guide-free.txt",
    buildAiPrompt("free", JSON.stringify(emptyFree, null, 2)),
  ],
  [
    "templates/ai-guide-void.txt",
    buildAiPrompt("void", JSON.stringify(emptyVoid, null, 2)),
  ],
  [
    "templates/ai-guide-free.txt",
    buildAiPrompt("free", JSON.stringify(emptyFree, null, 2)),
  ],
];

for (const [rel, text] of textGuides) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text, "utf8");
  console.log("wrote", rel);
}

console.log("OK — void + free templates + AI guides regenerated");

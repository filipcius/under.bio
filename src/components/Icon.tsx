"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowRight,
  faArrowLeft,
  faChartLine,
  faCheck,
  faCopy,
  faDownload,
  faArrowUpRightFromSquare,
  faGear,
  faHouse,
  faLink,
  faMusic,
  faCertificate,
  faTags,
  faUpload,
  faUser,
  faEye,
  faIdCard,
  faStar,
  faCircleInfo,
  faRightFromBracket,
  faStore,
  faLocationDot,
  faCalendarDays,
  faPause,
  faPlay,
  faEnvelope,
  faGlobe,
  faCrown,
  faFire,
  faHeart,
  faBolt,
  faGem,
  faShieldHalved,
  faTrophy,
  faRocket,
  faCode,
  faGamepad,
  faGhost,
  faSkull,
  faMoon,
  faSun,
  faLeaf,
  faCamera,
  faPalette,
  faVolumeHigh,
  faVolumeLow,
  faGift,
  faKey,
  faWandMagicSparkles,
  faDragon,
  faAnkh,
  faChessKnight,
} from "@fortawesome/free-solid-svg-icons";
import {
  faDiscord,
  faInstagram,
  faXTwitter,
  faYoutube,
  faTiktok,
  faTwitch,
  faSpotify,
  faSoundcloud,
  faSteam,
  faGithub,
  faGitlab,
  faLinkedin,
  faReddit,
  faTelegram,
  faWhatsapp,
  faSnapchat,
  faFacebook,
  faPinterest,
  faTumblr,
  faThreads,
  faKickstarterK,
  faPatreon,
  faPaypal,
  faBitcoin,
  faEthereum,
  faXbox,
  faPlaystation,
  faApple,
  faBandcamp,
  faBehance,
  faDribbble,
  faDeviantart,
  faMedium,
  faKickstarter,
  faVimeo,
  faVk,
  faWeibo,
  faWeixin,
  faLine,
  faMastodon,
  faBluesky,
  faStrava,
  faLastfm,
  faDeezer,
  faItunes,
  faAmazon,
  faEbay,
  faEtsy,
  faShopify,
  faFigma,
  faSketch,
  faStackOverflow,
  faNpm,
  faDocker,
  faUnity,
  faUnsplash,
  faFlickr,
  faGoodreads,
  faImdb,
  faLetterboxd,
  faArtstation,
  faSquareOdnoklassniki,
} from "@fortawesome/free-brands-svg-icons";
import { cn } from "@/lib/utils";

/** Custom brand marks Font Awesome does not ship */
function CustomMark({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const common = cn("inline-block h-[1em] w-[1em]", className);
  if (name === "onlyfans") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.7 14.2c-1.9 1.1-4.4.7-5.8-1-1.5-1.8-1.3-4.5.4-6.1 1.6-1.5 4.1-1.6 5.8-.2.3.3.3.7 0 1l-.9.9a.7.7 0 01-1 0c-.8-.7-2-.7-2.8.1-.9.9-1 2.3-.2 3.2.8.9 2.2 1 3.1.2.3-.2.7-.2 1 0l.9.8c.3.3.3.7 0 1l-.5.1z" />
      </svg>
    );
  }
  if (name === "cashapp") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M23.59 3.47a5.1 5.1 0 00-3.05-3.12C18.7.08 12 .06 12 .06s-6.7.02-8.54.3A5.1 5.1 0 00.41 3.47C.13 5.3.11 12 .11 12s.02 6.7.3 8.54a5.1 5.1 0 003.05 3.12c1.84.28 8.54.3 8.54.3s6.7-.02 8.54-.3a5.1 5.1 0 003.05-3.12c.28-1.84.3-8.54.3-8.54s-.02-6.7-.3-8.53zM12.9 16.9v1.5h-1.8v-1.55a4.5 4.5 0 01-3.4-1.55l1.35-1.4c.7.8 1.55 1.25 2.5 1.25.85 0 1.4-.4 1.4-1 0-.6-.4-.9-1.7-1.35-1.95-.65-3.25-1.45-3.25-3.35 0-1.7 1.25-3 3.1-3.35V4.6h1.8v1.5c1.25.2 2.25.85 2.95 1.75l-1.35 1.25c-.55-.7-1.25-1.05-2.1-1.05-.85 0-1.35.4-1.35.95 0 .6.4.9 1.8 1.4 2 .7 3.15 1.55 3.15 3.4 0 1.8-1.3 3.1-3.15 3.45z" />
      </svg>
    );
  }
  if (name === "venmo") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M19.5 3.1c.9 1.35 1.3 2.7 1.3 4.4 0 5.45-4.65 12.55-8.4 17.5H5.3L2.2 4.05l5.1-.45 1.65 13.25c1.55-2.55 3.45-6.55 3.45-9.3 0-1.5-.25-2.55-.65-3.45L19.5 3.1z" />
      </svg>
    );
  }
  if (name === "anilist") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M6.4 3h3.2L14 21h-3.4l-.9-3.4H6.2L5.3 21H2L6.4 3zm1.3 11.2h2.5L9 8.4l-1.3 5.8zM16.2 3H22v2.4h-3.4V21h-2.4V3z" />
      </svg>
    );
  }
  if (name === "osu") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="12" cy="12" r="3.2" />
      </svg>
    );
  }
  if (name === "roblox") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M18.9 2.3L5.05 5.95 2.2 19.85 16.05 22.7 18.9 2.3zM10.7 14.4l-1.75-6.6 6.55-1.75 1.75 6.6-6.55 1.75z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
    </svg>
  );
}

const map: Record<string, IconDefinition> = {
  discord: faDiscord,
  instagram: faInstagram,
  "x-twitter": faXTwitter,
  youtube: faYoutube,
  tiktok: faTiktok,
  twitch: faTwitch,
  spotify: faSpotify,
  soundcloud: faSoundcloud,
  steam: faSteam,
  github: faGithub,
  gitlab: faGitlab,
  linkedin: faLinkedin,
  reddit: faReddit,
  telegram: faTelegram,
  whatsapp: faWhatsapp,
  snapchat: faSnapchat,
  facebook: faFacebook,
  pinterest: faPinterest,
  tumblr: faTumblr,
  threads: faThreads,
  kick: faKickstarterK,
  patreon: faPatreon,
  paypal: faPaypal,
  bitcoin: faBitcoin,
  ethereum: faEthereum,
  xbox: faXbox,
  playstation: faPlaystation,
  apple: faApple,
  bandcamp: faBandcamp,
  behance: faBehance,
  dribbble: faDribbble,
  deviantart: faDeviantart,
  medium: faMedium,
  notion: faGlobe,
  envelope: faEnvelope,
  location: faLocationDot,
  calendar: faCalendarDays,
  pause: faPause,
  play: faPlay,
  arrowRight: faArrowRight,
  arrowLeft: faArrowLeft,
  chart: faChartLine,
  check: faCheck,
  copy: faCopy,
  download: faDownload,
  external: faArrowUpRightFromSquare,
  gear: faGear,
  home: faHouse,
  link: faLink,
  music: faMusic,
  certificate: faCertificate,
  tags: faTags,
  upload: faUpload,
  user: faUser,
  eye: faEye,
  id: faIdCard,
  sparkles: faStar,
  info: faCircleInfo,
  logout: faRightFromBracket,
  shop: faStore,
  star: faStar,
  crown: faCrown,
  fire: faFire,
  heart: faHeart,
  bolt: faBolt,
  gem: faGem,
  shield: faShieldHalved,
  trophy: faTrophy,
  rocket: faRocket,
  code: faCode,
  gamepad: faGamepad,
  ghost: faGhost,
  skull: faSkull,
  moon: faMoon,
  sun: faSun,
  leaf: faLeaf,
  camera: faCamera,
  palette: faPalette,
  volumeHigh: faVolumeHigh,
  volumeLow: faVolumeLow,
  kickstarter: faKickstarter,
  gift: faGift,
  key: faKey,
  wand: faWandMagicSparkles,
  dragon: faDragon,
  ankh: faAnkh,
  chess: faChessKnight,
  vimeo: faVimeo,
  vk: faVk,
  weibo: faWeibo,
  wechat: faWeixin,
  line: faLine,
  mastodon: faMastodon,
  bluesky: faBluesky,
  strava: faStrava,
  lastfm: faLastfm,
  deezer: faDeezer,
  itunes: faItunes,
  amazon: faAmazon,
  ebay: faEbay,
  etsy: faEtsy,
  shopify: faShopify,
  figma: faFigma,
  sketch: faSketch,
  stackoverflow: faStackOverflow,
  npm: faNpm,
  docker: faDocker,
  unity: faUnity,
  unsplash: faUnsplash,
  flickr: faFlickr,
  goodreads: faGoodreads,
  imdb: faImdb,
  letterboxd: faLetterboxd,
  artstation: faArtstation,
  odnoklassniki: faSquareOdnoklassniki,
};

const CUSTOM = new Set([
  "onlyfans",
  "cashapp",
  "venmo",
  "anilist",
  "osu",
  "roblox",
]);

export function Icon({
  name,
  className,
  glow = true,
  style,
}: {
  name: string;
  className?: string;
  glow?: boolean;
  style?: React.CSSProperties;
}) {
  if (CUSTOM.has(name)) {
    return (
      <span className={cn(glow && "icon-glow", "inline-flex", className)} style={style}>
        <CustomMark name={name} />
      </span>
    );
  }
  const icon = map[name] ?? faLink;
  return (
    <FontAwesomeIcon
      icon={icon}
      className={cn(glow && "icon-glow", className)}
      style={style as never}
    />
  );
}

export function hasSocialIcon(name: string) {
  return Boolean(map[name]) || CUSTOM.has(name);
}

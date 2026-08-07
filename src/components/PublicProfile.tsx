"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ProfileTemplate } from "@/lib/profile-template";
import { hexToRgba } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { TrackPlayer } from "@/components/TrackPlayer";
import { TiltPanel } from "@/components/TiltPanel";
import { DiscordShowcase } from "@/components/DiscordShowcase";
import { AnimatedName } from "@/components/AnimatedName";
import { OwnerBadge, VerifiedBadge } from "@/components/VerifiedBadge";
import { CustomCursor } from "@/components/CustomCursor";
import { FitViewport } from "@/components/FitViewport";
import { BadgeShelf } from "@/components/BadgeShelf";
import {
  BoxPattern,
  PageOverlay,
  ProfileAurora,
  ProfileOrbs,
  ProfileParticles,
} from "@/components/ProfileEffects";
import { SOCIAL_PLATFORMS } from "@/lib/socials";

function relativeJoin(joinedAt: string) {
  const diff = Date.now() - new Date(joinedAt).getTime();
  const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  if (hours < 1) return "Joined just now";
  if (hours < 24) return `Joined ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Joined ${days} day${days === 1 ? "" : "s"} ago`;
  return `Joined ${new Date(joinedAt).toLocaleDateString()}`;
}

function cleanCopy(text: string) {
  return text.replace(/[\u2014\u2013]/g, "-").replace(/ -- /g, " - ");
}

function fontClass(font: ProfileTemplate["appearance"]["font"]) {
  return (
    {
      syne: "font-syne",
      outfit: "font-outfit",
      "space-grotesk": "font-space-grotesk",
      "dm-sans": "font-dm-sans",
      bebas: "font-bebas",
      rubik: "font-rubik",
      cinzel: "font-cinzel",
      "space-mono": "font-space-mono",
    } as const
  )[font];
}

function bioFontClass(font: ProfileTemplate["appearance"]["bioFont"]) {
  if (font === "inherit") return "";
  return (
    {
      outfit: "font-outfit",
      "dm-sans": "font-dm-sans",
      "space-mono": "font-space-mono",
      cinzel: "font-cinzel",
    } as const
  )[font];
}

function tiltStrengthOf(tilt: ProfileTemplate["box"]["tilt"]) {
  if (tilt === "subtle") return 6;
  if (tilt === "standard") return 10;
  if (tilt === "strong") return 16;
  if (tilt === "extreme") return 24;
  return 0;
}

function socialRadius(shape: ProfileTemplate["appearance"]["socialShape"]) {
  if (shape === "circle") return 999;
  if (shape === "square") return 6;
  if (shape === "soft") return 14;
  return 12;
}

export function PublicProfile({
  config,
  avatarUrl,
  uid,
  totalViews,
  rank,
  joinedAt,
  discordUsername,
  isOwner,
  discordVerified,
}: {
  config: ProfileTemplate;
  avatarUrl?: string | null;
  uid: number;
  totalViews: number;
  rank: number | null;
  joinedAt: string;
  discordUsername: string;
  isOwner: boolean;
  discordVerified: boolean;
}) {
  const [revealed, setRevealed] = useState(!config.options.showRevealScreen);
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const primary = config.appearance.primaryText;
  const secondary = config.appearance.secondaryText;
  const theme = config.appearance.themeColor;
  const border = hexToRgba(config.box.borderColor, config.box.borderOpacity);
  const panelBg = config.box.gradientFill
    ? `linear-gradient(160deg, ${hexToRgba(config.box.gradientFrom, config.box.opacity)}, ${hexToRgba(config.box.gradientTo, config.box.opacity)})`
    : hexToRgba(config.box.color, config.box.opacity);
  const tiltEnabled = config.box.tilt !== "none";
  const tiltStrength = tiltStrengthOf(config.box.tilt);
  const gap = config.layout.compact ? Math.min(config.layout.gap, 8) : config.layout.gap;
  const a = config.appearance;
  const fx = config.effects;

  const customCursorOn =
    a.cursor === "minimal" ||
    a.cursor === "dot" ||
    a.cursor === "cross" ||
    (a.cursor === "custom" && Boolean(a.customCursorUrl));

  useEffect(() => {
    document.documentElement.classList.add("ub-profile-lock");
    document.body.classList.add("ub-profile-lock");
    return () => {
      document.documentElement.classList.remove("ub-profile-lock");
      document.body.classList.remove("ub-profile-lock");
    };
  }, []);

  const panelStyle = useMemo(
    () => ({
      background: panelBg,
      border: `${config.box.borderWidth}px ${config.box.borderStyle} ${border}`,
      borderRadius: config.box.radius,
      boxShadow: [
        `0 ${config.box.shadowY}px ${config.box.shadowBlur}px ${hexToRgba(config.box.shadowColor, config.box.shadowOpacity)}`,
        config.box.glow
          ? `0 0 ${a.accentGlow}px ${hexToRgba(theme, 25)}`
          : "",
        config.box.innerGlow
          ? `inset 0 0 40px ${hexToRgba(theme, config.box.innerGlowOpacity)}`
          : "",
      ]
        .filter(Boolean)
        .join(", "),
      color: primary,
      backdropFilter: config.box.blur ? `blur(${config.box.blur}px)` : undefined,
      filter: `saturate(${config.box.saturate}%)`,
      position: "relative" as const,
      overflow: "hidden" as const,
    }),
    [panelBg, border, config.box, primary, theme, a.accentGlow],
  );

  const enterMap = {
    none: { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" },
    fade: { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" },
    "slide-up": { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" },
    zoom: { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" },
    "blur-in": { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" },
    bounce: { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" },
    flip: { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" },
  }[config.page.enterAnimation];

  const initialMap = {
    none: { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" },
    fade: { opacity: 0, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" },
    "slide-up": { opacity: 0, y: 28, scale: 1, rotateX: 0, filter: "blur(0px)" },
    zoom: { opacity: 0, y: 8, scale: 0.96, rotateX: 0, filter: "blur(0px)" },
    "blur-in": { opacity: 0, y: 10, scale: 1, rotateX: 0, filter: "blur(12px)" },
    bounce: { opacity: 0, y: 40, scale: 0.9, rotateX: 0, filter: "blur(0px)" },
    flip: { opacity: 0, y: 0, scale: 1, rotateX: 55, filter: "blur(0px)" },
  }[config.page.enterAnimation];

  const align =
    config.layout.alignment === "center"
      ? "items-center text-center"
      : config.layout.alignment === "right"
        ? "items-end text-right"
        : "items-start text-left";
  const justify =
    config.layout.alignment === "center"
      ? "justify-center"
      : config.layout.alignment === "right"
        ? "justify-end"
        : "";

  const tagClass =
    a.tagStyle === "square"
      ? "rounded-md"
      : a.tagStyle === "ghost"
        ? "rounded-full border-transparent"
        : a.tagStyle === "outline"
          ? "rounded-full bg-transparent"
          : a.tagStyle === "neon"
            ? "rounded-full"
            : "rounded-full";

  const socialColor = (icon: string) => {
    if (a.iconStyle === "mono") return primary;
    if (a.iconStyle === "theme") return theme;
    if (a.iconStyle === "invert") return a.accentSecondary;
    return SOCIAL_PLATFORMS.find((s) => s.id === icon)?.color || primary;
  };

  const avatarSide =
    config.layout.avatarSide === "center" || config.layout.alignment === "center"
      ? "center"
      : config.layout.avatarSide === "right" || config.layout.alignment === "right"
        ? "right"
        : "left";

  const track = config.tracks[0];
  const boxWidth =
    config.layout.style === "wide"
      ? Math.min(900, config.box.width + 80)
      : config.layout.style === "compact"
        ? Math.max(320, config.box.width - 40)
        : config.box.width;

  const nameStyle: React.CSSProperties = {
    fontSize: a.nameSize,
    fontWeight: a.nameWeight,
    letterSpacing: `${a.nameLetterSpacing}px`,
    textTransform: a.nameUppercase ? "uppercase" : undefined,
    fontStyle: a.nameItalic ? "italic" : undefined,
    textShadow:
      a.textShadow > 0
        ? `0 0 ${a.textShadow / 3}px ${hexToRgba(theme, a.textShadow)}`
        : a.usernameSparkles !== "none"
          ? `0 0 18px ${hexToRgba(theme, 45)}`
          : undefined,
    ...(fx.nameGradient
      ? {
          backgroundImage: `linear-gradient(90deg, ${fx.nameGradientFrom}, ${fx.nameGradientTo})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }
      : {}),
  };

  const tagsBlock =
    config.options.showTags && config.tags.length > 0 ? (
      <div className={`mt-3 flex flex-wrap gap-2 ${justify}`}>
        {config.tags.map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i }}
            className={`${tagClass} px-2.5 py-1`}
            style={{
              fontSize: a.tagSize,
              borderWidth: a.tagBorderWidth,
              borderStyle: "solid",
              borderColor:
                a.tagStyle === "neon" ? theme : hexToRgba(theme, 35),
              color: theme,
              background:
                a.tagStyle === "neon"
                  ? hexToRgba(theme, 12)
                  : hexToRgba(theme, a.tagBgOpacity),
              boxShadow:
                a.tagStyle === "neon" ? `0 0 14px ${hexToRgba(theme, 35)}` : undefined,
            }}
          >
            {tag}
          </motion.span>
        ))}
      </div>
    ) : null;

  const socialsBlock =
    config.options.showSocialIcons && config.links.length > 0 ? (
      <div
        className={`mt-4 flex flex-wrap ${justify}`}
        style={{ gap: a.socialGap }}
      >
        {config.links.map((link) => (
          <motion.a
            key={`${link.icon}-${link.url}`}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            data-cursor-hover
            whileHover={{
              scale: fx.magneticSocials ? 1.18 : 1.12,
              y: -fx.hoverLift,
            }}
            className="flex items-center justify-center border border-white/10 backdrop-blur-sm transition hover:border-white/25"
            title={link.label}
            style={{
              width: a.socialSize,
              height: a.socialSize,
              borderRadius: socialRadius(a.socialShape),
              color: socialColor(link.icon),
              background: hexToRgba("#FFFFFF", a.socialBgOpacity),
              boxShadow: `0 0 ${a.socialGlow}px ${hexToRgba(socialColor(link.icon), 22)}`,
            }}
          >
            <Icon name={link.icon} className="text-base" />
          </motion.a>
        ))}
      </div>
    ) : null;

  if (!revealed) {
    return (
      <>
        <CustomCursor
          mode={a.cursor}
          customUrl={a.customCursorUrl}
          color={theme}
          size={a.cursorSize}
          trail={a.cursorTrail}
          trailLength={a.cursorTrailLength}
        />
        <button
          type="button"
          data-cursor-hover
          onClick={() => setRevealed(true)}
          className="flex h-dvh w-full items-center justify-center overflow-hidden"
          style={{
            background: config.background.color,
            cursor: customCursorOn ? "none" : "auto",
            backdropFilter: `blur(${config.page.revealBlur}px)`,
          }}
        >
          <span className="reveal-pulse section-title text-2xl text-white/90">
            {config.page.revealText}
          </span>
        </button>
      </>
    );
  }

  return (
    <div
      className={`relative h-dvh w-full overflow-hidden ${fontClass(a.font)}`}
      style={{
        backgroundColor: config.background.color,
        cursor: customCursorOn ? "none" : "auto",
        filter: `hue-rotate(${a.hueRotate}deg) saturate(${a.saturate}%) contrast(${a.contrast}%) brightness(${a.brightness}%) blur(${a.globalBlur}px)`,
      }}
      onMouseMove={(e) => {
        if (!fx.spotlight) return;
        const r = e.currentTarget.getBoundingClientRect();
        setSpot({
          x: ((e.clientX - r.left) / r.width) * 100,
          y: ((e.clientY - r.top) / r.height) * 100,
        });
      }}
    >
      <CustomCursor
        mode={a.cursor}
        customUrl={a.customCursorUrl}
        color={theme}
        size={a.cursorSize}
        trail={a.cursorTrail}
        trailLength={a.cursorTrailLength}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: config.background.url
            ? `url(${config.background.url})`
            : config.background.gradient === "radial"
              ? `radial-gradient(circle at 30% 20%, ${config.background.gradientColor}, ${config.background.color})`
              : config.background.gradient === "linear"
                ? `linear-gradient(160deg, ${config.background.gradientColor}, ${config.background.color})`
                : config.background.gradient === "mesh"
                  ? `radial-gradient(at 20% 20%, ${hexToRgba(config.background.gradientColor, 55)}, transparent 40%), radial-gradient(at 80% 0%, ${hexToRgba(theme, 20)}, transparent 35%), ${config.background.color}`
                  : undefined,
          backgroundSize: config.background.size,
          backgroundPosition: config.background.position,
          opacity: config.background.opacity / 100,
          filter: config.background.blur ? `blur(${config.background.blur}px)` : undefined,
          transform: `scale(${config.background.zoom / 100})`,
        }}
        animate={
          fx.bgMotion === "drift"
            ? { x: [0, 12, -8, 0], y: [0, -10, 6, 0] }
            : fx.bgMotion === "zoom" || fx.bgMotion === "kenburns"
              ? { scale: [config.background.zoom / 100, config.background.zoom / 100 + 0.06, config.background.zoom / 100] }
              : undefined
        }
        transition={{
          duration: 14 - fx.bgMotionSpeed / 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {config.background.dim > 0 && (
        <div className="absolute inset-0 bg-black" style={{ opacity: config.background.dim / 100 }} />
      )}

      <ProfileAurora mode={fx.aurora} intensity={fx.auroraIntensity} theme={theme} />
      <ProfileOrbs
        enabled={fx.floatingOrbs}
        count={fx.orbCount}
        intensity={fx.orbIntensity}
        theme={theme}
      />
      <ProfileParticles
        mode={config.page.particles}
        density={config.page.particleDensity}
        speed={config.page.particleSpeed}
        colorMode={config.page.particleColor}
        theme={theme}
      />
      <PageOverlay mode={config.page.overlay} opacity={config.page.overlayOpacity} />

      {a.grain > 0 && (
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            opacity: a.grain / 100,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      )}

      {fx.spotlight && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, ${hexToRgba(theme, fx.spotlightIntensity / 3)}, transparent 55%)`,
          }}
        />
      )}

      {fx.filmBars && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-50 bg-black" style={{ height: fx.filmBarSize }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 bg-black" style={{ height: fx.filmBarSize }} />
        </>
      )}

      {fx.watermark && (
        <div
          className="pointer-events-none absolute bottom-4 right-4 z-40 text-xs uppercase tracking-[0.25em]"
          style={{ color: hexToRgba("#FFFFFF", fx.watermarkOpacity) }}
        >
          {fx.watermarkText}
        </div>
      )}

      <FitViewport className="relative z-10" pad={16}>
        <motion.div
          initial={initialMap}
          animate={enterMap}
          transition={{
            duration: 0.5 + config.page.enterAnimationSpeed / 220,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative flex flex-col"
          style={{
            width: boxWidth,
            maxWidth: "92vw",
            gap,
            transform: `scale(${config.layout.contentScale / 100})`,
            filter: fx.rgbSplit
              ? `drop-shadow(${fx.rgbIntensity}px 0 0 rgba(255,0,80,0.35)) drop-shadow(-${fx.rgbIntensity}px 0 0 rgba(0,200,255,0.35))`
              : fx.bloom
                ? `drop-shadow(0 0 ${fx.bloomIntensity / 3}px ${hexToRgba(theme, 40)})`
                : undefined,
          }}
        >
          <TiltPanel
            enabled={tiltEnabled}
            strength={tiltStrength}
            hoverScale={config.box.tiltScale / 100}
            style={panelStyle}
            className={`relative ${fx.borderAnimate ? "ub-border-animate" : ""}`}
          >
            <BoxPattern pattern={config.box.pattern} opacity={config.box.patternOpacity} />
            {fx.cardSheen && <div className="pointer-events-none absolute inset-0 ub-card-sheen" />}
            {config.options.showCornerAccents && (
              <>
                <div className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l border-t border-white/25" />
                <div className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r border-t border-white/25" />
                <div className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b border-l border-white/20" />
                <div className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b border-r border-white/20" />
              </>
            )}

            <div className="relative">
              {config.banner.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.banner.url}
                  alt=""
                  className="w-full object-cover"
                  style={{
                    height: config.banner.height,
                    opacity: config.banner.opacity / 100,
                    objectPosition: config.banner.position,
                    filter: `blur(${config.banner.blur}px) saturate(${config.banner.saturate}%) grayscale(${config.banner.grayscale}%)`,
                  }}
                />
              ) : (
                <div
                  className="w-full bg-gradient-to-br from-white/14 via-white/5 to-transparent"
                  style={{ height: config.banner.height }}
                />
              )}
              {config.banner.overlay !== "none" && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    opacity: config.banner.overlayOpacity / 100,
                    background:
                      config.banner.overlay === "theme"
                        ? `linear-gradient(to top, ${hexToRgba(theme, 55)}, transparent)`
                        : config.banner.overlay === "dark"
                          ? "linear-gradient(to top, rgba(0,0,0,0.75), transparent)"
                          : "linear-gradient(to top, rgba(0,0,0,0.7), transparent 55%)",
                  }}
                />
              )}

              <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1.5">
                {config.options.showViews && (
                  <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-xs text-white/90 backdrop-blur-md">
                    <Icon name="eye" className="text-[10px]" glow={false} />
                    <span className="tabular-nums">{totalViews.toLocaleString()}</span>
                  </div>
                )}
                {config.options.showRank && rank != null && (
                  <motion.div
                    className="flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-black/60 px-2.5 py-1 text-xs text-amber-100 backdrop-blur-md"
                    animate={fx.pulseRank ? { scale: [1, 1.05, 1] } : undefined}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  >
                    <Icon name="trophy" className="text-[10px] text-amber-300" glow={false} />
                    #{rank}
                  </motion.div>
                )}
              </div>

              <motion.div
                className="absolute"
                style={{
                  bottom: -a.avatarSize / 2.4 + a.avatarOffsetY,
                  left: avatarSide === "center" ? "50%" : avatarSide === "right" ? "auto" : 16,
                  right: avatarSide === "right" ? 16 : "auto",
                  transform: avatarSide === "center" ? "translateX(-50%)" : undefined,
                }}
                animate={
                  a.avatarDecoration === "glow" ||
                  a.avatarDecoration === "pulse" ||
                  a.avatarDecoration === "square-glow"
                    ? {
                        y: [0, -3, 0],
                        filter: [
                          `drop-shadow(0 0 8px ${hexToRgba(theme, 30)})`,
                          `drop-shadow(0 0 22px ${hexToRgba(theme, 55)})`,
                          `drop-shadow(0 0 8px ${hexToRgba(theme, 30)})`,
                        ],
                      }
                    : a.avatarDecoration === "ring"
                      ? { rotate: [0, 2, -2, 0] }
                      : undefined
                }
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                {(a.avatarDecoration === "spin-ring" ||
                  a.avatarDecoration === "glow" ||
                  a.avatarDecoration === "hex") && (
                  <div
                    className="absolute -inset-1 opacity-80"
                    style={{
                      background: `conic-gradient(from 180deg, ${hexToRgba(theme, 0)}, ${hexToRgba(theme, 70)}, ${hexToRgba(theme, 0)})`,
                      borderRadius:
                        a.avatarDecoration === "hex" ? "18%" : `${a.avatarRadius}%`,
                      animation:
                        a.avatarDecoration === "spin-ring"
                          ? "spin 6s linear infinite"
                          : undefined,
                    }}
                  />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl || "/avatar-fallback.svg"}
                  alt=""
                  className="relative object-cover ring-4 ring-[#0e0e0e]"
                  style={{
                    width: a.avatarSize,
                    height: a.avatarSize,
                    borderRadius:
                      a.avatarDecoration === "hex" || a.avatarDecoration === "square-glow"
                        ? "18%"
                        : `${a.avatarRadius}%`,
                    border:
                      a.avatarBorderWidth > 0
                        ? `${a.avatarBorderWidth}px solid ${a.avatarBorderColor}`
                        : undefined,
                    boxShadow: `0 8px ${a.avatarShadow}px ${hexToRgba("#000000", 55)}`,
                  }}
                />
              </motion.div>
            </div>

            <div
              className={`relative z-[1] ${align}`}
              style={{
                paddingLeft: config.box.innerSpacing,
                paddingRight: config.box.innerSpacing,
                paddingBottom: config.box.innerSpacing,
                paddingTop: a.avatarSize / 2 + 18,
              }}
            >
              <div className={`flex flex-wrap items-center gap-2 ${justify}`}>
                <AnimatedName
                  text={cleanCopy(config.meta.displayName)}
                  mode={config.page.titleAnimation}
                  speed={config.page.titleAnimationSpeed}
                  className="section-title"
                  style={nameStyle}
                />
                {config.options.showVerified && (discordVerified || isOwner) && (
                  <VerifiedBadge size={18} />
                )}
                {config.options.showOwnerBadge && isOwner && <OwnerBadge size={14} />}
                {config.options.showUid && (
                  <span className="text-xs" style={{ color: secondary }}>
                    UID {uid}
                  </span>
                )}
              </div>

              {config.layout.socialPosition === "under-name" && socialsBlock}

              {config.options.showBadges && config.badges.length > 0 && (
                <BadgeShelf
                  badges={config.badges}
                  theme={theme}
                  alignCenter={config.layout.alignment === "center"}
                  size={a.badgeSize}
                  gap={a.badgeGap}
                  glow={a.badgeGlow}
                  style={a.badgeStyle}
                  shake={fx.shakeBadges}
                />
              )}

              {config.layout.tagsPosition === "under-name" && tagsBlock}
              {config.layout.tagsPosition === "under-badges" && tagsBlock}

              {config.options.showBio && config.meta.description && (
                <>
                  {a.dividerStyle !== "none" && (
                    <div
                      className="my-3 h-px w-full"
                      style={{
                        background:
                          a.dividerStyle === "gradient"
                            ? `linear-gradient(90deg, transparent, ${hexToRgba(theme, 35)}, transparent)`
                            : a.dividerStyle === "dots"
                              ? `repeating-linear-gradient(90deg, ${hexToRgba(theme, 40)} 0 2px, transparent 2px 8px)`
                              : hexToRgba("#FFFFFF", 12),
                      }}
                    />
                  )}
                  <p
                    className={`whitespace-pre-wrap ${bioFontClass(a.bioFont)}`}
                    style={{
                      color: secondary,
                      fontSize: a.bioSize,
                      opacity: a.bioOpacity / 100,
                      fontStyle: a.bioItalic ? "italic" : undefined,
                      lineHeight: `${a.bioLineHeight}%`,
                      textAlign:
                        a.bioAlign === "inherit"
                          ? undefined
                          : (a.bioAlign as "left" | "center" | "right"),
                    }}
                  >
                    {cleanCopy(config.meta.description)}
                  </p>
                </>
              )}

              {config.layout.tagsPosition === "under-bio" && tagsBlock}

              <div className="mt-3 space-y-1.5 text-sm" style={{ color: secondary }}>
                {config.options.showLocation && config.meta.location && (
                  <p className={`flex items-center gap-2 ${justify}`}>
                    <Icon name="location" className="text-xs" glow={false} />
                    {cleanCopy(config.meta.location)}
                  </p>
                )}
                {config.options.showJoinDate && (
                  <p className={`flex items-center gap-2 ${justify}`}>
                    <Icon name="calendar" className="text-xs" glow={false} />
                    {relativeJoin(joinedAt)}
                  </p>
                )}
              </div>

              {(config.layout.socialPosition === "under-bio" ||
                config.layout.socialPosition === "bottom") &&
                socialsBlock}
            </div>
          </TiltPanel>

          {(config.options.showDiscordPresence || config.meta.statusText) && (
            <TiltPanel
              enabled={tiltEnabled}
              strength={tiltStrength * 0.7}
              style={panelStyle}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 ${
                config.layout.presenceStyle === "pill" ? "!rounded-full" : ""
              } ${config.layout.presenceStyle === "minimal" ? "!border-0 !bg-transparent !shadow-none" : ""}`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl || "/avatar-fallback.svg"}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  {config.options.showStatusDot && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#141414]"
                      style={{
                        background: a.statusDotColor,
                        boxShadow: `0 0 10px ${a.statusDotColor}`,
                      }}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                    {cleanCopy(config.meta.displayName)}
                    {config.options.showVerified && <VerifiedBadge size={14} />}
                  </p>
                  <p className="truncate text-xs" style={{ color: secondary }}>
                    {cleanCopy(config.meta.statusText || `@${discordUsername}`)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {config.options.showOwnerBadge && isOwner && <OwnerBadge size={12} />}
                {config.options.showUnderBadge && (
                  <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/40">
                    under
                  </span>
                )}
              </div>
            </TiltPanel>
          )}

          {config.showcases.map((item) => {
            const code = item.inviteCode || item.url;
            if (!code) return null;
            return (
              <TiltPanel
                key={`${code}-${item.title}`}
                enabled={tiltEnabled}
                strength={tiltStrength * 0.8}
              >
                <DiscordShowcase
                  inviteCode={code}
                  fallback={{
                    title: item.title,
                    image: item.image,
                    online: item.online,
                    members: item.members,
                    inviteUrl: item.url || `https://discord.gg/${item.inviteCode}`,
                  }}
                  panelStyle={panelStyle}
                  secondary={secondary}
                />
              </TiltPanel>
            );
          })}

          {config.options.showMusic &&
            config.audio.trackPlayer !== "none" &&
            track?.url && (
              <TiltPanel enabled={tiltEnabled} strength={tiltStrength * 0.75}>
                <TrackPlayer
                  title={track.title}
                  url={track.url}
                  cover={config.audio.showCover ? track.cover : undefined}
                  loop={config.audio.playbackMode === "loop"}
                  autoPlay={config.audio.autoPlay}
                  defaultVolume={config.audio.defaultVolume}
                  visualizer={config.audio.visualizer}
                  primary={primary}
                  secondary={secondary}
                  border={border}
                />
              </TiltPanel>
            )}
        </motion.div>
      </FitViewport>
    </div>
  );
}

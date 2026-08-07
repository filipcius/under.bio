"use client";

import { useState, useTransition } from "react";
import type { ProfileTemplate } from "@/lib/profile-template";
import { saveProfileConfig } from "@/app/actions/profile";
import { SaveBar } from "@/components/forms/SaveBar";
import { Slider } from "@/components/forms/Slider";
import { MediaUpload } from "@/components/forms/MediaUpload";
import { SoftOnOff, SoftSelect } from "@/components/forms/SoftSelect";
import { Icon } from "@/components/Icon";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="label">
        <span>{label}</span>
        {hint && <span className="help">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className="section-title text-lg">{title}</h2>
        <span className="text-xs text-white/40">{open ? "Hide" : "Show"}</span>
      </button>
      {open && <div className="grid gap-4 border-t border-white/5 px-4 py-4 sm:grid-cols-2">{children}</div>}
    </section>
  );
}

type SetConfig = React.Dispatch<React.SetStateAction<ProfileTemplate>>;

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input
          type="color"
          className="h-11 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input className="soft-input" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </Field>
  );
}

export function MiscEditor({ initial }: { initial: ProfileTemplate }) {
  const [config, setConfig] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const set = setConfig as SetConfig;

  return (
    <div className="space-y-4">
      <p className="help">
        Full style lab - media, motion, effects, typography, panels, audio. Experiment hard, then
        Save.
      </p>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
        <Icon name="info" className="mr-2 text-xs" />
        {Object.keys(config.appearance).length + Object.keys(config.effects).length}+ knobs live
        here. Collapse sections you are not using.
      </div>

      <Section title="Media">
        <div className="sm:col-span-2 grid gap-5 sm:grid-cols-2">
          <MediaUpload
            label="Banner image"
            hint="png/jpg/webp/gif · max 8MB"
            kind="banner"
            accept="image/png,image/jpeg,image/webp,image/gif"
            value={config.banner.url}
            onChange={(url) => set((c) => ({ ...c, banner: { ...c.banner, url } }))}
          />
          <MediaUpload
            label="Background image"
            hint="png/jpg/webp/gif · max 25MB"
            kind="background"
            accept="image/png,image/jpeg,image/webp,image/gif"
            value={config.background.url}
            onChange={(url) => set((c) => ({ ...c, background: { ...c.background, url } }))}
          />
        </div>
        <Field label="Banner height" hint={`${config.banner.height}px`}>
          <Slider min={60} max={260} value={config.banner.height} onChange={(height) => set((c) => ({ ...c, banner: { ...c.banner, height } }))} />
        </Field>
        <Field label="Banner opacity" hint={`${config.banner.opacity}%`}>
          <Slider min={0} max={100} value={config.banner.opacity} onChange={(opacity) => set((c) => ({ ...c, banner: { ...c.banner, opacity } }))} />
        </Field>
        <Field label="Banner blur" hint={`${config.banner.blur}`}>
          <Slider min={0} max={40} value={config.banner.blur} onChange={(blur) => set((c) => ({ ...c, banner: { ...c.banner, blur } }))} />
        </Field>
        <Field label="Banner position">
          <SoftSelect value={config.banner.position} onChange={(position) => set((c) => ({ ...c, banner: { ...c.banner, position: position as ProfileTemplate["banner"]["position"] } }))} options={[{ value: "center", label: "Center" }, { value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }]} />
        </Field>
        <Field label="Banner overlay">
          <SoftSelect value={config.banner.overlay} onChange={(overlay) => set((c) => ({ ...c, banner: { ...c.banner, overlay: overlay as ProfileTemplate["banner"]["overlay"] } }))} options={[{ value: "none", label: "None" }, { value: "dark", label: "Dark" }, { value: "theme", label: "Theme" }, { value: "gradient", label: "Gradient" }]} />
        </Field>
        <Field label="Banner overlay strength" hint={`${config.banner.overlayOpacity}%`}>
          <Slider min={0} max={100} value={config.banner.overlayOpacity} onChange={(overlayOpacity) => set((c) => ({ ...c, banner: { ...c.banner, overlayOpacity } }))} />
        </Field>
        <Field label="Banner saturate" hint={`${config.banner.saturate}%`}>
          <Slider min={0} max={200} value={config.banner.saturate} onChange={(saturate) => set((c) => ({ ...c, banner: { ...c.banner, saturate } }))} />
        </Field>
        <Field label="Banner grayscale" hint={`${config.banner.grayscale}%`}>
          <Slider min={0} max={100} value={config.banner.grayscale} onChange={(grayscale) => set((c) => ({ ...c, banner: { ...c.banner, grayscale } }))} />
        </Field>
        <Field label="Banner parallax">
          <SoftOnOff value={config.banner.parallax} onChange={(parallax) => set((c) => ({ ...c, banner: { ...c.banner, parallax } }))} />
        </Field>
        <ColorField label="Background color" value={config.background.color} onChange={(color) => set((c) => ({ ...c, background: { ...c.background, color } }))} />
        <Field label="Background blur" hint={`${config.background.blur}`}>
          <Slider min={0} max={40} value={config.background.blur} onChange={(blur) => set((c) => ({ ...c, background: { ...c.background, blur } }))} />
        </Field>
        <Field label="Background dim" hint={`${config.background.dim}%`}>
          <Slider min={0} max={80} value={config.background.dim} onChange={(dim) => set((c) => ({ ...c, background: { ...c.background, dim } }))} />
        </Field>
        <Field label="Background zoom" hint={`${config.background.zoom}%`}>
          <Slider min={100} max={140} value={config.background.zoom} onChange={(zoom) => set((c) => ({ ...c, background: { ...c.background, zoom } }))} />
        </Field>
        <Field label="Background size">
          <SoftSelect value={config.background.size} onChange={(size) => set((c) => ({ ...c, background: { ...c.background, size: size as ProfileTemplate["background"]["size"] } }))} options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
        </Field>
        <Field label="Background position">
          <SoftSelect value={config.background.position} onChange={(position) => set((c) => ({ ...c, background: { ...c.background, position: position as ProfileTemplate["background"]["position"] } }))} options={[{ value: "center", label: "Center" }, { value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }]} />
        </Field>
        <Field label="Background gradient">
          <SoftSelect value={config.background.gradient} onChange={(gradient) => set((c) => ({ ...c, background: { ...c.background, gradient: gradient as ProfileTemplate["background"]["gradient"] } }))} options={[{ value: "none", label: "None" }, { value: "radial", label: "Radial" }, { value: "linear", label: "Linear" }, { value: "mesh", label: "Mesh" }]} />
        </Field>
        <ColorField label="Gradient color" value={config.background.gradientColor} onChange={(gradientColor) => set((c) => ({ ...c, background: { ...c.background, gradientColor } }))} />
        <Field label="Animated gradient">
          <SoftOnOff value={config.background.animatedGradient} onChange={(animatedGradient) => set((c) => ({ ...c, background: { ...c.background, animatedGradient } }))} />
        </Field>
      </Section>

      <Section title="Layout">
        <Field label="Layout style">
          <SoftSelect value={config.layout.style} onChange={(style) => set((c) => ({ ...c, layout: { ...c.layout, style: style as ProfileTemplate["layout"]["style"] } }))} options={[{ value: "default", label: "Default" }, { value: "simple", label: "Simple" }, { value: "stack", label: "Stack" }, { value: "compact", label: "Compact" }, { value: "wide", label: "Wide" }]} />
        </Field>
        <Field label="Alignment">
          <SoftSelect value={config.layout.alignment} onChange={(alignment) => set((c) => ({ ...c, layout: { ...c.layout, alignment: alignment as ProfileTemplate["layout"]["alignment"] } }))} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
        </Field>
        <Field label="Avatar side">
          <SoftSelect value={config.layout.avatarSide} onChange={(avatarSide) => set((c) => ({ ...c, layout: { ...c.layout, avatarSide: avatarSide as ProfileTemplate["layout"]["avatarSide"] } }))} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
        </Field>
        <Field label="Social position">
          <SoftSelect value={config.layout.socialPosition} onChange={(socialPosition) => set((c) => ({ ...c, layout: { ...c.layout, socialPosition: socialPosition as ProfileTemplate["layout"]["socialPosition"] } }))} options={[{ value: "under-bio", label: "Under bio" }, { value: "under-name", label: "Under name" }, { value: "bottom", label: "Bottom" }]} />
        </Field>
        <Field label="Tags position">
          <SoftSelect value={config.layout.tagsPosition} onChange={(tagsPosition) => set((c) => ({ ...c, layout: { ...c.layout, tagsPosition: tagsPosition as ProfileTemplate["layout"]["tagsPosition"] } }))} options={[{ value: "under-name", label: "Under name" }, { value: "under-badges", label: "Under badges" }, { value: "under-bio", label: "Under bio" }]} />
        </Field>
        <Field label="Presence style">
          <SoftSelect value={config.layout.presenceStyle} onChange={(presenceStyle) => set((c) => ({ ...c, layout: { ...c.layout, presenceStyle: presenceStyle as ProfileTemplate["layout"]["presenceStyle"] } }))} options={[{ value: "card", label: "Card" }, { value: "pill", label: "Pill" }, { value: "minimal", label: "Minimal" }]} />
        </Field>
        <Field label="Panel gap" hint={`${config.layout.gap}px`}>
          <Slider min={2} max={36} value={config.layout.gap} onChange={(gap) => set((c) => ({ ...c, layout: { ...c.layout, gap } }))} />
        </Field>
        <Field label="Content scale" hint={`${config.layout.contentScale}%`}>
          <Slider min={70} max={110} value={config.layout.contentScale} onChange={(contentScale) => set((c) => ({ ...c, layout: { ...c.layout, contentScale } }))} />
        </Field>
        <Field label="Compact mode">
          <SoftOnOff value={config.layout.compact} onChange={(compact) => set((c) => ({ ...c, layout: { ...c.layout, compact } }))} />
        </Field>
      </Section>

      <Section title="Motion & name">
        <Field label="Name animation">
          <SoftSelect value={config.page.titleAnimation} onChange={(titleAnimation) => set((c) => ({ ...c, page: { ...c.page, titleAnimation: titleAnimation as ProfileTemplate["page"]["titleAnimation"] } }))} options={[{ value: "none", label: "None" }, { value: "flashing", label: "Flashing" }, { value: "typing", label: "Typing" }, { value: "glitch", label: "Glitch" }, { value: "shine", label: "Shine" }, { value: "wave", label: "Wave" }, { value: "bounce", label: "Bounce" }, { value: "neon", label: "Neon" }, { value: "rainbow", label: "Rainbow" }, { value: "blur", label: "Blur pulse" }]} />
        </Field>
        <Field label="Name animation speed" hint={`${config.page.titleAnimationSpeed}`}>
          <Slider min={1} max={100} value={config.page.titleAnimationSpeed} onChange={(titleAnimationSpeed) => set((c) => ({ ...c, page: { ...c.page, titleAnimationSpeed } }))} />
        </Field>
        <Field label="Enter animation">
          <SoftSelect value={config.page.enterAnimation} onChange={(enterAnimation) => set((c) => ({ ...c, page: { ...c.page, enterAnimation: enterAnimation as ProfileTemplate["page"]["enterAnimation"] } }))} options={[{ value: "none", label: "None" }, { value: "fade", label: "Fade" }, { value: "slide-up", label: "Slide up" }, { value: "zoom", label: "Zoom" }, { value: "blur-in", label: "Blur in" }, { value: "bounce", label: "Bounce" }, { value: "flip", label: "Flip" }]} />
        </Field>
        <Field label="Enter speed" hint={`${config.page.enterAnimationSpeed}`}>
          <Slider min={1} max={100} value={config.page.enterAnimationSpeed} onChange={(enterAnimationSpeed) => set((c) => ({ ...c, page: { ...c.page, enterAnimationSpeed } }))} />
        </Field>
        <Field label="Particles">
          <SoftSelect value={config.page.particles} onChange={(particles) => set((c) => ({ ...c, page: { ...c.page, particles: particles as ProfileTemplate["page"]["particles"] } }))} options={[{ value: "none", label: "None" }, { value: "dust", label: "Dust" }, { value: "snow", label: "Snow" }, { value: "embers", label: "Embers" }, { value: "rain", label: "Rain" }, { value: "stars", label: "Stars" }, { value: "sparkle", label: "Sparkle" }, { value: "matrix", label: "Matrix" }, { value: "ash", label: "Ash" }]} />
        </Field>
        <Field label="Particle density" hint={`${config.page.particleDensity}`}>
          <Slider min={10} max={100} value={config.page.particleDensity} onChange={(particleDensity) => set((c) => ({ ...c, page: { ...c.page, particleDensity } }))} />
        </Field>
        <Field label="Particle speed" hint={`${config.page.particleSpeed}`}>
          <Slider min={10} max={100} value={config.page.particleSpeed} onChange={(particleSpeed) => set((c) => ({ ...c, page: { ...c.page, particleSpeed } }))} />
        </Field>
        <Field label="Particle color">
          <SoftSelect value={config.page.particleColor} onChange={(particleColor) => set((c) => ({ ...c, page: { ...c.page, particleColor: particleColor as ProfileTemplate["page"]["particleColor"] } }))} options={[{ value: "white", label: "White" }, { value: "theme", label: "Theme" }, { value: "warm", label: "Warm" }, { value: "cool", label: "Cool" }]} />
        </Field>
        <Field label="Overlay">
          <SoftSelect value={config.page.overlay} onChange={(overlay) => set((c) => ({ ...c, page: { ...c.page, overlay: overlay as ProfileTemplate["page"]["overlay"] } }))} options={[{ value: "none", label: "None" }, { value: "vignette", label: "Vignette" }, { value: "scanlines", label: "Scanlines" }, { value: "noise", label: "Noise" }, { value: "grid", label: "Grid" }, { value: "crt", label: "CRT" }, { value: "fog", label: "Fog" }, { value: "chromatic", label: "Chromatic" }, { value: "stars", label: "Stars fog" }]} />
        </Field>
        <Field label="Overlay opacity" hint={`${config.page.overlayOpacity}%`}>
          <Slider min={0} max={100} value={config.page.overlayOpacity} onChange={(overlayOpacity) => set((c) => ({ ...c, page: { ...c.page, overlayOpacity } }))} />
        </Field>
        <Field label="Reveal style">
          <SoftSelect value={config.page.revealStyle} onChange={(revealStyle) => set((c) => ({ ...c, page: { ...c.page, revealStyle: revealStyle as ProfileTemplate["page"]["revealStyle"] } }))} options={[{ value: "fade", label: "Fade" }, { value: "blur", label: "Blur" }, { value: "zoom", label: "Zoom" }, { value: "glitch", label: "Glitch" }]} />
        </Field>
        <Field label="Reveal text">
          <input className="soft-input" value={config.page.revealText} onChange={(e) => set((c) => ({ ...c, page: { ...c.page, revealText: e.target.value } }))} />
        </Field>
        <Field label="Avatar animation">
          <SoftSelect value={config.appearance.avatarDecoration} onChange={(avatarDecoration) => set((c) => ({ ...c, appearance: { ...c.appearance, avatarDecoration: avatarDecoration as ProfileTemplate["appearance"]["avatarDecoration"] } }))} options={[{ value: "none", label: "None" }, { value: "glow", label: "Glow float" }, { value: "pulse", label: "Pulse" }, { value: "ring", label: "Ring sway" }, { value: "spin-ring", label: "Spin ring" }, { value: "hex", label: "Hex" }, { value: "square-glow", label: "Square glow" }]} />
        </Field>
      </Section>

      <Section title="Effects lab" defaultOpen>
        <Field label="Aurora">
          <SoftSelect value={config.effects.aurora} onChange={(aurora) => set((c) => ({ ...c, effects: { ...c.effects, aurora: aurora as ProfileTemplate["effects"]["aurora"] } }))} options={[{ value: "none", label: "Off" }, { value: "soft", label: "Soft" }, { value: "strong", label: "Strong" }, { value: "pulse", label: "Pulse" }]} />
        </Field>
        <Field label="Aurora intensity" hint={`${config.effects.auroraIntensity}`}>
          <Slider min={0} max={100} value={config.effects.auroraIntensity} onChange={(auroraIntensity) => set((c) => ({ ...c, effects: { ...c.effects, auroraIntensity } }))} />
        </Field>
        <Field label="Floating orbs">
          <SoftOnOff value={config.effects.floatingOrbs} onChange={(floatingOrbs) => set((c) => ({ ...c, effects: { ...c.effects, floatingOrbs } }))} />
        </Field>
        <Field label="Orb count" hint={`${config.effects.orbCount}`}>
          <Slider min={2} max={12} value={config.effects.orbCount} onChange={(orbCount) => set((c) => ({ ...c, effects: { ...c.effects, orbCount } }))} />
        </Field>
        <Field label="Orb intensity" hint={`${config.effects.orbIntensity}`}>
          <Slider min={0} max={100} value={config.effects.orbIntensity} onChange={(orbIntensity) => set((c) => ({ ...c, effects: { ...c.effects, orbIntensity } }))} />
        </Field>
        <Field label="Ambient pulse">
          <SoftOnOff value={config.effects.ambientPulse} onChange={(ambientPulse) => set((c) => ({ ...c, effects: { ...c.effects, ambientPulse } }))} />
        </Field>
        <Field label="RGB split">
          <SoftOnOff value={config.effects.rgbSplit} onChange={(rgbSplit) => set((c) => ({ ...c, effects: { ...c.effects, rgbSplit } }))} />
        </Field>
        <Field label="RGB intensity" hint={`${config.effects.rgbIntensity}`}>
          <Slider min={0} max={20} value={config.effects.rgbIntensity} onChange={(rgbIntensity) => set((c) => ({ ...c, effects: { ...c.effects, rgbIntensity } }))} />
        </Field>
        <Field label="Bloom">
          <SoftOnOff value={config.effects.bloom} onChange={(bloom) => set((c) => ({ ...c, effects: { ...c.effects, bloom } }))} />
        </Field>
        <Field label="Bloom intensity" hint={`${config.effects.bloomIntensity}`}>
          <Slider min={0} max={100} value={config.effects.bloomIntensity} onChange={(bloomIntensity) => set((c) => ({ ...c, effects: { ...c.effects, bloomIntensity } }))} />
        </Field>
        <Field label="Film bars (cinematic)">
          <SoftOnOff value={config.effects.filmBars} onChange={(filmBars) => set((c) => ({ ...c, effects: { ...c.effects, filmBars } }))} />
        </Field>
        <Field label="Film bar size" hint={`${config.effects.filmBarSize}px`}>
          <Slider min={4} max={80} value={config.effects.filmBarSize} onChange={(filmBarSize) => set((c) => ({ ...c, effects: { ...c.effects, filmBarSize } }))} />
        </Field>
        <Field label="Background motion">
          <SoftSelect value={config.effects.bgMotion} onChange={(bgMotion) => set((c) => ({ ...c, effects: { ...c.effects, bgMotion: bgMotion as ProfileTemplate["effects"]["bgMotion"] } }))} options={[{ value: "none", label: "None" }, { value: "drift", label: "Drift" }, { value: "zoom", label: "Zoom" }, { value: "kenburns", label: "Ken Burns" }]} />
        </Field>
        <Field label="BG motion speed" hint={`${config.effects.bgMotionSpeed}`}>
          <Slider min={10} max={100} value={config.effects.bgMotionSpeed} onChange={(bgMotionSpeed) => set((c) => ({ ...c, effects: { ...c.effects, bgMotionSpeed } }))} />
        </Field>
        <Field label="Card sheen">
          <SoftOnOff value={config.effects.cardSheen} onChange={(cardSheen) => set((c) => ({ ...c, effects: { ...c.effects, cardSheen } }))} />
        </Field>
        <Field label="Animated border">
          <SoftOnOff value={config.effects.borderAnimate} onChange={(borderAnimate) => set((c) => ({ ...c, effects: { ...c.effects, borderAnimate } }))} />
        </Field>
        <Field label="Border animate speed" hint={`${config.effects.borderAnimateSpeed}`}>
          <Slider min={10} max={100} value={config.effects.borderAnimateSpeed} onChange={(borderAnimateSpeed) => set((c) => ({ ...c, effects: { ...c.effects, borderAnimateSpeed } }))} />
        </Field>
        <Field label="Name gradient fill">
          <SoftOnOff value={config.effects.nameGradient} onChange={(nameGradient) => set((c) => ({ ...c, effects: { ...c.effects, nameGradient } }))} />
        </Field>
        <ColorField label="Name gradient from" value={config.effects.nameGradientFrom} onChange={(nameGradientFrom) => set((c) => ({ ...c, effects: { ...c.effects, nameGradientFrom } }))} />
        <ColorField label="Name gradient to" value={config.effects.nameGradientTo} onChange={(nameGradientTo) => set((c) => ({ ...c, effects: { ...c.effects, nameGradientTo } }))} />
        <Field label="Magnetic socials">
          <SoftOnOff value={config.effects.magneticSocials} onChange={(magneticSocials) => set((c) => ({ ...c, effects: { ...c.effects, magneticSocials } }))} />
        </Field>
        <Field label="Hover lift" hint={`${config.effects.hoverLift}px`}>
          <Slider min={0} max={16} value={config.effects.hoverLift} onChange={(hoverLift) => set((c) => ({ ...c, effects: { ...c.effects, hoverLift } }))} />
        </Field>
        <Field label="Spotlight follow">
          <SoftOnOff value={config.effects.spotlight} onChange={(spotlight) => set((c) => ({ ...c, effects: { ...c.effects, spotlight } }))} />
        </Field>
        <Field label="Spotlight intensity" hint={`${config.effects.spotlightIntensity}`}>
          <Slider min={0} max={100} value={config.effects.spotlightIntensity} onChange={(spotlightIntensity) => set((c) => ({ ...c, effects: { ...c.effects, spotlightIntensity } }))} />
        </Field>
        <Field label="Pulse rank badge">
          <SoftOnOff value={config.effects.pulseRank} onChange={(pulseRank) => set((c) => ({ ...c, effects: { ...c.effects, pulseRank } }))} />
        </Field>
        <Field label="Shake badges on hover">
          <SoftOnOff value={config.effects.shakeBadges} onChange={(shakeBadges) => set((c) => ({ ...c, effects: { ...c.effects, shakeBadges } }))} />
        </Field>
        <Field label="Watermark">
          <SoftOnOff value={config.effects.watermark} onChange={(watermark) => set((c) => ({ ...c, effects: { ...c.effects, watermark } }))} />
        </Field>
        <Field label="Watermark text">
          <input className="soft-input" value={config.effects.watermarkText} onChange={(e) => set((c) => ({ ...c, effects: { ...c.effects, watermarkText: e.target.value } }))} />
        </Field>
        <Field label="Watermark opacity" hint={`${config.effects.watermarkOpacity}%`}>
          <Slider min={0} max={40} value={config.effects.watermarkOpacity} onChange={(watermarkOpacity) => set((c) => ({ ...c, effects: { ...c.effects, watermarkOpacity } }))} />
        </Field>
      </Section>

      <Section title="Colors & typography">
        <ColorField label="Theme color" value={config.appearance.themeColor} onChange={(themeColor) => set((c) => ({ ...c, appearance: { ...c.appearance, themeColor } }))} />
        <ColorField label="Accent secondary" value={config.appearance.accentSecondary} onChange={(accentSecondary) => set((c) => ({ ...c, appearance: { ...c.appearance, accentSecondary } }))} />
        <ColorField label="Primary text" value={config.appearance.primaryText} onChange={(primaryText) => set((c) => ({ ...c, appearance: { ...c.appearance, primaryText } }))} />
        <ColorField label="Secondary text" value={config.appearance.secondaryText} onChange={(secondaryText) => set((c) => ({ ...c, appearance: { ...c.appearance, secondaryText } }))} />
        <Field label="Display font">
          <SoftSelect value={config.appearance.font} onChange={(font) => set((c) => ({ ...c, appearance: { ...c.appearance, font: font as ProfileTemplate["appearance"]["font"] } }))} options={[{ value: "syne", label: "Syne" }, { value: "outfit", label: "Outfit" }, { value: "space-grotesk", label: "Space Grotesk" }, { value: "dm-sans", label: "DM Sans" }, { value: "bebas", label: "Bebas Neue" }, { value: "rubik", label: "Rubik" }, { value: "cinzel", label: "Cinzel" }, { value: "space-mono", label: "Space Mono" }]} />
        </Field>
        <Field label="Bio font">
          <SoftSelect value={config.appearance.bioFont} onChange={(bioFont) => set((c) => ({ ...c, appearance: { ...c.appearance, bioFont: bioFont as ProfileTemplate["appearance"]["bioFont"] } }))} options={[{ value: "inherit", label: "Inherit" }, { value: "outfit", label: "Outfit" }, { value: "dm-sans", label: "DM Sans" }, { value: "space-mono", label: "Space Mono" }, { value: "cinzel", label: "Cinzel" }]} />
        </Field>
        <Field label="Name size" hint={`${config.appearance.nameSize}px`}>
          <Slider min={16} max={56} value={config.appearance.nameSize} onChange={(nameSize) => set((c) => ({ ...c, appearance: { ...c.appearance, nameSize } }))} />
        </Field>
        <Field label="Name weight" hint={`${config.appearance.nameWeight}`}>
          <Slider min={400} max={900} step={100} value={config.appearance.nameWeight} onChange={(nameWeight) => set((c) => ({ ...c, appearance: { ...c.appearance, nameWeight } }))} />
        </Field>
        <Field label="Letter spacing" hint={`${config.appearance.nameLetterSpacing}`}>
          <Slider min={-4} max={12} value={config.appearance.nameLetterSpacing} onChange={(nameLetterSpacing) => set((c) => ({ ...c, appearance: { ...c.appearance, nameLetterSpacing } }))} />
        </Field>
        <Field label="Name uppercase">
          <SoftOnOff value={config.appearance.nameUppercase} onChange={(nameUppercase) => set((c) => ({ ...c, appearance: { ...c.appearance, nameUppercase } }))} />
        </Field>
        <Field label="Name italic">
          <SoftOnOff value={config.appearance.nameItalic} onChange={(nameItalic) => set((c) => ({ ...c, appearance: { ...c.appearance, nameItalic } }))} />
        </Field>
        <Field label="Name sparkles">
          <SoftSelect value={config.appearance.usernameSparkles} onChange={(usernameSparkles) => set((c) => ({ ...c, appearance: { ...c.appearance, usernameSparkles: usernameSparkles as ProfileTemplate["appearance"]["usernameSparkles"] } }))} options={[{ value: "none", label: "Off" }, { value: "white", label: "White glow" }, { value: "black", label: "Soft shadow" }, { value: "theme", label: "Theme glow" }]} />
        </Field>
        <Field label="Bio size" hint={`${config.appearance.bioSize}px`}>
          <Slider min={11} max={20} value={config.appearance.bioSize} onChange={(bioSize) => set((c) => ({ ...c, appearance: { ...c.appearance, bioSize } }))} />
        </Field>
        <Field label="Bio opacity" hint={`${config.appearance.bioOpacity}%`}>
          <Slider min={30} max={100} value={config.appearance.bioOpacity} onChange={(bioOpacity) => set((c) => ({ ...c, appearance: { ...c.appearance, bioOpacity } }))} />
        </Field>
        <Field label="Bio line height" hint={`${config.appearance.bioLineHeight}%`}>
          <Slider min={120} max={200} value={config.appearance.bioLineHeight} onChange={(bioLineHeight) => set((c) => ({ ...c, appearance: { ...c.appearance, bioLineHeight } }))} />
        </Field>
        <Field label="Bio align">
          <SoftSelect value={config.appearance.bioAlign} onChange={(bioAlign) => set((c) => ({ ...c, appearance: { ...c.appearance, bioAlign: bioAlign as ProfileTemplate["appearance"]["bioAlign"] } }))} options={[{ value: "inherit", label: "Inherit" }, { value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
        </Field>
        <Field label="Bio italic">
          <SoftOnOff value={config.appearance.bioItalic} onChange={(bioItalic) => set((c) => ({ ...c, appearance: { ...c.appearance, bioItalic } }))} />
        </Field>
        <Field label="Divider style">
          <SoftSelect value={config.appearance.dividerStyle} onChange={(dividerStyle) => set((c) => ({ ...c, appearance: { ...c.appearance, dividerStyle: dividerStyle as ProfileTemplate["appearance"]["dividerStyle"] } }))} options={[{ value: "none", label: "None" }, { value: "line", label: "Line" }, { value: "gradient", label: "Gradient" }, { value: "dots", label: "Dots" }]} />
        </Field>
        <Field label="Text shadow" hint={`${config.appearance.textShadow}`}>
          <Slider min={0} max={100} value={config.appearance.textShadow} onChange={(textShadow) => set((c) => ({ ...c, appearance: { ...c.appearance, textShadow } }))} />
        </Field>
      </Section>

      <Section title="Avatar, tags, socials, badges">
        <Field label="Avatar size" hint={`${config.appearance.avatarSize}px`}>
          <Slider min={48} max={140} value={config.appearance.avatarSize} onChange={(avatarSize) => set((c) => ({ ...c, appearance: { ...c.appearance, avatarSize } }))} />
        </Field>
        <Field label="Avatar radius" hint={`${config.appearance.avatarRadius}`}>
          <Slider min={0} max={50} value={config.appearance.avatarRadius} onChange={(avatarRadius) => set((c) => ({ ...c, appearance: { ...c.appearance, avatarRadius } }))} />
        </Field>
        <Field label="Avatar border" hint={`${config.appearance.avatarBorderWidth}px`}>
          <Slider min={0} max={8} value={config.appearance.avatarBorderWidth} onChange={(avatarBorderWidth) => set((c) => ({ ...c, appearance: { ...c.appearance, avatarBorderWidth } }))} />
        </Field>
        <ColorField label="Avatar border color" value={config.appearance.avatarBorderColor} onChange={(avatarBorderColor) => set((c) => ({ ...c, appearance: { ...c.appearance, avatarBorderColor } }))} />
        <Field label="Avatar shadow" hint={`${config.appearance.avatarShadow}`}>
          <Slider min={0} max={100} value={config.appearance.avatarShadow} onChange={(avatarShadow) => set((c) => ({ ...c, appearance: { ...c.appearance, avatarShadow } }))} />
        </Field>
        <Field label="Avatar Y offset" hint={`${config.appearance.avatarOffsetY}px`}>
          <Slider min={-20} max={40} value={config.appearance.avatarOffsetY} onChange={(avatarOffsetY) => set((c) => ({ ...c, appearance: { ...c.appearance, avatarOffsetY } }))} />
        </Field>
        <Field label="Tag style">
          <SoftSelect value={config.appearance.tagStyle} onChange={(tagStyle) => set((c) => ({ ...c, appearance: { ...c.appearance, tagStyle: tagStyle as ProfileTemplate["appearance"]["tagStyle"] } }))} options={[{ value: "pill", label: "Pill" }, { value: "square", label: "Square" }, { value: "ghost", label: "Ghost" }, { value: "outline", label: "Outline" }, { value: "neon", label: "Neon" }]} />
        </Field>
        <Field label="Tag size" hint={`${config.appearance.tagSize}px`}>
          <Slider min={10} max={18} value={config.appearance.tagSize} onChange={(tagSize) => set((c) => ({ ...c, appearance: { ...c.appearance, tagSize } }))} />
        </Field>
        <Field label="Tag bg opacity" hint={`${config.appearance.tagBgOpacity}%`}>
          <Slider min={0} max={100} value={config.appearance.tagBgOpacity} onChange={(tagBgOpacity) => set((c) => ({ ...c, appearance: { ...c.appearance, tagBgOpacity } }))} />
        </Field>
        <Field label="Tag border" hint={`${config.appearance.tagBorderWidth}px`}>
          <Slider min={0} max={3} value={config.appearance.tagBorderWidth} onChange={(tagBorderWidth) => set((c) => ({ ...c, appearance: { ...c.appearance, tagBorderWidth } }))} />
        </Field>
        <Field label="Icon style">
          <SoftSelect value={config.appearance.iconStyle} onChange={(iconStyle) => set((c) => ({ ...c, appearance: { ...c.appearance, iconStyle: iconStyle as ProfileTemplate["appearance"]["iconStyle"] } }))} options={[{ value: "colored", label: "Colored" }, { value: "mono", label: "Mono" }, { value: "theme", label: "Theme" }, { value: "invert", label: "Invert" }]} />
        </Field>
        <Field label="Social shape">
          <SoftSelect value={config.appearance.socialShape} onChange={(socialShape) => set((c) => ({ ...c, appearance: { ...c.appearance, socialShape: socialShape as ProfileTemplate["appearance"]["socialShape"] } }))} options={[{ value: "rounded", label: "Rounded" }, { value: "circle", label: "Circle" }, { value: "square", label: "Square" }, { value: "soft", label: "Soft" }]} />
        </Field>
        <Field label="Social size" hint={`${config.appearance.socialSize}px`}>
          <Slider min={28} max={56} value={config.appearance.socialSize} onChange={(socialSize) => set((c) => ({ ...c, appearance: { ...c.appearance, socialSize } }))} />
        </Field>
        <Field label="Social gap" hint={`${config.appearance.socialGap}px`}>
          <Slider min={4} max={20} value={config.appearance.socialGap} onChange={(socialGap) => set((c) => ({ ...c, appearance: { ...c.appearance, socialGap } }))} />
        </Field>
        <Field label="Social bg opacity" hint={`${config.appearance.socialBgOpacity}%`}>
          <Slider min={0} max={100} value={config.appearance.socialBgOpacity} onChange={(socialBgOpacity) => set((c) => ({ ...c, appearance: { ...c.appearance, socialBgOpacity } }))} />
        </Field>
        <Field label="Social glow" hint={`${config.appearance.socialGlow}`}>
          <Slider min={0} max={100} value={config.appearance.socialGlow} onChange={(socialGlow) => set((c) => ({ ...c, appearance: { ...c.appearance, socialGlow } }))} />
        </Field>
        <Field label="Badge style">
          <SoftSelect value={config.appearance.badgeStyle} onChange={(badgeStyle) => set((c) => ({ ...c, appearance: { ...c.appearance, badgeStyle: badgeStyle as ProfileTemplate["appearance"]["badgeStyle"] } }))} options={[{ value: "glass", label: "Glass" }, { value: "flat", label: "Flat" }, { value: "neon", label: "Neon" }, { value: "minimal", label: "Minimal" }]} />
        </Field>
        <Field label="Badge size" hint={`${config.appearance.badgeSize}px`}>
          <Slider min={24} max={44} value={config.appearance.badgeSize} onChange={(badgeSize) => set((c) => ({ ...c, appearance: { ...c.appearance, badgeSize } }))} />
        </Field>
        <Field label="Badge gap" hint={`${config.appearance.badgeGap}px`}>
          <Slider min={2} max={14} value={config.appearance.badgeGap} onChange={(badgeGap) => set((c) => ({ ...c, appearance: { ...c.appearance, badgeGap } }))} />
        </Field>
        <Field label="Badge glow">
          <SoftOnOff value={config.appearance.badgeGlow} onChange={(badgeGlow) => set((c) => ({ ...c, appearance: { ...c.appearance, badgeGlow } }))} />
        </Field>
        <ColorField label="Status dot color" value={config.appearance.statusDotColor} onChange={(statusDotColor) => set((c) => ({ ...c, appearance: { ...c.appearance, statusDotColor } }))} />
      </Section>

      <Section title="Cursor & film">
        <Field label="Cursor">
          <SoftSelect value={config.appearance.cursor} onChange={(cursor) => set((c) => ({ ...c, appearance: { ...c.appearance, cursor: cursor as ProfileTemplate["appearance"]["cursor"] } }))} options={[{ value: "system", label: "System" }, { value: "minimal", label: "Minimal ring" }, { value: "dot", label: "Glow dot" }, { value: "cross", label: "Cross" }, { value: "custom", label: "Custom image" }]} />
        </Field>
        <Field label="Cursor size" hint={`${config.appearance.cursorSize}px`}>
          <Slider min={8} max={48} value={config.appearance.cursorSize} onChange={(cursorSize) => set((c) => ({ ...c, appearance: { ...c.appearance, cursorSize } }))} />
        </Field>
        {config.appearance.cursor === "custom" && (
          <div className="sm:col-span-2">
            <MediaUpload label="Custom cursor image" hint="png/webp small" kind="cover" accept="image/png,image/webp,image/gif" value={config.appearance.customCursorUrl} onChange={(customCursorUrl) => set((c) => ({ ...c, appearance: { ...c.appearance, customCursorUrl } }))} />
          </div>
        )}
        <Field label="Cursor trail">
          <SoftSelect value={config.appearance.cursorTrail} onChange={(cursorTrail) => set((c) => ({ ...c, appearance: { ...c.appearance, cursorTrail: cursorTrail as ProfileTemplate["appearance"]["cursorTrail"] } }))} options={[{ value: "none", label: "None" }, { value: "fade", label: "Fade" }, { value: "spark", label: "Spark" }, { value: "smoke", label: "Smoke" }]} />
        </Field>
        <Field label="Trail length" hint={`${config.appearance.cursorTrailLength}`}>
          <Slider min={4} max={24} value={config.appearance.cursorTrailLength} onChange={(cursorTrailLength) => set((c) => ({ ...c, appearance: { ...c.appearance, cursorTrailLength } }))} />
        </Field>
        <Field label="Film grain" hint={`${config.appearance.grain}%`}>
          <Slider min={0} max={100} value={config.appearance.grain} onChange={(grain) => set((c) => ({ ...c, appearance: { ...c.appearance, grain } }))} />
        </Field>
        <Field label="Accent glow" hint={`${config.appearance.accentGlow}`}>
          <Slider min={0} max={100} value={config.appearance.accentGlow} onChange={(accentGlow) => set((c) => ({ ...c, appearance: { ...c.appearance, accentGlow } }))} />
        </Field>
        <Field label="Hue rotate" hint={`${config.appearance.hueRotate}deg`}>
          <Slider min={0} max={360} value={config.appearance.hueRotate} onChange={(hueRotate) => set((c) => ({ ...c, appearance: { ...c.appearance, hueRotate } }))} />
        </Field>
        <Field label="Saturate" hint={`${config.appearance.saturate}%`}>
          <Slider min={50} max={200} value={config.appearance.saturate} onChange={(saturate) => set((c) => ({ ...c, appearance: { ...c.appearance, saturate } }))} />
        </Field>
        <Field label="Contrast" hint={`${config.appearance.contrast}%`}>
          <Slider min={80} max={140} value={config.appearance.contrast} onChange={(contrast) => set((c) => ({ ...c, appearance: { ...c.appearance, contrast } }))} />
        </Field>
        <Field label="Brightness" hint={`${config.appearance.brightness}%`}>
          <Slider min={70} max={130} value={config.appearance.brightness} onChange={(brightness) => set((c) => ({ ...c, appearance: { ...c.appearance, brightness } }))} />
        </Field>
        <Field label="Global blur" hint={`${config.appearance.globalBlur}px`}>
          <Slider min={0} max={8} value={config.appearance.globalBlur} onChange={(globalBlur) => set((c) => ({ ...c, appearance: { ...c.appearance, globalBlur } }))} />
        </Field>
      </Section>

      <Section title="Panels / glass box">
        <Field label="3D tilt">
          <SoftSelect value={config.box.tilt} onChange={(tilt) => set((c) => ({ ...c, box: { ...c.box, tilt: tilt as ProfileTemplate["box"]["tilt"] } }))} options={[{ value: "none", label: "Off" }, { value: "subtle", label: "Subtle" }, { value: "standard", label: "Standard" }, { value: "strong", label: "Strong" }, { value: "extreme", label: "Extreme" }]} />
        </Field>
        <Field label="Tilt hover scale" hint={`${config.box.tiltScale}%`}>
          <Slider min={100} max={108} value={config.box.tiltScale} onChange={(tiltScale) => set((c) => ({ ...c, box: { ...c.box, tiltScale } }))} />
        </Field>
        <Field label="Box width" hint={`${config.box.width}px`}>
          <Slider min={280} max={900} value={config.box.width} onChange={(width) => set((c) => ({ ...c, box: { ...c.box, width } }))} />
        </Field>
        <Field label="Inner spacing" hint={`${config.box.innerSpacing}px`}>
          <Slider min={8} max={80} value={config.box.innerSpacing} onChange={(innerSpacing) => set((c) => ({ ...c, box: { ...c.box, innerSpacing } }))} />
        </Field>
        <Field label="Box opacity" hint={`${config.box.opacity}%`}>
          <Slider min={0} max={100} value={config.box.opacity} onChange={(opacity) => set((c) => ({ ...c, box: { ...c.box, opacity } }))} />
        </Field>
        <Field label="Box radius" hint={`${config.box.radius}px`}>
          <Slider min={0} max={48} value={config.box.radius} onChange={(radius) => set((c) => ({ ...c, box: { ...c.box, radius } }))} />
        </Field>
        <Field label="Glass blur" hint={`${config.box.blur}`}>
          <Slider min={0} max={60} value={config.box.blur} onChange={(blur) => set((c) => ({ ...c, box: { ...c.box, blur } }))} />
        </Field>
        <ColorField label="Box color" value={config.box.color} onChange={(color) => set((c) => ({ ...c, box: { ...c.box, color } }))} />
        <Field label="Gradient fill">
          <SoftOnOff value={config.box.gradientFill} onChange={(gradientFill) => set((c) => ({ ...c, box: { ...c.box, gradientFill } }))} />
        </Field>
        <ColorField label="Gradient from" value={config.box.gradientFrom} onChange={(gradientFrom) => set((c) => ({ ...c, box: { ...c.box, gradientFrom } }))} />
        <ColorField label="Gradient to" value={config.box.gradientTo} onChange={(gradientTo) => set((c) => ({ ...c, box: { ...c.box, gradientTo } }))} />
        <Field label="Border width" hint={`${config.box.borderWidth}px`}>
          <Slider min={0} max={8} value={config.box.borderWidth} onChange={(borderWidth) => set((c) => ({ ...c, box: { ...c.box, borderWidth } }))} />
        </Field>
        <ColorField label="Border color" value={config.box.borderColor} onChange={(borderColor) => set((c) => ({ ...c, box: { ...c.box, borderColor } }))} />
        <Field label="Border opacity" hint={`${config.box.borderOpacity}%`}>
          <Slider min={0} max={100} value={config.box.borderOpacity} onChange={(borderOpacity) => set((c) => ({ ...c, box: { ...c.box, borderOpacity } }))} />
        </Field>
        <Field label="Border style">
          <SoftSelect value={config.box.borderStyle} onChange={(borderStyle) => set((c) => ({ ...c, box: { ...c.box, borderStyle: borderStyle as ProfileTemplate["box"]["borderStyle"] } }))} options={[{ value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }, { value: "none", label: "None" }]} />
        </Field>
        <Field label="Soft panel glow">
          <SoftOnOff value={config.box.glow} onChange={(glow) => set((c) => ({ ...c, box: { ...c.box, glow } }))} />
        </Field>
        <Field label="Inner glow">
          <SoftOnOff value={config.box.innerGlow} onChange={(innerGlow) => set((c) => ({ ...c, box: { ...c.box, innerGlow } }))} />
        </Field>
        <Field label="Inner glow opacity" hint={`${config.box.innerGlowOpacity}%`}>
          <Slider min={0} max={60} value={config.box.innerGlowOpacity} onChange={(innerGlowOpacity) => set((c) => ({ ...c, box: { ...c.box, innerGlowOpacity } }))} />
        </Field>
        <ColorField label="Shadow color" value={config.box.shadowColor} onChange={(shadowColor) => set((c) => ({ ...c, box: { ...c.box, shadowColor } }))} />
        <Field label="Shadow opacity" hint={`${config.box.shadowOpacity}%`}>
          <Slider min={0} max={100} value={config.box.shadowOpacity} onChange={(shadowOpacity) => set((c) => ({ ...c, box: { ...c.box, shadowOpacity } }))} />
        </Field>
        <Field label="Shadow blur" hint={`${config.box.shadowBlur}`}>
          <Slider min={0} max={120} value={config.box.shadowBlur} onChange={(shadowBlur) => set((c) => ({ ...c, box: { ...c.box, shadowBlur } }))} />
        </Field>
        <Field label="Shadow Y" hint={`${config.box.shadowY}px`}>
          <Slider min={0} max={80} value={config.box.shadowY} onChange={(shadowY) => set((c) => ({ ...c, box: { ...c.box, shadowY } }))} />
        </Field>
        <Field label="Panel pattern">
          <SoftSelect value={config.box.pattern} onChange={(pattern) => set((c) => ({ ...c, box: { ...c.box, pattern: pattern as ProfileTemplate["box"]["pattern"] } }))} options={[{ value: "none", label: "None" }, { value: "dots", label: "Dots" }, { value: "grid", label: "Grid" }, { value: "diagonal", label: "Diagonal" }, { value: "noise", label: "Noise" }]} />
        </Field>
        <Field label="Pattern opacity" hint={`${config.box.patternOpacity}%`}>
          <Slider min={0} max={40} value={config.box.patternOpacity} onChange={(patternOpacity) => set((c) => ({ ...c, box: { ...c.box, patternOpacity } }))} />
        </Field>
        <Field label="Panel saturate" hint={`${config.box.saturate}%`}>
          <Slider min={50} max={160} value={config.box.saturate} onChange={(saturate) => set((c) => ({ ...c, box: { ...c.box, saturate } }))} />
        </Field>
      </Section>

      <Section title="Audio player style">
        <Field label="Track player">
          <SoftSelect value={config.audio.trackPlayer} onChange={(trackPlayer) => set((c) => ({ ...c, audio: { ...c.audio, trackPlayer: trackPlayer as ProfileTemplate["audio"]["trackPlayer"] } }))} options={[{ value: "none", label: "Hidden" }, { value: "embed", label: "Full player" }, { value: "mini", label: "Mini" }]} />
        </Field>
        <Field label="Player style">
          <SoftSelect value={config.audio.playerStyle} onChange={(playerStyle) => set((c) => ({ ...c, audio: { ...c.audio, playerStyle: playerStyle as ProfileTemplate["audio"]["playerStyle"] } }))} options={[{ value: "default", label: "Default" }, { value: "glass", label: "Glass" }, { value: "minimal", label: "Minimal" }, { value: "neon", label: "Neon" }]} />
        </Field>
        <Field label="Autoplay">
          <SoftOnOff value={config.audio.autoPlay} onChange={(autoPlay) => set((c) => ({ ...c, audio: { ...c.audio, autoPlay } }))} />
        </Field>
        <Field label="Default volume" hint={`${config.audio.defaultVolume}%`}>
          <Slider min={0} max={100} value={config.audio.defaultVolume} onChange={(defaultVolume) => set((c) => ({ ...c, audio: { ...c.audio, defaultVolume } }))} />
        </Field>
        <Field label="Equalizer">
          <SoftOnOff value={config.audio.visualizer} onChange={(visualizer) => set((c) => ({ ...c, audio: { ...c.audio, visualizer } }))} />
        </Field>
        <Field label="EQ style">
          <SoftSelect value={config.audio.eqStyle} onChange={(eqStyle) => set((c) => ({ ...c, audio: { ...c.audio, eqStyle: eqStyle as ProfileTemplate["audio"]["eqStyle"] } }))} options={[{ value: "bars", label: "Bars" }, { value: "wave", label: "Wave" }, { value: "dots", label: "Dots" }]} />
        </Field>
        <Field label="EQ color">
          <SoftSelect value={config.audio.eqColor} onChange={(eqColor) => set((c) => ({ ...c, audio: { ...c.audio, eqColor: eqColor as ProfileTemplate["audio"]["eqColor"] } }))} options={[{ value: "white", label: "White" }, { value: "theme", label: "Theme" }, { value: "rainbow", label: "Rainbow" }]} />
        </Field>
        <Field label="Show cover">
          <SoftOnOff value={config.audio.showCover} onChange={(showCover) => set((c) => ({ ...c, audio: { ...c.audio, showCover } }))} />
        </Field>
        <Field label="Playback mode">
          <SoftSelect value={config.audio.playbackMode} onChange={(playbackMode) => set((c) => ({ ...c, audio: { ...c.audio, playbackMode: playbackMode as ProfileTemplate["audio"]["playbackMode"] } }))} options={[{ value: "loop", label: "Loop" }, { value: "once", label: "Once" }, { value: "shuffle", label: "Shuffle" }]} />
        </Field>
      </Section>

      <SaveBar
        saving={pending}
        message={message}
        onSave={() =>
          startTransition(async () => {
            const res = await saveProfileConfig(config);
            setMessage(res.ok ? res.message || "Saved." : res.error || "Failed.");
          })
        }
      />
    </div>
  );
}

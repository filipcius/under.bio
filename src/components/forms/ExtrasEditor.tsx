"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ProfileTemplate } from "@/lib/profile-template";
import { saveProfileConfig } from "@/app/actions/profile";
import { SaveBar } from "@/components/forms/SaveBar";
import { MediaUpload } from "@/components/forms/MediaUpload";
import { SoftSelect } from "@/components/forms/SoftSelect";
import { Icon } from "@/components/Icon";
import { BADGE_PRESETS, SOCIAL_PLATFORMS } from "@/lib/socials";
import { FREE_CAPS } from "@/lib/plan";
import { BlackDiamond } from "@/components/BlackDiamond";
import { BlackUpsellBanner } from "@/components/BlackUpsell";

export function ExtrasEditor({
  initial,
  isBlack = false,
}: {
  initial: ProfileTemplate;
  isBlack?: boolean;
}) {
  const [config, setConfig] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [socialId, setSocialId] = useState("instagram");
  const [socialUrl, setSocialUrl] = useState("");
  const [tag, setTag] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [badgeTip, setBadgeTip] = useState("");
  const [editBadge, setEditBadge] = useState<string | null>(null);
  const router = useRouter();
  const lock = () => router.push("/black");

  const linkCap = isBlack ? 40 : FREE_CAPS.links;
  const badgeCap = isBlack ? 24 : FREE_CAPS.badges;
  const tagCap = isBlack ? 20 : FREE_CAPS.tags;
  const showcaseCap = isBlack ? 5 : FREE_CAPS.showcases;

  const selectedSocial = SOCIAL_PLATFORMS.find((s) => s.id === socialId) || SOCIAL_PLATFORMS[0];

  function addSocial() {
    if (!socialUrl.trim()) return;
    if (config.links.length >= linkCap) {
      setMessage(
        isBlack
          ? `Max ${linkCap} socials.`
          : `Free plan: ${FREE_CAPS.links} socials. Unlock VOID for more.`,
      );
      if (!isBlack) lock();
      return;
    }
    setConfig((c) => ({
      ...c,
      links: [
        ...c.links,
        {
          label: selectedSocial.label,
          url: socialUrl.trim(),
          icon: selectedSocial.id,
        },
      ].slice(0, linkCap),
    }));
    setSocialUrl("");
    setMessage(`Added ${selectedSocial.label}.`);
  }

  function addTag() {
    if (!tag.trim()) return;
    if (config.tags.length >= tagCap) {
      setMessage(
        isBlack
          ? `Max ${tagCap} tags.`
          : `Free plan: ${FREE_CAPS.tags} tags. Unlock BLACK for more.`,
      );
      if (!isBlack) lock();
      return;
    }
    setConfig((c) => ({ ...c, tags: [...c.tags, tag.trim()].slice(0, tagCap) }));
    setTag("");
  }

  function toggleBadge(icon: string, label: string) {
    setConfig((c) => {
      const exists = c.badges.some((b) => b.icon === icon);
      if (exists) {
        return { ...c, badges: c.badges.filter((b) => b.icon !== icon) };
      }
      if (c.badges.length >= badgeCap) {
        setMessage(
          isBlack
            ? `Max ${badgeCap} badges.`
            : `Free plan: ${FREE_CAPS.badges} badges. Unlock VOID for more.`,
        );
        if (!isBlack) lock();
        return c;
      }
      return {
        ...c,
        badges: [
          ...c.badges,
          { name: label, icon, description: label },
        ].slice(0, badgeCap),
      };
    });
  }

  async function addDiscordServer() {
    if (!inviteInput.trim()) return;
    if (!isBlack || config.showcases.length >= showcaseCap) {
      setMessage(
        isBlack
          ? `Max ${showcaseCap} Discord cards.`
          : "Discord live cards need under VOID.",
      );
      if (!isBlack) lock();
      return;
    }
    setInviteLoading(true);
    try {
      const res = await fetch(
        `/api/discord/invite?url=${encodeURIComponent(inviteInput.trim())}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not fetch invite.");
        return;
      }
      setConfig((c) => ({
        ...c,
        showcases: [
          ...c.showcases,
          {
            type: "discord" as const,
            inviteCode: data.code,
            title: data.title,
            subtitle: "",
            url: data.inviteUrl,
            image: data.image,
            online: data.online,
            members: data.members,
          },
        ].slice(0, 5),
      }));
      setInviteInput("");
      setMessage(`Added ${data.title} (${data.members} members).`);
    } catch {
      setMessage("Failed to fetch Discord invite.");
    } finally {
      setInviteLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <p className="help">
        Build modules for your page: socials, tags, badges, Discord servers, and music. Everything
        here is real data - no placeholders.
      </p>

      {!isBlack && <BlackUpsellBanner />}

      <section>
        <h2 className="section-title mb-3 text-xl">Socials</h2>
        <p className="help mb-3">
          {isBlack
            ? "Up to 40 platforms - Instagram, TikTok, Steam, Spotify, GitHub, and more."
            : `Free: ${FREE_CAPS.links} socials. `}
          {!isBlack && (
            <span className="inline-flex items-center gap-1 text-sky-200/80">
              <BlackDiamond /> VOID unlocks 40.
            </span>
          )}
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          {config.links.map((link, i) => (
            <button
              key={`${link.url}-${i}`}
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm hover:border-white/30"
              onClick={() =>
                setConfig((c) => ({
                  ...c,
                  links: c.links.filter((_, idx) => idx !== i),
                }))
              }
              title="Click to remove"
            >
              <Icon name={link.icon} className="text-sm" />
              {link.label}
            </button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-[200px_1fr_auto]">
          <SoftSelect
            value={socialId}
            onChange={setSocialId}
            options={SOCIAL_PLATFORMS.map((s) => ({ value: s.id, label: s.label }))}
          />
          <input
            className="soft-input"
            placeholder={selectedSocial.placeholder}
            value={socialUrl}
            onChange={(e) => setSocialUrl(e.target.value)}
          />
          <button type="button" className="btn btn-ghost" onClick={addSocial}>
            <Icon name={selectedSocial.id} className="text-sm" />
            Add
          </button>
        </div>
      </section>

      <section>
        <h2 className="section-title mb-3 text-xl">Badge shelf</h2>
        <p className="help mb-3">
          Toggle icons for the badge row. Click an active badge, then set the hover tooltip text
          visitors see on your public page.
        </p>
        <div className="flex flex-wrap gap-2">
          {BADGE_PRESETS.map((b) => {
            const active = config.badges.some((x) => x.icon === b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  if (active) {
                    setEditBadge(b.id);
                    setBadgeTip(
                      config.badges.find((x) => x.icon === b.id)?.description || b.label,
                    );
                  } else {
                    toggleBadge(b.id, b.label);
                    setEditBadge(b.id);
                    setBadgeTip(b.label);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (active) toggleBadge(b.id, b.label);
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                  active
                    ? editBadge === b.id
                      ? "border-white/60 bg-white/15 text-white"
                      : "border-white/40 bg-white/10 text-white"
                    : "border-white/10 text-white/45 hover:border-white/25"
                }`}
                title={active ? "Click to edit tooltip · right-click to remove" : `Add ${b.label}`}
              >
                <Icon name={b.id} className="text-sm" glow={active} />
              </button>
            );
          })}
        </div>
        {editBadge && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              className="soft-input"
              placeholder="Tooltip text (e.g. Suggestor Plus)"
              value={badgeTip}
              maxLength={120}
              onChange={(e) => setBadgeTip(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setConfig((c) => ({
                  ...c,
                  badges: c.badges.map((b) =>
                    b.icon === editBadge
                      ? { ...b, description: badgeTip.trim() || b.name }
                      : b,
                  ),
                }));
                setMessage("Badge tooltip saved - remember to Save below.");
              }}
            >
              Set tooltip
            </button>
            <button
              type="button"
              className="btn btn-danger text-xs"
              onClick={() => {
                toggleBadge(editBadge, editBadge);
                setEditBadge(null);
              }}
            >
              Remove
            </button>
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title mb-3 text-xl">Tags</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {config.tags.map((t) => (
            <button
              key={t}
              type="button"
              className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70 hover:border-white/30"
              onClick={() =>
                setConfig((c) => ({ ...c, tags: c.tags.filter((x) => x !== t) }))
              }
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="soft-input"
            placeholder="Web Developer"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
          <button type="button" className="btn btn-ghost" onClick={addTag}>
            <Icon name="tags" className="text-xs" />
            Add tag
          </button>
        </div>
      </section>

      <section>
        <h2 className="section-title mb-3 inline-flex items-center gap-2 text-xl">
          Discord servers {!isBlack && <BlackDiamond />}
        </h2>
        <p className="help mb-3">
          {isBlack
            ? "Live logo + online + members from a real invite link."
            : "Live Discord cards are a VOID feature."}
        </p>
        {!isBlack && (
          <button type="button" className="btn btn-primary mb-3" onClick={lock}>
            <BlackDiamond /> Unlock Discord cards
          </button>
        )}
        <div className={`space-y-2 ${!isBlack ? "pointer-events-none opacity-40" : ""}`}>
          {config.showcases.map((item, i) => (
            <div
              key={`${item.inviteCode}-${i}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/avatar-fallback.svg"}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title || item.inviteCode}</p>
                  <p className="help truncate">
                    {item.online} online · {item.members} members
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-danger text-xs"
                onClick={() =>
                  setConfig((c) => ({
                    ...c,
                    showcases: c.showcases.filter((_, idx) => idx !== i),
                  }))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            className="soft-input"
            placeholder="https://discord.gg/...."
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={addDiscordServer}
            disabled={inviteLoading || !inviteInput.trim()}
          >
            <Icon name="discord" className="text-sm" />
            {inviteLoading ? "Fetching…" : "Add server"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title text-xl">Music track</h2>
        <input
          className="soft-input"
          placeholder="Track title"
          value={config.tracks[0]?.title || ""}
          onChange={(e) =>
            setConfig((c) => ({
              ...c,
              audio: { ...c.audio, trackPlayer: "embed", autoPlay: true },
              tracks: [
                {
                  title: e.target.value,
                  url: c.tracks[0]?.url || "",
                  cover: c.tracks[0]?.cover || "",
                },
              ],
            }))
          }
        />
        <MediaUpload
          label="Audio file"
          hint="mp3/wav/ogg · max 15MB"
          kind="audio"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
          value={config.tracks[0]?.url || ""}
          onChange={(url) =>
            setConfig((c) => ({
              ...c,
              audio: { ...c.audio, trackPlayer: url ? "embed" : "none", autoPlay: true },
              tracks: url
                ? [
                    {
                      title: c.tracks[0]?.title || "Track",
                      url,
                      cover: c.tracks[0]?.cover || "",
                    },
                  ]
                : [],
            }))
          }
        />
        <MediaUpload
          label="Cover art"
          hint="optional"
          kind="cover"
          accept="image/png,image/jpeg,image/webp,image/gif"
          value={config.tracks[0]?.cover || ""}
          onChange={(cover) =>
            setConfig((c) => ({
              ...c,
              tracks: c.tracks[0] ? [{ ...c.tracks[0], cover }] : [],
            }))
          }
        />
      </section>

      <SaveBar
        saving={pending}
        message={message}
        onSave={() =>
          startTransition(async () => {
            const res = await saveProfileConfig({
              links: config.links,
              badges: config.badges,
              tags: config.tags,
              tracks: config.tracks,
              showcases: config.showcases,
              audio: config.audio,
            });
            setMessage(res.ok ? res.message || "Saved." : res.error || "Failed.");
          })
        }
      />
    </div>
  );
}

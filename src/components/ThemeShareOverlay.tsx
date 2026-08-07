"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  applyThemeTemplate,
  type ThemeTemplateListItem,
} from "@/app/actions/templates";
import { SoftOnOff } from "@/components/forms/SoftSelect";
import { Icon } from "@/components/Icon";
import {
  DEFAULT_APPLY_OPTIONS,
  type ThemeApplyOptions,
} from "@/lib/theme-template";
import { cn } from "@/lib/utils";

const TOGGLES: { key: keyof ThemeApplyOptions; label: string; hint: string }[] = [
  { key: "colors", label: "Colors & fonts", hint: "Text, theme, accents" },
  { key: "box", label: "Panel / box", hint: "Card chrome" },
  { key: "effects", label: "Effects", hint: "Aurora, motion" },
  { key: "layout", label: "Layout", hint: "Gaps & alignment" },
  { key: "page", label: "Reveal & overlays", hint: "Click-to-enter" },
  { key: "audioStyle", label: "Player style", hint: "Not your songs" },
  { key: "backgroundLook", label: "Background look", hint: "Keeps your image" },
  { key: "bannerLook", label: "Banner look", hint: "Keeps your banner" },
  { key: "backgroundMedia", label: "Theme BG media", hint: "Replace background" },
  { key: "bannerMedia", label: "Theme banner media", hint: "Replace banner" },
];

export function ThemeShareOverlay({
  theme,
  signedIn,
  startOpen = true,
}: {
  theme: ThemeTemplateListItem;
  signedIn: boolean;
  startOpen?: boolean;
}) {
  const [open, setOpen] = useState(startOpen);
  const [step, setStep] = useState<"info" | "apply">("info");
  const [opts, setOpts] = useState<ThemeApplyOptions>({ ...DEFAULT_APPLY_OPTIONS });
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/templates/${theme.id}`
      : `https://under.bio/templates/${theme.id}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function copyLink() {
    void navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  function apply() {
    if (!signedIn) {
      router.push(`/login?next=/templates/${theme.id}`);
      return;
    }
    start(async () => {
      const res = await applyThemeTemplate(theme.id, opts);
      setMsg(res.ok ? res.message || "Applied." : res.error || "Failed.");
      if (res.ok) router.push("/dashboard/miscellaneous");
    });
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => {
            setStep("info");
            setOpen(true);
          }}
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/15 bg-black/70 px-5 py-2.5 text-sm text-white shadow-2xl backdrop-blur-md transition hover:border-white/30"
        >
          Theme details
        </button>
      )}

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Close"
              className="absolute inset-0 [backdrop-filter:blur(var(--ub-blur))] [-webkit-backdrop-filter:blur(var(--ub-blur))]"
              initial={{ backgroundColor: "rgba(0,0,0,0)", "--ub-blur": "0px" } as never}
              animate={
                {
                  backgroundColor: "rgba(0,0,0,0.55)",
                  "--ub-blur": "14px",
                } as never
              }
              exit={{ backgroundColor: "rgba(0,0,0,0)", "--ub-blur": "0px" } as never}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.38, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex max-h-[min(88dvh,720px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0e0e0e] shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
            >
              <div className="border-b border-white/8 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                      Theme
                    </p>
                    <h1 className="section-title mt-1 truncate text-2xl">{theme.name}</h1>
                    <p className="mt-1 text-sm text-white/45">
                      by @{theme.author_slug || "creator"}
                      {theme.featured ? " · Featured" : ""}
                      {" · "}
                      {theme.uses_count} uses
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost shrink-0 px-2 text-xs"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
                {theme.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    {theme.description}
                  </p>
                ) : null}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {step === "info" ? (
                  <div className="space-y-3 text-sm text-white/50">
                    <p>
                      Background shows a live preview of this look. Your links, Discord cards,
                      tags, songs, and media stay when you apply — unless you opt into media
                      replace.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wider text-white/35">
                      <span className="rounded-full border border-white/10 px-2.5 py-1">
                        {theme.category}
                      </span>
                      {theme.featured ? (
                        <span className="rounded-full border border-sky-300/25 px-2.5 py-1 text-sky-100/80">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    {msg && (
                      <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white/70">
                        {msg}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {TOGGLES.map((t) => (
                      <div
                        key={t.key}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-white/85">{t.label}</p>
                          <p className="text-[11px] text-white/35">{t.hint}</p>
                        </div>
                        <SoftOnOff
                          value={opts[t.key]}
                          onChange={(v) =>
                            setOpts((o) => ({
                              ...o,
                              [t.key]: v,
                              ...(t.key === "backgroundMedia" && v
                                ? { backgroundLook: true }
                                : {}),
                              ...(t.key === "bannerMedia" && v
                                ? { bannerLook: true }
                                : {}),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 border-t border-white/8 px-5 py-4">
                {step === "info" ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary w-full"
                      onClick={() => {
                        if (!signedIn) {
                          router.push(`/login?next=/templates/${theme.id}`);
                          return;
                        }
                        setStep("apply");
                      }}
                    >
                      {signedIn ? "Apply to my page" : "Sign in to apply"}
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost flex-1"
                        onClick={copyLink}
                      >
                        <Icon name="external" className="text-xs" glow={false} />
                        {copied ? "Copied" : "Copy link"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost flex-1"
                        onClick={() => setOpen(false)}
                      >
                        View preview
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost flex-1"
                      onClick={() => setStep("info")}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className={cn("btn btn-primary flex-1", pending && "opacity-70")}
                      disabled={pending}
                      onClick={apply}
                    >
                      {pending ? "Applying…" : "Apply selected"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

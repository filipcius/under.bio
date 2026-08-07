"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  applyThemeTemplate,
  deleteOwnThemeTemplate,
  publishThemeTemplate,
  type ThemeTemplateListItem,
} from "@/app/actions/templates";
import { ThemeTemplateCard } from "@/components/ThemeTemplateCard";
import { SoftOnOff, SoftSelect } from "@/components/forms/SoftSelect";
import { Icon } from "@/components/Icon";
import {
  DEFAULT_APPLY_OPTIONS,
  THEME_TEMPLATE_CATEGORIES,
  type ThemeApplyOptions,
} from "@/lib/theme-template";
import type { ThemeTemplateCategory } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type CatFilter = "popular" | "featured" | "all" | ThemeTemplateCategory | "mine";

const APPLY_TOGGLES: {
  key: keyof ThemeApplyOptions;
  label: string;
  hint: string;
}[] = [
  { key: "colors", label: "Colors & fonts", hint: "Text, theme, accents" },
  { key: "box", label: "Panel / box", hint: "Card chrome & borders" },
  { key: "effects", label: "Effects", hint: "Aurora, orbs, motion" },
  { key: "layout", label: "Layout", hint: "Alignment, gaps, scale" },
  { key: "page", label: "Reveal & overlays", hint: "Click-to-enter, page FX" },
  { key: "audioStyle", label: "Player style", hint: "Not your songs" },
  { key: "backgroundLook", label: "Background look", hint: "Color / gradient / blur" },
  { key: "bannerLook", label: "Banner look", hint: "Height, overlay — keeps your image" },
  { key: "backgroundMedia", label: "Theme background media", hint: "Replace your BG image/video" },
  { key: "bannerMedia", label: "Theme banner media", hint: "Replace your banner" },
];

function ModalShell({
  open,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center px-3 pb-3 pt-[max(0.75rem,calc(env(safe-area-inset-top)+4.5rem))] sm:items-center sm:p-6 sm:pt-[max(1.5rem,calc(env(safe-area-inset-top)+5rem))]">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 [backdrop-filter:blur(var(--ub-blur))] [-webkit-backdrop-filter:blur(var(--ub-blur))]"
            initial={{ backgroundColor: "rgba(0,0,0,0)", "--ub-blur": "0px" } as never}
            animate={
              {
                backgroundColor: "rgba(0,0,0,0.7)",
                "--ub-blur": "12px",
              } as never
            }
            exit={{ backgroundColor: "rgba(0,0,0,0)", "--ub-blur": "0px" } as never}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.38, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative z-10 flex max-h-[min(calc(100dvh-6.5rem),760px)] w-full flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#101010] shadow-2xl",
              wide ? "max-w-lg" : "max-w-md",
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function TemplatesBrowser({
  themes,
  mine = [],
  signedIn,
  canPublish,
  publishReason,
  daysLeft,
  myCount,
  mode = "public",
}: {
  themes: ThemeTemplateListItem[];
  mine?: ThemeTemplateListItem[];
  signedIn: boolean;
  canPublish?: boolean;
  publishReason?: string;
  daysLeft?: number;
  myCount?: number;
  mode?: "public" | "dashboard";
}) {
  const [cat, setCat] = useState<CatFilter>("popular");
  const [sort, setSort] = useState<"popular" | "newest">("popular");
  const [createOpen, setCreateOpen] = useState(false);
  const [applyTheme, setApplyTheme] = useState<ThemeTemplateListItem | null>(null);
  const [applyOpts, setApplyOpts] = useState<ThemeApplyOptions>({ ...DEFAULT_APPLY_OPTIONS });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ThemeTemplateCategory>("dark");
  const [msg, setMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  function shareUrl(id: string) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/templates/${id}`;
    }
    return `https://under.bio/templates/${id}`;
  }

  function copyShareLink(id: string) {
    void navigator.clipboard.writeText(shareUrl(id)).then(() => {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1600);
    });
  }

  const chips: { id: CatFilter; label: string }[] = [
    { id: "popular", label: "Popular" },
    { id: "featured", label: "Featured" },
    { id: "all", label: "All" },
    ...THEME_TEMPLATE_CATEGORIES.map((c) => ({ id: c.id as CatFilter, label: c.label })),
    ...(mode === "dashboard" ? [{ id: "mine" as const, label: "Mine" }] : []),
  ];

  const list = useMemo(() => {
    let rows = cat === "mine" ? [...mine] : [...themes];
    if (cat === "featured") rows = rows.filter((t) => t.featured);
    else if (cat !== "popular" && cat !== "all" && cat !== "mine") {
      rows = rows.filter((t) => t.category === cat);
    }
    if (cat !== "mine") {
      rows.sort((a, b) =>
        sort === "newest"
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : b.uses_count - a.uses_count || Number(b.featured) - Number(a.featured),
      );
    }
    return rows;
  }, [themes, mine, cat, sort]);

  function openApply(theme: ThemeTemplateListItem) {
    if (!signedIn) {
      router.push("/login?next=/dashboard/templates");
      return;
    }
    setApplyOpts({ ...DEFAULT_APPLY_OPTIONS });
    setApplyTheme(theme);
  }

  function confirmApply() {
    if (!applyTheme) return;
    setBusyId(applyTheme.id);
    start(async () => {
      const res = await applyThemeTemplate(applyTheme.id, applyOpts);
      setMsg(res.ok ? res.message || "Applied." : res.error || "Failed.");
      setBusyId(null);
      setApplyTheme(null);
      if (res.ok) router.push("/dashboard/miscellaneous");
      else router.refresh();
    });
  }

  function remove(id: string) {
    setBusyId(id);
    start(async () => {
      const res = await deleteOwnThemeTemplate(id);
      setMsg(res.ok ? res.message || "Deleted." : res.error || "Failed.");
      setBusyId(null);
      router.refresh();
    });
  }

  function publish() {
    start(async () => {
      const res = await publishThemeTemplate({ name, description, category });
      setMsg(res.ok ? res.message || "Submitted." : res.error || "Failed.");
      if (res.ok) {
        setName("");
        setDescription("");
        setCreateOpen(false);
        setCat("mine");
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {msg && (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70">
          {msg}
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                cat === c.id
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 text-white/45 hover:border-white/20 hover:text-white/70",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {cat !== "mine" && (
            <SoftSelect
              className="w-36"
              value={sort}
              onChange={(v) => setSort(v as "popular" | "newest")}
              options={[
                { value: "popular", label: "Most used" },
                { value: "newest", label: "Newest" },
              ]}
            />
          )}
          {mode === "dashboard" && (
            <button
              type="button"
              className="btn btn-primary text-sm"
              onClick={() => setCreateOpen(true)}
            >
              Create
            </button>
          )}
        </div>
      </div>

      {mode === "dashboard" && (
        <p className="text-xs text-white/35">Active themes: {myCount ?? 0}/5</p>
      )}

      {list.length === 0 ? (
        <p className="help py-16 text-center">No themes here yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((theme) => (
            <ThemeTemplateCard
              key={theme.id}
              theme={theme}
              showStatus={cat === "mine"}
              applying={busyId === theme.id || pending}
              onApply={() => openApply(theme)}
              onDelete={
                mode === "dashboard" && cat === "mine" && !theme.featured
                  ? () => remove(theme.id)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {!signedIn && mode === "public" && (
        <p className="text-center text-sm text-white/40">
          <a
            href="/login?next=/dashboard/templates"
            className="text-white/70 underline-offset-2 hover:underline"
          >
            Sign in
          </a>{" "}
          to apply or publish themes.
        </p>
      )}

      {/* Create modal */}
      <ModalShell open={createOpen} onClose={() => setCreateOpen(false)}>
        <div className="shrink-0 border-b border-white/8 px-5 py-4">
          <h2 className="section-title text-xl">Create theme</h2>
          <p className="help mt-1">
            Publish your current Style look. Bio, links, tags, Discord cards, tracks, and your
            media stay private — only the look is shared.
          </p>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {!canPublish ? (
            <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-50/90">
              {publishReason}
              {typeof daysLeft === "number" ? ` (~${daysLeft} day(s) left)` : ""}
            </p>
          ) : (
            <>
              <div>
                <div className="label">
                  <span>Name</span>
                </div>
                <input
                  className="soft-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Midnight neon"
                  maxLength={48}
                  autoFocus
                />
              </div>
              <div>
                <div className="label">
                  <span>Description</span>
                </div>
                <textarea
                  className="soft-input min-h-[72px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional short note"
                  maxLength={280}
                />
              </div>
              <div>
                <div className="label">
                  <span>Category</span>
                </div>
                <SoftSelect
                  value={category}
                  onChange={(v) => setCategory(v as ThemeTemplateCategory)}
                  options={THEME_TEMPLATE_CATEGORIES.map((c) => ({
                    value: c.id,
                    label: c.label,
                  }))}
                />
              </div>
              <p className="text-xs text-white/35">
                Submitted for admin review · slots {myCount ?? 0}/5
              </p>
            </>
          )}
        </div>
        <div className="flex shrink-0 gap-2 border-t border-white/8 px-5 py-4">
          <button
            type="button"
            className="btn btn-ghost flex-1"
            onClick={() => setCreateOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary flex-1"
            disabled={!canPublish || pending || name.trim().length < 3}
            onClick={publish}
          >
            {pending ? "Submitting…" : "Submit for review"}
          </button>
        </div>
      </ModalShell>

      {/* Apply modal */}
      <ModalShell
        open={Boolean(applyTheme)}
        onClose={() => setApplyTheme(null)}
        wide
      >
        {applyTheme && (
          <>
            <div className="shrink-0 border-b border-white/8 px-5 py-4">
              <h2 className="section-title text-xl">Apply “{applyTheme.name}”</h2>
              <p className="help mt-1">
                Choose what to import. Your Discord cards, tags, links, songs, bio, and media
                stay unless you turn on media replace below.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/templates/${applyTheme.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost text-xs"
                >
                  <Icon name="external" className="text-[10px]" glow={false} />
                  Preview
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost text-xs"
                  onClick={() => copyShareLink(applyTheme.id)}
                >
                  {copiedId === applyTheme.id ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 py-4">
              {APPLY_TOGGLES.map((t) => (
                <div
                  key={t.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white/85">{t.label}</p>
                    <p className="text-[11px] text-white/35">{t.hint}</p>
                  </div>
                  <SoftOnOff
                    value={applyOpts[t.key]}
                    onChange={(v) =>
                      setApplyOpts((o) => ({
                        ...o,
                        [t.key]: v,
                        ...(t.key === "backgroundMedia" && v
                          ? { backgroundLook: true }
                          : {}),
                        ...(t.key === "bannerMedia" && v ? { bannerLook: true } : {}),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="flex shrink-0 gap-2 border-t border-white/8 px-5 py-4">
              <button
                type="button"
                className="btn btn-ghost flex-1"
                onClick={() => setApplyTheme(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary flex-1"
                disabled={pending || busyId === applyTheme.id}
                onClick={confirmApply}
              >
                {pending || busyId === applyTheme.id ? "Applying…" : "Apply selected"}
              </button>
            </div>
          </>
        )}
      </ModalShell>
    </div>
  );
}

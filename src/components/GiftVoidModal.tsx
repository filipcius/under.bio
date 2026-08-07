"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BlackDiamond } from "@/components/BlackDiamond";
import { Icon } from "@/components/Icon";
import {
  BLACK_NAME,
  BLACK_PRICE_LINE,
  BLACK_PRICE_USD,
} from "@/lib/plan";
import { cn } from "@/lib/utils";

type Recipient = {
  id: string;
  slug: string;
  name: string;
  avatar: string | null;
  hasLifetime: boolean;
};

export function GiftVoidModal({
  open,
  onClose,
  signedIn,
}: {
  open: boolean;
  onClose: () => void;
  signedIn?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [slug, setSlug] = useState("");
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setSlug("");
      setRecipient(null);
      setError(null);
    }
  }, [open]);

  async function lookup() {
    setError(null);
    setRecipient(null);
    if (!signedIn) {
      router.push("/login?next=/black");
      return;
    }
    const clean = slug.trim().toLowerCase().replace(/^@/, "");
    if (!clean) {
      setError("Enter their under.bio username.");
      return;
    }
    setLooking(true);
    try {
      const res = await fetch("/api/stripe/gift-lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: clean }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not find that user.");
        return;
      }
      if (data.profile.hasLifetime) {
        setError("They already have lifetime VOID.");
        setRecipient(data.profile);
        return;
      }
      setRecipient(data.profile);
    } catch {
      setError("Lookup failed.");
    } finally {
      setLooking(false);
    }
  }

  function checkoutGift() {
    if (!recipient || recipient.hasLifetime) return;
    start(async () => {
      setError(null);
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ giftToSlug: recipient.slug }),
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          setError(data.error || "Checkout failed.");
          return;
        }
        window.location.href = data.url;
      } catch {
        setError("Checkout failed.");
      }
    });
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/12 bg-[#0e0e0e] shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
          >
            <div className="border-b border-white/8 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-sky-200/70">
                    <Icon name="gift" className="text-[11px]" glow={false} />
                    Gift
                  </p>
                  <h2 className="section-title mt-1 text-2xl">
                    Gift {BLACK_NAME}
                  </h2>
                  <p className="mt-1 text-sm text-white/45">
                    One-time {BLACK_PRICE_LINE}. They unlock forever.
                  </p>
                </div>
                <button type="button" className="btn btn-ghost shrink-0 px-2 text-xs" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div>
                <div className="label">
                  <span>Their under.bio username</span>
                </div>
                <div className="flex gap-2">
                  <input
                    className="soft-input"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setRecipient(null);
                      setError(null);
                    }}
                    placeholder="username"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void lookup();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost shrink-0"
                    disabled={looking}
                    onClick={() => void lookup()}
                  >
                    {looking ? "…" : "Find"}
                  </button>
                </div>
              </div>

              {recipient && (
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-3",
                    recipient.hasLifetime
                      ? "border-white/10 bg-white/[0.02]"
                      : "border-sky-300/25 bg-sky-400/[0.06]",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={recipient.avatar || "/avatar-fallback.svg"}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {recipient.name}
                    </p>
                    <p className="truncate text-xs text-white/40">
                      under.bio/{recipient.slug}
                    </p>
                  </div>
                  {recipient.hasLifetime ? (
                    <span className="text-[11px] text-white/40">Has VOID</span>
                  ) : (
                    <BlackDiamond />
                  )}
                </div>
              )}

              {error && (
                <p className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                  {error}
                </p>
              )}
            </div>

            <div className="border-t border-white/8 px-5 py-4">
              <button
                type="button"
                className="btn btn-primary w-full"
                disabled={!recipient || recipient.hasLifetime || pending}
                onClick={checkoutGift}
              >
                <Icon name="gift" className="text-sm" glow={false} />
                {pending
                  ? "Opening Stripe…"
                  : `Gift ${BLACK_NAME} · $${BLACK_PRICE_USD}`}
              </button>
              <p className="mt-2 text-center text-[11px] text-white/35">
                Secure one-time payment via Stripe
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

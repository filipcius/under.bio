"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BlackDiamond } from "@/components/BlackDiamond";
import { Icon } from "@/components/Icon";
import { GiftVoidModal } from "@/components/GiftVoidModal";
import { BLACK_NAME, BLACK_PRICE_LINE } from "@/lib/plan";
import { cn } from "@/lib/utils";

export function GiftVoidButton({
  signedIn,
  className = "btn btn-ghost w-full text-base",
  label,
}: {
  signedIn?: boolean;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          if (!signedIn) {
            router.push("/login?next=/black");
            return;
          }
          setOpen(true);
        }}
      >
        <Icon name="gift" className="text-sm" glow={false} />
        {label || `Gift ${BLACK_NAME}`}
      </button>
      <GiftVoidModal open={open} onClose={() => setOpen(false)} signedIn={signedIn} />
    </>
  );
}

export function BlackCheckoutButton({
  label,
  className = "btn btn-primary flex-1 text-base",
  signedIn,
  showGift = true,
}: {
  label?: string;
  className?: string;
  signedIn?: boolean;
  /** Show gift icon button beside purchase CTA */
  showGift?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [giftOpen, setGiftOpen] = useState(false);
  const router = useRouter();
  const text = label || `Get ${BLACK_NAME} · ${BLACK_PRICE_LINE}`;

  async function start() {
    setError(null);
    if (!signedIn) {
      router.push("/login?next=/black");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Checkout failed.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout failed.");
      setLoading(false);
    }
  }

  function openGift() {
    if (!signedIn) {
      router.push("/login?next=/black");
      return;
    }
    setGiftOpen(true);
  }

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <button
          type="button"
          className={className}
          onClick={start}
          disabled={loading}
        >
          <BlackDiamond />
          {loading ? "Opening Stripe…" : text}
        </button>
        {showGift && (
          <button
            type="button"
            className={cn(
              "btn btn-ghost shrink-0 !px-3",
              "border-sky-300/20 text-sky-100 hover:border-sky-300/35",
            )}
            onClick={openGift}
            title={`Gift ${BLACK_NAME}`}
            aria-label={`Gift ${BLACK_NAME}`}
          >
            <Icon name="gift" className="text-base" glow={false} />
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-center text-xs text-rose-300">{error}</p>}
      <GiftVoidModal
        open={giftOpen}
        onClose={() => setGiftOpen(false)}
        signedIn={signedIn}
      />
    </div>
  );
}

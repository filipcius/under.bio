"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BlackDiamond } from "@/components/BlackDiamond";

export function BlackCheckoutButton({
  label = "Get VOID",
  className = "btn btn-primary w-full text-base",
  signedIn,
}: {
  label?: string;
  className?: string;
  signedIn?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function start() {
    setError(null);
    if (!signedIn) {
      router.push("/login?next=/black");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
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

  return (
    <div className="w-full">
      <button type="button" className={className} onClick={start} disabled={loading}>
        <BlackDiamond />
        {loading ? "Opening Stripe…" : label}
      </button>
      {error && <p className="mt-2 text-center text-xs text-rose-300">{error}</p>}
    </div>
  );
}

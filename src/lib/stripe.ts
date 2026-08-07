import Stripe from "stripe";
import {
  BLACK_NAME,
  BLACK_PRICE_CENTS,
  BLACK_TAGLINE,
} from "@/lib/plan";

let stripe: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://under.bio"
  );
}

/** One-time lifetime VOID line item (not a recurring subscription). */
export function blackLifetimeLineItem(): Stripe.Checkout.SessionCreateParams.LineItem {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (priceId) {
    return { price: priceId, quantity: 1 };
  }
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: BLACK_PRICE_CENTS,
      product_data: {
        name: `under ${BLACK_NAME} Lifetime`,
        description: `${BLACK_TAGLINE} One-time purchase · forever.`,
      },
    },
  };
}

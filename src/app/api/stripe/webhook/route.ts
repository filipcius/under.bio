import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { grantVoidLifetime, setPlanFromStripe } from "@/lib/subscription";
import { notifyDiscordSubscription } from "@/lib/discord-webhook";
import { createAdminClient } from "@/lib/supabase/admin";
import { BLACK_PRICE_CENTS } from "@/lib/plan";

export const runtime = "nodejs";

async function syncSubscription(sub: Stripe.Subscription) {
  const profileId = sub.metadata?.profileId;
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  const periodEnd =
    "current_period_end" in sub && typeof sub.current_period_end === "number"
      ? sub.current_period_end
      : null;

  await setPlanFromStripe({
    profileId: profileId || undefined,
    customerId,
    subscriptionId: sub.id,
    status: sub.status,
    periodEnd,
  });
}

async function notifyVoidPurchase(session: Stripe.Checkout.Session) {
  const recipientId =
    session.metadata?.recipientProfileId || session.metadata?.profileId || null;
  const discordId = session.metadata?.discordId || null;
  let slug: string | null = session.metadata?.giftToSlug || null;

  if (recipientId) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("profiles")
        .select("slug")
        .eq("id", recipientId)
        .maybeSingle();
      slug = (data as { slug?: string } | null)?.slug ?? slug;
    } catch {
      // ignore
    }
  }

  await notifyDiscordSubscription({
    profileId: recipientId,
    discordId,
    slug,
    email: session.customer_details?.email || session.customer_email || null,
    customerId:
      typeof session.customer === "string" ? session.customer : session.customer?.id,
  });
}

async function fulfillLifetimeCheckout(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid" && session.status !== "complete") {
    return;
  }

  const recipientId = session.metadata?.recipientProfileId;
  const buyerId = session.metadata?.buyerProfileId;
  const kind = session.metadata?.kind || "self";
  if (!recipientId) return;

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;

  await grantVoidLifetime({
    profileId: recipientId,
    customerId: kind === "self" ? customerId : undefined,
    stripeSessionId: session.id,
  });

  if (kind === "gift" && buyerId) {
    try {
      const admin = createAdminClient();
      await admin.from("void_gifts").upsert(
        {
          buyer_id: buyerId,
          recipient_id: recipientId,
          stripe_session_id: session.id,
          amount_cents: BLACK_PRICE_CENTS,
        },
        { onConflict: "stripe_session_id" },
      );
    } catch (err) {
      console.error("void_gifts insert failed (run supabase/void_gifts.sql?)", err);
    }
  }

  await notifyVoidPurchase(session);
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Stripe webhook signature failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "payment") {
          await fulfillLifetimeCheckout(session);
        } else if (session.mode === "subscription" && session.subscription) {
          // Legacy monthly checkouts still sync
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          if (!sub.metadata?.profileId && session.metadata?.profileId) {
            await stripe.subscriptions.update(sub.id, {
              metadata: {
                ...sub.metadata,
                profileId: session.metadata.profileId,
                discordId: session.metadata.discordId || "",
              },
            });
            sub.metadata = {
              ...sub.metadata,
              profileId: session.metadata.profileId,
            };
          }
          await syncSubscription(sub);
          await notifyVoidPurchase(session);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error", err);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

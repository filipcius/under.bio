import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { setPlanFromStripe } from "@/lib/subscription";
import { notifyDiscordSubscription } from "@/lib/discord-webhook";
import { createAdminClient } from "@/lib/supabase/admin";

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

async function notifyNewVoidCheckout(session: Stripe.Checkout.Session) {
  const profileId = session.metadata?.profileId || null;
  const discordId = session.metadata?.discordId || null;
  let slug: string | null = null;

  if (profileId) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("profiles")
        .select("slug")
        .eq("id", profileId)
        .maybeSingle();
      slug = (data as { slug?: string } | null)?.slug ?? null;
    } catch {
      // ignore lookup failures
    }
  }

  await notifyDiscordSubscription({
    profileId,
    discordId,
    slug,
    email: session.customer_details?.email || session.customer_email || null,
    customerId:
      typeof session.customer === "string" ? session.customer : session.customer?.id,
  });
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
        if (session.mode === "subscription" && session.subscription) {
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
          await notifyNewVoidCheckout(session);
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

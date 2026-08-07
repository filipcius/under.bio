import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe, getSiteUrl, blackLifetimeLineItem } from "@/lib/stripe";
import { getPlanByProfileId } from "@/lib/subscription";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/security";
import { hasLifetimeVoid } from "@/lib/plan";
import { z } from "zod";

const bodySchema = z.object({
  giftToSlug: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .regex(/^[a-z0-9_-]+$/i)
    .optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.profileId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const limited = rateLimit(`stripe-checkout:${session.user.profileId}`, 8);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Slow down. Try again in ${limited.retryAfterSec}s.` },
      { status: 429 },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payments are not configured yet." },
      { status: 503 },
    );
  }

  let giftToSlug: string | undefined;
  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid gift recipient." }, { status: 400 });
    }
    giftToSlug = parsed.data.giftToSlug?.toLowerCase();
  } catch {
    giftToSlug = undefined;
  }

  const admin = createAdminClient();
  const buyerPlan = await getPlanByProfileId(session.user.profileId);

  let recipientId = session.user.profileId;
  let kind: "self" | "gift" = "self";

  if (giftToSlug) {
    const { data: recipient } = await admin
      .from("profiles")
      .select("id, slug, plan, plan_status, plan_period_end")
      .eq("slug", giftToSlug)
      .maybeSingle();

    const row = recipient as {
      id: string;
      slug: string;
      plan?: string | null;
      plan_status?: string | null;
      plan_period_end?: string | null;
    } | null;

    if (!row) {
      return NextResponse.json(
        { error: "No under.bio page with that username." },
        { status: 404 },
      );
    }
    if (row.id === session.user.profileId) {
      return NextResponse.json(
        { error: "Use Get VOID to unlock your own page." },
        { status: 400 },
      );
    }
    if (hasLifetimeVoid(row.plan, row.plan_status, row.plan_period_end)) {
      return NextResponse.json(
        { error: "They already have lifetime VOID." },
        { status: 400 },
      );
    }
    recipientId = row.id;
    kind = "gift";
  } else if (buyerPlan.isLifetime) {
    return NextResponse.json(
      { error: "You already have lifetime VOID." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const site = getSiteUrl();

  let customerId = buyerPlan.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email || undefined,
      name: session.user.name || undefined,
      metadata: {
        profileId: session.user.profileId,
        discordId: session.user.discordId,
        slug: session.user.slug,
      },
    });
    customerId = customer.id;
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", session.user.profileId);
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [blackLifetimeLineItem()],
    success_url:
      kind === "gift"
        ? `${site}/dashboard?gift=1`
        : `${site}/dashboard?black=1`,
    cancel_url: `${site}/black?canceled=1`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    metadata: {
      kind,
      buyerProfileId: session.user.profileId,
      recipientProfileId: recipientId,
      discordId: session.user.discordId,
      giftToSlug: giftToSlug || "",
    },
    payment_intent_data: {
      metadata: {
        kind,
        buyerProfileId: session.user.profileId,
        recipientProfileId: recipientId,
      },
    },
  });

  return NextResponse.json({ url: checkout.url });
}

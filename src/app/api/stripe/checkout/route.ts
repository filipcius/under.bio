import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe, getSiteUrl, blackLineItem } from "@/lib/stripe";
import { getPlanByProfileId } from "@/lib/subscription";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/security";

export async function POST() {
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

  const plan = await getPlanByProfileId(session.user.profileId);
  if (plan.isBlack) {
    return NextResponse.json({ error: "You already have VOID." }, { status: 400 });
  }

  const stripe = getStripe();
  const site = getSiteUrl();
  const admin = createAdminClient();

  let customerId = plan.stripeCustomerId;
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
    mode: "subscription",
    customer: customerId,
    line_items: [blackLineItem()],
    success_url: `${site}/dashboard?black=1`,
    cancel_url: `${site}/black?canceled=1`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    metadata: {
      profileId: session.user.profileId,
      discordId: session.user.discordId,
    },
    subscription_data: {
      metadata: {
        profileId: session.user.profileId,
        discordId: session.user.discordId,
      },
    },
  });

  return NextResponse.json({ url: checkout.url });
}

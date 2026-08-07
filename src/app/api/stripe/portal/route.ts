import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe, getSiteUrl } from "@/lib/stripe";
import { getPlanByProfileId } from "@/lib/subscription";

export async function POST() {
  const session = await auth();
  if (!session?.user?.profileId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payments are not configured yet." },
      { status: 503 },
    );
  }

  const plan = await getPlanByProfileId(session.user.profileId);
  if (!plan.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account yet." }, { status: 400 });
  }

  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: plan.stripeCustomerId,
    return_url: `${getSiteUrl()}/dashboard/account`,
  });

  return NextResponse.json({ url: portal.url });
}

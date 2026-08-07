import { createAdminClient } from "@/lib/supabase/admin";
import { hasBlack, type PlanId } from "@/lib/plan";

export type PlanState = {
  plan: PlanId;
  status: string;
  periodEnd: string | null;
  isBlack: boolean;
  stripeCustomerId: string | null;
};

export async function getPlanByProfileId(profileId: string): Promise<PlanState> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("plan, plan_status, plan_period_end, stripe_customer_id")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    // Migration not applied yet (supabase/subscriptions.sql)
    return {
      plan: "free",
      status: "inactive",
      periodEnd: null,
      isBlack: false,
      stripeCustomerId: null,
    };
  }

  const row = data as {
    plan: string | null;
    plan_status: string | null;
    plan_period_end: string | null;
    stripe_customer_id: string | null;
  } | null;

  const plan = (row?.plan === "black" ? "black" : "free") as PlanId;
  const status = row?.plan_status || "inactive";
  return {
    plan,
    status,
    periodEnd: row?.plan_period_end ?? null,
    isBlack: hasBlack(plan, status),
    stripeCustomerId: row?.stripe_customer_id ?? null,
  };
}

export async function setPlanFromStripe(input: {
  profileId?: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  status?: string | null;
  periodEnd?: number | null;
}) {
  const admin = createAdminClient();
  const active =
    input.status === "active" ||
    input.status === "trialing" ||
    input.status === "past_due";

  const patch = {
    plan: active ? "black" : "free",
    plan_status: input.status || "inactive",
    stripe_customer_id: input.customerId || undefined,
    stripe_subscription_id: input.subscriptionId || undefined,
    plan_period_end: input.periodEnd
      ? new Date(input.periodEnd * 1000).toISOString()
      : null,
  };

  if (input.profileId) {
    await admin.from("profiles").update(patch).eq("id", input.profileId);
    return;
  }
  if (input.customerId) {
    await admin
      .from("profiles")
      .update(patch)
      .eq("stripe_customer_id", input.customerId);
  }
}

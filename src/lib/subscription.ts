import { createAdminClient } from "@/lib/supabase/admin";
import { hasBlack, hasLifetimeVoid, type PlanId } from "@/lib/plan";

export type PlanState = {
  plan: PlanId;
  status: string;
  periodEnd: string | null;
  isBlack: boolean;
  isLifetime: boolean;
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
    return {
      plan: "free",
      status: "inactive",
      periodEnd: null,
      isBlack: false,
      isLifetime: false,
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
  const periodEnd = row?.plan_period_end ?? null;
  const active = hasBlack(plan, status, periodEnd);
  return {
    plan: active ? "black" : "free",
    status: active ? status : "inactive",
    periodEnd,
    isBlack: active,
    isLifetime: hasLifetimeVoid(plan, status, periodEnd),
    stripeCustomerId: row?.stripe_customer_id ?? null,
  };
}

/** Grant permanent VOID (paid lifetime or gift). Clears period end. */
export async function grantVoidLifetime(input: {
  profileId: string;
  customerId?: string | null;
  stripeSessionId?: string | null;
}) {
  const admin = createAdminClient();
  const patch: Record<string, unknown> = {
    plan: "black",
    plan_status: "active",
    plan_period_end: null,
  };
  if (input.customerId) patch.stripe_customer_id = input.customerId;

  await admin.from("profiles").update(patch).eq("id", input.profileId);
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

  if (input.profileId || input.customerId) {
    const q = admin
      .from("profiles")
      .select("plan, plan_status, plan_period_end, stripe_subscription_id");
    const { data: existing } = input.profileId
      ? await q.eq("id", input.profileId).maybeSingle()
      : await q.eq("stripe_customer_id", input.customerId!).maybeSingle();

    const row = existing as {
      plan?: string | null;
      plan_status?: string | null;
      plan_period_end?: string | null;
      stripe_subscription_id?: string | null;
    } | null;

    const lifetime = hasLifetimeVoid(
      row?.plan,
      row?.plan_status,
      row?.plan_period_end,
    );
    if (lifetime && !active) {
      if (
        input.subscriptionId &&
        row?.stripe_subscription_id &&
        input.subscriptionId !== row.stripe_subscription_id
      ) {
        return;
      }
      if (!row?.stripe_subscription_id) return;
    }
  }

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

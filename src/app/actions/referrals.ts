"use server";

import { requireSession } from "@/lib/session";
import { rateLimit } from "@/lib/security";
import { getInviteDashboard, type InviteDashboard } from "@/lib/referrals";

export async function loadInviteDashboard(): Promise<
  | { ok: true; data: InviteDashboard }
  | { ok: false; error: string }
> {
  try {
    const session = await requireSession();
    const rl = rateLimit(`invite:${session.user.profileId}`, 30, 60_000);
    if (!rl.ok) return { ok: false, error: "Slow down." };
    const data = await getInviteDashboard(session.user.profileId);
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Could not load invites." };
  }
}

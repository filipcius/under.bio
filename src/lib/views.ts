import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Count a view only if visitor is not the owner and hasn't viewed today */
export async function maybeRecordPageView(pageId: string, ownerDiscordId: string) {
  const session = await auth();
  if (session?.user?.discordId && session.user.discordId === ownerDiscordId) {
    return { counted: false, reason: "owner" as const };
  }

  const jar = await cookies();
  const cookieName = `ubv_${pageId.replace(/-/g, "").slice(0, 24)}`;
  const day = todayKey();
  if (jar.get(cookieName)?.value === day) {
    return { counted: false, reason: "duplicate" as const };
  }

  const admin = createAdminClient();
  const { error } = await admin.rpc("increment_page_view", { p_page_id: pageId });
  if (error) throw error;

  jar.set(cookieName, day, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return { counted: true, reason: "ok" as const };
}

export async function getViewRank(totalViews: number) {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("pages")
    .select("*", { count: "exact", head: true })
    .gt("total_views", totalViews);
  if (error) return null;
  return (count ?? 0) + 1;
}

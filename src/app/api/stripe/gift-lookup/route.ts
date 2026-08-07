import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/security";
import { hasLifetimeVoid } from "@/lib/plan";
import { z } from "zod";

const schema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .regex(/^[a-z0-9_-]+$/i),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.profileId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const limited = rateLimit(`gift-lookup:${session.user.profileId}`, 30);
  if (!limited.ok) {
    return NextResponse.json({ error: "Slow down." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid username." }, { status: 400 });
  }

  const slug = parsed.data.slug.toLowerCase();
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, slug, global_name, username, avatar_url, plan, plan_status, plan_period_end")
    .eq("slug", slug)
    .maybeSingle();

  const row = data as {
    id: string;
    slug: string;
    global_name: string | null;
    username: string;
    avatar_url: string | null;
    plan?: string | null;
    plan_status?: string | null;
    plan_period_end?: string | null;
  } | null;

  if (!row) {
    return NextResponse.json({ error: "Nobody with that under.bio username." }, { status: 404 });
  }

  if (row.id === session.user.profileId) {
    return NextResponse.json({ error: "That’s you — use Get VOID instead." }, { status: 400 });
  }

  const lifetime = hasLifetimeVoid(row.plan, row.plan_status, row.plan_period_end);

  return NextResponse.json({
    ok: true,
    profile: {
      id: row.id,
      slug: row.slug,
      name: row.global_name || row.username,
      avatar: row.avatar_url,
      hasLifetime: lifetime,
    },
  });
}

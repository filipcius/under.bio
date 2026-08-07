import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/admin-data";
import { AdminUserDetailForm } from "@/components/admin/AdminControls";
import { BlackDiamond } from "@/components/BlackDiamond";

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAdminUser(id);
  if (!data) notFound();

  const { profile, page, isBlack } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin" className="btn btn-ghost text-sm">
        ← All users
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.avatar_url || "/avatar-fallback.svg"}
          alt=""
          className="h-16 w-16 rounded-full object-cover ring-2 ring-white/10"
        />
        <div>
          <h1 className="section-title text-3xl">
            {profile.global_name || profile.username}
          </h1>
          <p className="help mt-1">
            @{profile.username} · uid {profile.uid} ·{" "}
            <a
              href={`/${profile.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-white/70 hover:text-white"
            >
              under.bio/{profile.slug}
            </a>
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/55">
            {isBlack ? (
              <>
                <BlackDiamond /> under VOID
              </>
            ) : (
              "Free plan"
            )}
            <span className="text-white/20">·</span>
            {page?.published ? "Published" : "Unpublished"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-4 text-sm">
          <p className="help">Discord ID</p>
          <p className="mt-1 break-all font-mono">{profile.discord_id}</p>
        </div>
        <div className="rounded-xl border border-white/10 p-4 text-sm">
          <p className="help">Email</p>
          <p className="mt-1">{profile.email || "-"}</p>
        </div>
        <div className="rounded-xl border border-white/10 p-4 text-sm">
          <p className="help">Stripe customer</p>
          <p className="mt-1 break-all font-mono text-xs">
            {profile.stripe_customer_id || "-"}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 p-4 text-sm">
          <p className="help">Joined</p>
          <p className="mt-1">{new Date(profile.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h2 className="section-title text-xl">Controls</h2>
        <div className="mt-5">
          <AdminUserDetailForm
            profileId={profile.id}
            slug={profile.slug}
            published={page?.published ?? false}
            isBlack={isBlack}
            totalViews={page?.total_views ?? 0}
            configJson={JSON.stringify(page?.config ?? {}, null, 2)}
          />
        </div>
      </div>
    </div>
  );
}

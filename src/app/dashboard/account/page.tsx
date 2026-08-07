import { requireSession } from "@/lib/session";
import { getProfileById } from "@/lib/data";
import { DashboardShell } from "@/components/DashboardShell";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";

export default async function AccountPage() {
  const session = await requireSession();
  const profile = await getProfileById(session.user.profileId);
  if (!profile) redirect("/dashboard");

  return (
    <DashboardShell title="Account" avatarUrl={profile.avatar_url} slug={profile.slug}>
      <div className="space-y-6">
        <p className="help">
          Account identity comes from Discord. Password login is not used — keep your Discord
          secure.
        </p>

        <div>
          <div className="label">
            <span>Email</span>
          </div>
          <input className="soft-input" value={profile.email || "Not shared by Discord"} readOnly />
        </div>

        <div>
          <div className="label">
            <span>Discord ID</span>
          </div>
          <input className="soft-input" value={profile.discord_id} readOnly />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 p-4">
            <p className="help">Username</p>
            <p className="mt-1 font-semibold">{profile.username}</p>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <p className="help">UID</p>
            <p className="mt-1 font-semibold">{profile.uid}</p>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <p className="help">Locale</p>
            <p className="mt-1 font-semibold">{profile.locale || "—"}</p>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <p className="help">Nitro / premium type</p>
            <p className="mt-1 font-semibold">{profile.premium_type ?? 0}</p>
          </div>
        </div>

        <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm">
          Discord avatar, banner, and flags refresh every time you log in.
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="btn btn-danger">
            Logout
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}

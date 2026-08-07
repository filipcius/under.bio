import Link from "next/link";
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icon";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  try {
    const session = await auth();
    if (session?.user?.profileId) redirect(params.next || "/dashboard");
  } catch {
    // env not configured yet
  }

  const errorMessage =
    params.error === "not_in_server"
      ? "You must be a member of the under.bio Discord server to sign in."
      : params.error === "auth_failed"
        ? "Sign-in failed. Try again or contact support."
        : params.error
          ? "Could not complete Discord login."
          : null;

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-16">
        <div className="glass-card w-full p-7 animate-rise">
          <h1 className="section-title text-3xl">Sign in</h1>
          <p className="help mt-2">
            Discord only. You must be in the required server. We pull your avatar, username, and
            profile stats automatically.
          </p>

          {errorMessage && (
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
              {errorMessage}
            </div>
          )}

          <form
            className="mt-6"
            action={async () => {
              "use server";
              await signIn("discord", { redirectTo: params.next || "/dashboard" });
            }}
          >
            <button type="submit" className="btn btn-discord">
              <Icon name="discord" className="text-lg" glow={false} />
              Continue with Discord
            </button>
          </form>

          <p className="help mt-4">
            One account = one page. Slugs cannot be shared.{" "}
            <Link href="/" className="text-white/70 underline-offset-2 hover:underline">
              Back home
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

import Link from "next/link";
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icon";
import { DISCORD_INVITE_URL } from "@/lib/site";

function loginErrorMessage(error?: string) {
  switch (error) {
    case "not_in_server":
      return "You must be a member of the under.bio Discord server to sign in.";
    case "auth_failed":
      return "Sign-in failed. Try again or contact support.";
    case "OAuthCallback":
    case "Callback":
    case "OAuthSignin":
      return "Discord login was interrupted. Clear site cookies for under.bio and try once more.";
    case "Configuration":
      return "Login is misconfigured. Try again in a minute.";
    case "AccessDenied":
      return "Access denied. Join the required Discord server, then try again.";
    case "Verification":
      return "Login link expired. Start sign-in again.";
    default:
      return error ? "Could not complete Discord login. Please try again." : null;
  }
}

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

  const errorMessage = loginErrorMessage(params.error);
  const next = params.next && params.next.startsWith("/") ? params.next : "/dashboard";

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
              await signIn("discord", { redirectTo: next });
            }}
          >
            <button type="submit" className="btn btn-discord">
              <Icon name="discord" className="text-lg" glow={false} />
              Continue with Discord
            </button>
          </form>

          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost mt-3 w-full"
          >
            <Icon name="external" className="text-xs" />
            Join the Discord server first
          </a>

          <p className="help mt-4">
            Not in the server yet? Join above, then come back and sign in. One account = one page.{" "}
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

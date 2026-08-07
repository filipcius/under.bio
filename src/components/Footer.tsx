import Link from "next/link";
import { DISCORD_INVITE_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-sm text-white/40 sm:flex-row sm:items-center">
        <p className="section-title text-sm tracking-tight text-white/55">
          under.bio <span className="font-normal text-white/30">- {new Date().getFullYear()}</span>
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/black" className="hover:text-white/70">
            VOID
          </Link>
          <Link href="/terms" className="hover:text-white/70">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-white/70">
            Privacy
          </Link>
          <Link href="/faq" className="hover:text-white/70">
            FAQ
          </Link>
          <a
            href={DISCORD_INVITE_URL}
            className="hover:text-white/70"
            target="_blank"
            rel="noreferrer"
          >
            Discord
          </a>
        </div>
      </div>
    </footer>
  );
}

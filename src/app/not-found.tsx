import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.06),transparent_45%)]" />
        <div className="relative max-w-lg text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-white/35">404</p>
          <h1 className="section-title mt-3 text-5xl sm:text-6xl">No page here</h1>
          <p className="mt-4 text-white/50">
            That under.bio link does not exist - or the profile is unpublished.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="btn btn-primary">
              Home
            </Link>
            <Link href="/login" className="btn btn-ghost">
              Claim your page
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

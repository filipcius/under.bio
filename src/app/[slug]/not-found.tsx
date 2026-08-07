import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#050505] px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.07),transparent_42%)]" />
      <div className="relative max-w-md text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/35">under.bio</p>
        <h1 className="section-title mt-3 text-4xl sm:text-5xl">User not found</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/50">
          Nobody owns this slug yet - or they took the page private. Check the spelling, or claim
          your own link.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            under.bio home
          </Link>
          <Link href="/login" className="btn btn-ghost">
            Create mine
          </Link>
        </div>
      </div>
    </main>
  );
}

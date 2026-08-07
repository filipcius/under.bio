export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4 h-10 w-28 animate-pulse rounded-xl bg-white/5" />
      <div className="glass-card space-y-4 p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-white/10" />
          <div className="h-9 w-40 animate-pulse rounded-lg bg-white/10" />
        </div>
        <div className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    </div>
  );
}

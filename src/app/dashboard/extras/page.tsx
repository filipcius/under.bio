import { requireSession } from "@/lib/session";
import { getPageByProfileId, getProfileById } from "@/lib/data";
import { DashboardShell } from "@/components/DashboardShell";
import { ExtrasEditor } from "@/components/forms/ExtrasEditor";
import { redirect } from "next/navigation";
import Link from "next/link";

const items = [
  {
    href: "/dashboard/extras#links",
    title: "Links",
    description: "Create and manage your social links.",
  },
  {
    href: "/dashboard/extras#badges",
    title: "Badges",
    description: "Browse badges shown on your page.",
  },
  {
    href: "/dashboard/extras#tags",
    title: "Tags",
    description: "Create and manage your personal tags.",
  },
  {
    href: "/dashboard/miscellaneous",
    title: "Tracks",
    description: "Manage audio player settings in Miscellaneous.",
  },
];

export default async function ExtrasPage() {
  const session = await requireSession();
  const profile = await getProfileById(session.user.profileId);
  const page = await getPageByProfileId(session.user.profileId);
  if (!profile || !page) redirect("/dashboard");

  return (
    <DashboardShell title="Modules" avatarUrl={profile.avatar_url} slug={profile.slug}>
      <div className="mb-8 divide-y divide-white/5 rounded-xl border border-white/10">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex items-center justify-between px-4 py-4 transition hover:bg-white/[0.03]"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="help">{item.description}</p>
            </div>
            <span className="text-white/40">→</span>
          </Link>
        ))}
      </div>
      <ExtrasEditor initial={page.config} />
    </DashboardShell>
  );
}

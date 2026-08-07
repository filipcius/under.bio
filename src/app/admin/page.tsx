import {
  getAdminAudit,
  getAdminStats,
  getTopViewedProfiles,
  listAdminUsers,
} from "@/lib/admin-data";
import { adminListThemeTemplates } from "@/app/actions/admin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminTemplatesPanel } from "@/components/admin/AdminTemplatesPanel";

export const metadata = { title: "Admin · under.bio" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const [stats, users, top, audit, templates] = await Promise.all([
    getAdminStats(),
    listAdminUsers(sp.q),
    getTopViewedProfiles(8),
    getAdminAudit(50),
    adminListThemeTemplates("all").catch(() => []),
  ]);

  return (
    <>
      <AdminDashboard
        stats={stats}
        users={users}
        top={top}
        audit={audit}
        initialQuery={sp.q || ""}
      />
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <AdminTemplatesPanel templates={templates} />
      </div>
    </>
  );
}

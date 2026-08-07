import {
  getAdminAudit,
  getAdminStats,
  getTopViewedProfiles,
  listAdminUsers,
} from "@/lib/admin-data";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata = { title: "Admin · under.bio" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const [stats, users, top, audit] = await Promise.all([
    getAdminStats(),
    listAdminUsers(sp.q),
    getTopViewedProfiles(8),
    getAdminAudit(50),
  ]);

  return (
    <AdminDashboard
      stats={stats}
      users={users}
      top={top}
      audit={audit}
      initialQuery={sp.q || ""}
    />
  );
}

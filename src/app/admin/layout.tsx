import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin · under.bio",
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <>
      <Navbar
        user={{
          name: session.user.name,
          image: session.user.image,
          slug: session.user.slug,
        }}
        isAdmin
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

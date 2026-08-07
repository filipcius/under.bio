import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { requireSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <>
      <Navbar
        user={{
          name: session.user.name,
          image: session.user.image,
          slug: session.user.slug,
        }}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

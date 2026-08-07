import { auth } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeLanding } from "@/components/HomeLanding";
import { redirect } from "next/navigation";

export default async function HomePage() {
  let user = null;
  try {
    const session = await auth();
    user = session?.user ?? null;
    if (user?.profileId) redirect("/dashboard");
  } catch {
    user = null;
  }

  return (
    <>
      <Navbar user={user} />
      <HomeLanding />
      <Footer />
    </>
  );
}

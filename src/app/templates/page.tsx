import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TemplatesBrowser } from "@/components/TemplatesBrowser";
import { listThemeTemplates } from "@/app/actions/templates";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Templates · under.bio",
  description: "Community theme marketplace for under.bio profiles.",
};

export default async function PublicTemplatesPage() {
  const [themes, session] = await Promise.all([
    listThemeTemplates({ sort: "popular", limit: 60 }),
    auth().catch(() => null),
  ]);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        <h1 className="section-title text-4xl">Templates</h1>
        <p className="help mt-2 max-w-xl">
          Clean community looks for your under.bio page. Preview, apply, make it yours.
        </p>
        <div className="mt-10">
          <TemplatesBrowser
            mode="public"
            themes={themes}
            signedIn={Boolean(session?.user?.profileId)}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

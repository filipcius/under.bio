import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-12">
        <h1 className="section-title text-4xl">Terms</h1>
        <p className="help mt-4 leading-7">
          under.bio provides one public profile page per Discord account. Do not abuse the service,
          impersonate others, or host illegal content. We may remove pages that break these rules.
          Discord login and server membership are required.
        </p>
      </main>
      <Footer />
    </>
  );
}

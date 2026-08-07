import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-12">
        <h1 className="section-title text-4xl">Privacy</h1>
        <p className="help mt-4 leading-7">
          We store your Discord ID, username, avatar URL, email (if Discord shares it), and the
          profile configuration you save. View counts are stored for analytics. We do not sell your
          data. Sign out anytime from Account.
        </p>
      </main>
      <Footer />
    </>
  );
}

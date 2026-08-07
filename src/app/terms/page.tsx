import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DISCORD_INVITE_URL } from "@/lib/site";

export const metadata = { title: "Terms · under.bio" };

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-12">
        <h1 className="section-title text-4xl">Terms of Service</h1>
        <p className="help mt-2">Last updated: August 7, 2026 · under.bio</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-white/70">
          <section>
            <h2 className="section-title text-xl text-white">1. The service</h2>
            <p className="mt-2">
              under.bio provides customizable public profile pages linked to Discord accounts. By
              using the service you agree to these Terms. If you do not agree, do not use under.bio.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">2. Accounts & access</h2>
            <p className="mt-2">
              Access requires Discord OAuth and membership in our required Discord server. One
              account receives one profile page and one unique slug. You are responsible for
              activity under your account. We may suspend or remove accounts that violate these
              Terms or Discord&apos;s rules.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">3. Acceptable use</h2>
            <p className="mt-2">You must not:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Impersonate others or misrepresent affiliation</li>
              <li>Host illegal, abusive, or infringing content</li>
              <li>Abuse views, APIs, or infrastructure</li>
              <li>Attempt to bypass paid feature locks or payment systems</li>
              <li>Upload malware or attempt unauthorized access</li>
            </ul>
            <p className="mt-2">
              We may remove content or pages that break these rules without notice.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">4. under VOID (paid plan)</h2>
            <p className="mt-2">
              Optional paid plan (&quot;VOID&quot;) unlocks additional styling and module limits for
              a one-time lifetime fee displayed at checkout (currently USD $4.99 unless otherwise
              stated). You may also purchase VOID as a gift for another under.bio account. Payments
              are processed by Stripe. Lifetime purchases are generally non-refundable except where
              required by law. Timed complimentary unlocks (e.g. invite rewards) may expire and are
              separate from lifetime purchases. Feature availability may change over time.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">5. Content ownership</h2>
            <p className="mt-2">
              You retain rights to content you upload. You grant under.bio a limited license to host
              and display that content for operating the service. Do not upload content you do not
              have rights to use.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">6. Availability</h2>
            <p className="mt-2">
              We aim for high availability but do not guarantee uninterrupted service. Features may
              change. We may discontinue free or paid features with reasonable notice when practical.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">7. Disclaimer & liability</h2>
            <p className="mt-2">
              The service is provided &quot;as is&quot; without warranties of any kind to the
              fullest extent permitted by law. To the maximum extent permitted, under.bio and its
              operators are not liable for indirect, incidental, or consequential damages, or loss
              of data, profits, or goodwill arising from use of the service.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">8. Third parties</h2>
            <p className="mt-2">
              Login uses Discord. Payments use Stripe. Hosting may use Vercel and Supabase. Their
              terms and privacy policies also apply to their processing.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">9. Changes</h2>
            <p className="mt-2">
              We may update these Terms. Continued use after changes means you accept the updated
              Terms. Material billing changes will be reflected on the VOID / checkout pages.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">10. Contact</h2>
            <p className="mt-2">
              Questions about these Terms: contact us via the{" "}
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-[#5865F2] hover:underline"
              >
                under.bio Discord
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

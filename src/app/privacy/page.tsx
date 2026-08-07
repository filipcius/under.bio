import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DISCORD_INVITE_URL } from "@/lib/site";

export const metadata = { title: "Privacy · under.bio" };

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-12">
        <h1 className="section-title text-4xl">Privacy Policy</h1>
        <p className="help mt-2">Last updated: August 7, 2026 · under.bio</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-white/70">
          <section>
            <h2 className="section-title text-xl text-white">1. Who we are</h2>
            <p className="mt-2">
              under.bio (&quot;we&quot;, &quot;us&quot;) operates profile pages at under.bio. This
              Policy explains what we collect and how we use it.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">2. Data we collect</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-white/85">Discord account data</strong> via OAuth: Discord
                ID, username, global name, avatar, banner (if available), email (if Discord shares
                it), locale, and related profile flags needed to run login.
              </li>
              <li>
                <strong className="text-white/85">Profile configuration</strong> you save (bio,
                links, tags, badges, media URLs, style JSON).
              </li>
              <li>
                <strong className="text-white/85">Usage data</strong> such as page view counts and
                basic request logs for security and reliability.
              </li>
              <li>
                <strong className="text-white/85">Billing data</strong> for VOID subscriptions:
                Stripe customer/subscription IDs and plan status. Card details are handled by Stripe
                - we do not store full card numbers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">3. How we use data</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Authenticate you and verify Discord server membership</li>
              <li>Host and display your public profile</li>
              <li>Provide analytics (views / rank) you enable</li>
              <li>Process VOID subscriptions and prevent abuse</li>
              <li>Maintain security and improve the product</li>
            </ul>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">4. Sharing</h2>
            <p className="mt-2">
              We do not sell your personal data. We share data with processors needed to run the
              service: Discord (auth), Stripe (payments), Supabase (database/storage), and Vercel
              (hosting). Public profile fields you publish are visible to anyone with the link.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">5. Cookies</h2>
            <p className="mt-2">
              We use essential cookies/session storage for authentication (Auth.js) and limited
              anti-abuse view tracking. We do not run third-party ad trackers on the core product.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">6. Retention</h2>
            <p className="mt-2">
              We keep account and profile data while your account exists. You may request deletion
              via Discord support channels; we will delete or anonymize data unless we must retain
              it for legal, security, or billing records.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">7. Your choices</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Edit or unpublish profile content in the dashboard</li>
              <li>Sign out from Account</li>
              <li>Cancel VOID via the Stripe portal in Account</li>
              <li>Request account deletion via community support</li>
            </ul>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">8. International processing</h2>
            <p className="mt-2">
              Infrastructure may process data in the EU, US, or other regions where our providers
              operate. By using under.bio you understand this transfer.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">9. Children</h2>
            <p className="mt-2">
              under.bio is not directed at children under 13 (or the minimum age required in your
              country / by Discord). Do not use the service if you do not meet Discord&apos;s age
              requirements.
            </p>
          </section>

          <section>
            <h2 className="section-title text-xl text-white">10. Changes & contact</h2>
            <p className="mt-2">
              We may update this Policy and will revise the date above. Contact us through the{" "}
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-[#5865F2] hover:underline"
              >
                under.bio Discord
              </a>{" "}
              for privacy questions.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

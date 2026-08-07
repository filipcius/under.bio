import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DISCORD_INVITE_URL } from "@/lib/site";

const faqs = [
  {
    q: "Who can sign in?",
    a: "Anyone in the under.bio Discord server, using Discord OAuth.",
  },
  {
    q: "Where do I join the Discord?",
    a: DISCORD_INVITE_URL,
  },
  {
    q: "Can I have multiple pages?",
    a: "No. Each account gets exactly one page and one unique URL ending.",
  },
  {
    q: "How do I change under.bio/myname?",
    a: "Open Dashboard → Profile → URL ending, then Update URL. It must be free.",
  },
  {
    q: "What is the JSON template?",
    a: "A full schema of every profile option. Feed it to an AI, import the result, and under.bio validates it before saving.",
  },
];

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-12">
        <h1 className="section-title text-4xl">FAQ</h1>
        <div className="mt-8 space-y-5">
          {faqs.map((item) => (
            <div key={item.q} className="glass-card p-5">
              <h2 className="font-semibold">{item.q}</h2>
              {item.a.startsWith("http") ? (
                <a
                  href={item.a}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-[#5865F2] hover:underline"
                >
                  {item.a}
                </a>
              ) : (
                <p className="help mt-2">{item.a}</p>
              )}
            </div>
          ))}
        </div>
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noreferrer"
          className="btn btn-discord mt-8"
        >
          Join Discord
        </a>
      </main>
      <Footer />
    </>
  );
}

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const faqs = [
  {
    q: "Who can sign in?",
    a: "Anyone in the required Discord server, using Discord OAuth.",
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
              <p className="help mt-2">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

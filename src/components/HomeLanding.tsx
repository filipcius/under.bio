"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@/components/Icon";
import { DISCORD_INVITE_URL } from "@/lib/site";

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.55, ease: easeOut },
  }),
};

const steps = [
  {
    n: "01",
    title: "Join & sign in",
    text: "Be in the Discord server, then continue with Discord OAuth. No passwords.",
  },
  {
    n: "02",
    title: "Claim your ending",
    text: "One account, one page. Pick under.bio/you - unique, changeable later.",
  },
  {
    n: "03",
    title: "Shape the page",
    text: "Tune layout, colors, links, and motion. Or import an AI-made JSON template.",
  },
];

const points = [
  {
    icon: "discord" as const,
    title: "Discord-native",
    text: "Avatar, username, and profile stats sync every login. Server membership is required.",
  },
  {
    icon: "link" as const,
    title: "Unique URL",
    text: "Your slug is locked to your account. No duplicates. No second page.",
  },
  {
    icon: "sparkles" as const,
    title: "AI JSON ready",
    text: "Export the full schema, let AI fill it, import back - validated before save.",
  },
  {
    icon: "eye" as const,
    title: "Clean analytics",
    text: "See total views and a simple weekly chart on your dashboard.",
  },
];

export function HomeLanding() {
  const reduce = useReducedMotion();

  return (
    <main className="relative flex-1 overflow-hidden">
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-24 top-10 h-[420px] w-[420px] rounded-full bg-white/[0.04] blur-3xl"
          animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-80px] top-40 h-[380px] w-[380px] rounded-full bg-white/[0.03] blur-3xl"
          animate={reduce ? undefined : { x: [0, -30, 0], y: [0, -25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="home-grid absolute inset-0 opacity-[0.35]" />
      </div>

      {/* HERO — one composition */}
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-4 py-16">
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="section-title mb-5 text-4xl tracking-tight text-white sm:text-5xl"
        >
          under<span className="text-white/35">.</span>bio
        </motion.p>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="max-w-3xl font-[family-name:var(--font-syne)] text-5xl font-800 leading-[0.95] tracking-[-0.04em] sm:text-7xl"
          style={{ fontWeight: 800 }}
        >
          A page that feels
          <br />
          expensive -
          <motion.span
            className="mt-1 block text-white/40"
            animate={reduce ? undefined : { opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            without the noise.
          </motion.span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-md text-lg leading-relaxed text-white/55"
        >
          Discord login. One unique link. A clear editor. Built for people who want swag-clean
          profiles - not another cluttered bio site.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Link href="/login" className="btn btn-primary">
            <Icon name="discord" className="text-sm" glow={false} />
            Continue with Discord
          </Link>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost"
          >
            <Icon name="external" className="text-xs" />
            Join Discord
          </a>
        </motion.div>
        <motion.p
          custom={3.5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-3 text-sm text-white/35"
        >
          Server membership is required before you can sign in.
        </motion.p>

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-14 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/35"
        >
          <span>Server-gated</span>
          <span className="text-white/15">/</span>
          <span>1 page per account</span>
          <span className="text-white/15">/</span>
          <span>VOID style unlock</span>
        </motion.div>
      </section>

      {/* HOW */}
      <section id="how" className="relative border-t border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">How it works</p>
            <h2 className="section-title mt-3 text-3xl sm:text-4xl">Three steps. Then publish.</h2>
          </motion.div>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: easeOut }}
                className="relative"
              >
                <p className="section-title text-5xl text-white/10">{step.n}</p>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="help mt-2 max-w-xs">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PREVIEW STRIP */}
      <section className="relative border-t border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <p className="text-xs uppercase tracking-[0.28em] text-white/35">Your link</p>
              <h2 className="section-title mt-3 text-3xl sm:text-4xl">
                under.bio/<span className="text-white/40">you</span>
              </h2>
              <p className="help mt-4 max-w-md text-base">
                Change the ending anytime if it is free. Reserved words are blocked. Visitors see
                your Discord avatar, bio, links, and the look you configured.
              </p>
              <Link href="/login" className="btn btn-primary mt-7">
                Claim your ending
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-[28px] bg-white/[0.03] blur-xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl">
                <div className="mb-5 flex items-center gap-2 text-xs text-white/35">
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  under.bio/preview
                </div>
                <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur">
                  <motion.div
                    className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-b from-white/25 to-white/5 ring-2 ring-white/15"
                    animate={reduce ? undefined : { boxShadow: ["0 0 0 rgba(255,255,255,0)", "0 0 28px rgba(255,255,255,0.25)", "0 0 0 rgba(255,255,255,0)"] }}
                    transition={{ duration: 3.2, repeat: Infinity }}
                  />
                  <p className="section-title text-2xl">yourname</p>
                  <p className="mt-2 text-sm text-white/45">Short bio. Clean links. Soft motion.</p>
                  <div className="mt-5 space-y-2">
                    {["Discord", "Portfolio", "Music"].map((label, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 + i * 0.08 }}
                        className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/70"
                      >
                        {label}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* POINTS */}
      <section className="relative border-t border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">Why under.bio</p>
            <h2 className="section-title mt-3 text-3xl sm:text-4xl">Clear controls. No premium maze.</h2>
          </motion.div>

          <div className="mt-12 divide-y divide-white/5 border-y border-white/5">
            {points.map((point, i) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                className="grid gap-3 py-6 sm:grid-cols-[40px_1fr] sm:items-start"
              >
                <Icon name={point.icon} className="mt-1 text-lg" />
                <div>
                  <h3 className="text-lg font-semibold">{point.title}</h3>
                  <p className="help mt-1 max-w-2xl">{point.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* JSON CTA */}
      <section className="relative border-t border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="flex flex-col items-start justify-between gap-8 rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent px-6 py-10 sm:flex-row sm:items-center sm:px-10"
          >
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.28em] text-white/35">For builders</p>
              <h2 className="section-title mt-3 text-3xl">Design with AI. Import with confidence.</h2>
              <p className="help mt-3 text-base">
                Download the official JSON template, ask an AI to fill every option, then paste it
                into Dashboard → Profile. Invalid schemas are rejected.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/templates/underbio-profile.template.json" className="btn btn-primary">
                <Icon name="download" className="text-xs" />
                Get template
              </a>
              <Link href="/login" className="btn btn-ghost">
                Open dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative border-t border-white/5 py-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title text-4xl sm:text-5xl"
          >
            Ready when you are.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mx-auto mt-4 max-w-md text-white/50"
          >
            Join the server, sign in, claim your ending. Your Discord look comes with you.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="btn btn-discord px-8"
            >
              <Icon name="discord" className="text-sm" glow={false} />
              Join Discord
            </a>
            <Link href="/login" className="btn btn-primary px-8">
              Sign in
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

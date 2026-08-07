"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BlackCheckoutButton, GiftVoidButton } from "@/components/BlackCheckoutButton";
import { BlackDiamond } from "@/components/BlackDiamond";
import {
  BLACK_FEATURES,
  BLACK_NAME,
  BLACK_PRICE_LINE,
  BLACK_PRICE_USD,
  BLACK_TAGLINE,
} from "@/lib/plan";
import { DISCORD_INVITE_URL } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

const freePerks = [
  "1 profile · unique slug",
  "Basic colors, fonts, banner",
  "Shine / flash name",
  "Standard 3D tilt",
  "6 socials · 6 badges · 3 tags",
  "Views + rank",
  "Basic music player",
];

export function VoidShop({
  signedIn,
  isVoid,
  isLifetime,
  canceled,
}: {
  signedIn: boolean;
  isVoid: boolean;
  isLifetime?: boolean;
  canceled?: boolean;
}) {
  const reduce = useReducedMotion();
  const ownedForever = Boolean(isLifetime);

  const fade = (i: number) =>
    reduce
      ? undefined
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.06 * i, duration: 0.5, ease },
        };

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-10 sm:py-16">
      {canceled && (
        <motion.p
          {...fade(0)}
          className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70"
        >
          Checkout canceled. Your free page is still live - {BLACK_NAME} is ready when you are.
        </motion.p>
      )}

      <div className="mx-auto max-w-2xl text-center">
        <motion.p
          {...fade(0)}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/60 sm:text-xs"
        >
          <BlackDiamond /> under {BLACK_NAME}
        </motion.p>
        <motion.h1
          {...fade(1)}
          className="section-title mt-5 text-4xl leading-[0.95] sm:text-7xl"
        >
          Look unfair.
        </motion.h1>
        <motion.p
          {...fade(2)}
          className="mx-auto mt-4 max-w-lg text-sm text-white/55 sm:text-lg"
        >
          {BLACK_TAGLINE} Full style lab, custom cursors, particles, Discord cards, and room for
          every social.
        </motion.p>
        <motion.p {...fade(3)} className="mt-6 section-title text-3xl sm:text-5xl">
          ${BLACK_PRICE_USD}
          <span className="text-base font-normal text-white/40 sm:text-lg"> lifetime</span>
        </motion.p>
        <motion.p {...fade(4)} className="mt-2 text-sm text-white/40">
          One-time payment · yours forever · Stripe secure
        </motion.p>

        <motion.div {...fade(5)} className="mx-auto mt-8 max-w-sm">
          {ownedForever ? (
            <div className="space-y-3">
              <Link href="/dashboard/account" className="btn btn-primary w-full text-base">
                <BlackDiamond /> You have {BLACK_NAME} — manage
              </Link>
              <GiftVoidButton signedIn={signedIn} />
            </div>
          ) : (
            <BlackCheckoutButton
              signedIn={signedIn}
              label={
                isVoid
                  ? `Upgrade to lifetime · ${BLACK_PRICE_LINE}`
                  : `Get ${BLACK_NAME} · ${BLACK_PRICE_LINE}`
              }
            />
          )}
        </motion.div>
        <motion.p {...fade(5.5)} className="mx-auto mt-4 max-w-md text-sm text-white/40">
          Or earn free {BLACK_NAME}: invite 10 friends who sign up → 14 days unlocked.{" "}
          {signedIn ? (
            <Link
              href="/dashboard/invites"
              className="text-sky-200/80 underline-offset-2 hover:text-sky-100 hover:underline"
            >
              Open invites
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sky-200/80 underline-offset-2 hover:text-sky-100 hover:underline"
            >
              Sign in to start
            </Link>
          )}
        </motion.p>
      </div>

      {/* Equal-height plan cards — buttons pinned to bottom */}
      <motion.div
        {...fade(6)}
        className="mt-12 grid items-stretch gap-4 sm:mt-16 md:grid-cols-2"
      >
        <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
          <h2 className="section-title text-2xl">Free</h2>
          <p className="mt-1 text-sm text-white/45">Ship a clean page today</p>
          <ul className="mt-5 flex-1 space-y-3 text-sm text-white/70">
            {freePerks.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <Link
            href={signedIn ? "/dashboard" : "/login"}
            className="btn btn-ghost mt-6 w-full"
          >
            {signedIn ? "Open dashboard" : "Start free"}
          </Link>
        </div>

        <div className="relative flex h-full flex-col rounded-2xl border border-sky-300/30 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 shadow-[0_0_60px_rgba(125,211,252,0.08)] sm:p-6">
          <div className="absolute -top-3 right-3 rounded-full border border-sky-300/30 bg-black px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-sky-200 sm:right-4">
            most popular
          </div>
          <h2 className="section-title flex items-center gap-2 text-2xl">
            <BlackDiamond /> {BLACK_NAME}
          </h2>
          <p className="mt-1 text-sm text-white/55">
            {BLACK_PRICE_LINE} · everything unlocked
          </p>
          <ul className="mt-5 flex-1 space-y-3 text-sm text-white/80">
            {BLACK_FEATURES.map((f) => (
              <li key={f.id} className="flex gap-2">
                <BlackDiamond className="mt-0.5 shrink-0" />
                <span>
                  <strong className="text-white">{f.label}</strong>
                  <span className="text-white/50"> - {f.black}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {ownedForever ? (
              <div className="space-y-2">
                <Link href="/dashboard/miscellaneous" className="btn btn-primary w-full">
                  Open Style lab
                </Link>
                <GiftVoidButton signedIn={signedIn} className="btn btn-ghost w-full" />
              </div>
            ) : (
              <BlackCheckoutButton
                signedIn={signedIn}
                label={
                  isVoid
                    ? `Upgrade to lifetime · ${BLACK_PRICE_LINE}`
                    : `Get ${BLACK_NAME} now`
                }
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Desktop comparison table */}
      <motion.div
        {...fade(7)}
        className="mt-10 hidden overflow-hidden rounded-2xl border border-white/10 sm:mt-14 sm:block"
      >
        <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.16em] text-white/40 sm:text-sm">
          <span>Feature</span>
          <span>Free</span>
          <span className="flex items-center gap-1">
            <BlackDiamond /> {BLACK_NAME}
          </span>
        </div>
        {BLACK_FEATURES.map((f) => (
          <div
            key={f.id}
            className="grid grid-cols-3 gap-2 border-b border-white/5 px-4 py-3 text-sm last:border-0"
          >
            <span className="font-medium text-white/85">{f.label}</span>
            <span className="text-white/45">{f.free}</span>
            <span className="text-sky-100/90">{f.black}</span>
          </div>
        ))}
      </motion.div>

      {/* Mobile comparison — stacked, no cramped 3-col */}
      <motion.div {...fade(7)} className="mt-10 space-y-3 sm:hidden">
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">Compare</p>
        {BLACK_FEATURES.map((f) => (
          <div
            key={f.id}
            className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
          >
            <p className="font-medium text-white/90">{f.label}</p>
            <p className="mt-1 text-xs text-white/40">Free · {f.free}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-sky-100/90">
              <BlackDiamond /> {BLACK_NAME} · {f.black}
            </p>
          </div>
        ))}
      </motion.div>

      <motion.div {...fade(8)} className="mx-auto mt-12 max-w-xl text-center sm:mt-14">
        <h2 className="section-title text-2xl sm:text-3xl">Ready in under a minute</h2>
        <p className="mt-3 text-sm text-white/50">
          Discord login → unlock {BLACK_NAME} once → Style lab opens forever. Or gift it to a
          friend. Timed invite rewards still available from Invites.
        </p>
        <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2">
          {!ownedForever && (
            <BlackCheckoutButton
              signedIn={signedIn}
              label={`Get ${BLACK_NAME} · ${BLACK_PRICE_LINE}`}
            />
          )}
          {ownedForever && <GiftVoidButton signedIn={signedIn} />}
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost w-full justify-center text-sm"
          >
            Join Discord
          </a>
        </div>
      </motion.div>
    </div>
  );
}

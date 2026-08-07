"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { TEMPLATE_FILES } from "@/lib/ai-template-guide";
import { cn } from "@/lib/utils";

type Tier = "void" | "free";

export function TemplatePicker({
  onLoadJson,
  onMessage,
}: {
  onLoadJson: (text: string) => void;
  onMessage: (msg: string) => void;
}) {
  const [tier, setTier] = useState<Tier>("void");
  const [busy, setBusy] = useState(false);
  const meta = TEMPLATE_FILES[tier];

  async function fetchText(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Fetch failed");
    return res.text();
  }

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
      onMessage(label);
    } catch {
      onMessage("Could not load template.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <div className="mb-1 flex items-center gap-2">
        <Icon name="info" className="text-sm" />
        <p className="font-medium">AI JSON templates</p>
      </div>
      <p className="help mb-4">
        Pick a plan template, copy the AI prompt (includes every allowed option), paste into ChatGPT
        / Claude, then import the JSON it returns.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(TEMPLATE_FILES) as Tier[]).map((key) => {
          const item = TEMPLATE_FILES[key];
          const active = tier === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTier(key)}
              className={cn(
                "rounded-xl border px-4 py-3.5 text-left transition",
                active
                  ? key === "void"
                    ? "border-sky-300/40 bg-sky-400/[0.08]"
                    : "border-white/25 bg-white/[0.06]"
                  : "border-white/10 bg-transparent hover:bg-white/[0.03]",
              )}
            >
              <p className="flex items-center gap-2 text-sm font-semibold">
                {key === "void" && <span className="text-sky-200/90">◆</span>}
                {item.label}
                {active && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-white/40">
                    selected
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/45">{item.blurb}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          className="btn btn-primary text-sm"
          onClick={() =>
            run(`AI prompt (${meta.label}) copied — paste into your AI.`, async () => {
              const text = await fetchText(meta.guide);
              await navigator.clipboard.writeText(text);
            })
          }
        >
          <Icon name="copy" className="text-xs" />
          Copy AI prompt
        </button>
        <button
          type="button"
          disabled={busy}
          className="btn btn-ghost text-sm"
          onClick={() =>
            run(`${meta.label} template copied.`, async () => {
              const text = await fetchText(meta.template);
              await navigator.clipboard.writeText(text);
            })
          }
        >
          <Icon name="copy" className="text-xs" />
          Copy JSON template
        </button>
        <button
          type="button"
          disabled={busy}
          className="btn btn-ghost text-sm"
          onClick={() =>
            run(`${meta.label} example loaded into the box below.`, async () => {
              const text = await fetchText(meta.example);
              onLoadJson(text);
            })
          }
        >
          <Icon name="sparkles" className="text-xs" />
          Load example
        </button>
        <a href={meta.template} download className="btn btn-ghost text-sm">
          <Icon name="download" className="text-xs" />
          Download
        </a>
        <a
          href={meta.guide}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost text-sm"
        >
          Open AI guide
        </a>
      </div>
    </div>
  );
}

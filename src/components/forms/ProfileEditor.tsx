"use client";

import { useMemo, useState, useTransition } from "react";
import type { ProfileTemplate } from "@/lib/profile-template";
import {
  importProfileJson,
  resetProfileConfig,
  saveProfileConfig,
  updateSlug,
} from "@/app/actions/profile";
import { SaveBar } from "@/components/forms/SaveBar";
import { Icon } from "@/components/Icon";

export function ProfileEditor({
  initial,
  slug,
}: {
  initial: ProfileTemplate;
  slug: string;
}) {
  const [config, setConfig] = useState(initial);
  const [slugValue, setSlugValue] = useState(slug);
  const [jsonText, setJsonText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const charBio = config.meta.description.length;
  const charName = config.meta.displayName.length;

  const exportJson = useMemo(
    () => JSON.stringify({ ...config, meta: { ...config.meta, slug: slugValue } }, null, 2),
    [config, slugValue],
  );

  function run(action: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    startTransition(async () => {
      const res = await action();
      setMessage(res.ok ? res.message || "Done." : res.error || "Something went wrong.");
    });
  }

  return (
    <div className="space-y-6">
      <p className="help">
        Configure how your public page looks. Your Discord avatar syncs on login. You can only own{" "}
        <strong className="text-white/80">one</strong> page - change the URL ending below if you
        want a new link.
      </p>

      <div>
        <div className="label">
          <span>Display name</span>
          <span className="help">{charName}/32</span>
        </div>
        <input
          className="soft-input"
          value={config.meta.displayName}
          maxLength={32}
          onChange={(e) =>
            setConfig((c) => ({
              ...c,
              meta: { ...c.meta, displayName: e.target.value },
            }))
          }
        />
      </div>

      <div>
        <div className="label">
          <span>URL ending (slug)</span>
          <span className="help">unique · one page per account</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <span className="border-r border-white/10 px-3 text-sm text-white/40">
              under.bio/
            </span>
            <input
              className="w-full bg-transparent px-3 py-3 outline-none"
              value={slugValue}
              onChange={(e) => setSlugValue(e.target.value.toLowerCase())}
            />
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => run(() => updateSlug(slugValue))}
            disabled={pending}
          >
            Update URL
          </button>
        </div>
      </div>

      <div>
        <div className="label">
          <span>Bio</span>
          <span className="help">{charBio}/2000</span>
        </div>
        <textarea
          className="soft-input min-h-36 resize-y"
          value={config.meta.description}
          maxLength={2000}
          onChange={(e) =>
            setConfig((c) => ({
              ...c,
              meta: { ...c.meta, description: e.target.value },
            }))
          }
          placeholder="Who are you? Keep it clean and clear."
        />
      </div>

      <div>
        <div className="label">
          <span>Location</span>
        </div>
        <input
          className="soft-input"
          value={config.meta.location}
          maxLength={80}
          onChange={(e) =>
            setConfig((c) => ({
              ...c,
              meta: { ...c.meta, location: e.target.value },
            }))
          }
          placeholder="Optional"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="info" className="text-sm" />
          <p className="font-medium">AI JSON template</p>
        </div>
        <p className="help mb-3">
          Export your config, paste it into an AI with the official template, then import the
          result. The JSON must match the under.bio schema.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary text-sm"
            onClick={async () => {
              const res = await fetch("/templates/example-profile.json");
              const text = await res.text();
              setJsonText(text);
              setMessage("Example JSON loaded - click Import & apply.");
            }}
          >
            <Icon name="sparkles" className="text-xs" />
            Load example JSON
          </button>
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={() => {
              navigator.clipboard.writeText(exportJson);
              setMessage("JSON copied.");
            }}
          >
            <Icon name="copy" className="text-xs" />
            Copy my JSON
          </button>
          <a href="/templates/example-profile.json" className="btn btn-ghost text-sm" target="_blank">
            <Icon name="download" className="text-xs" />
            Open example
          </a>
          <a href="/templates/underbio-profile.template.json" className="btn btn-ghost text-sm">
            <Icon name="download" className="text-xs" />
            Empty template
          </a>
        </div>
        <textarea
          className="soft-input mt-3 min-h-40 font-mono text-xs"
          placeholder="Paste example or AI-generated JSON here…"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary mt-3 text-sm"
          onClick={() => run(() => importProfileJson(jsonText))}
          disabled={pending || !jsonText.trim()}
        >
          <Icon name="upload" className="text-xs" />
          Import & apply JSON
        </button>
      </div>

      <SaveBar
        saving={pending}
        message={message}
        onSave={() => run(() => saveProfileConfig(config))}
        onReset={() => run(() => resetProfileConfig())}
      />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminDeleteUser,
  adminResetConfig,
  adminSaveConfig,
  adminSetPlan,
  adminSetPublished,
  adminSetViews,
  adminUpdateSlug,
} from "@/app/actions/admin";
import { BlackDiamond } from "@/components/BlackDiamond";

export function AdminQuickActions({
  profileId,
  published,
  isBlack,
}: {
  profileId: string;
  published: boolean;
  isBlack: boolean;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  function run(fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) {
    start(async () => {
      const res = await fn();
      setMsg(res.ok ? res.message || "Done." : res.error || "Failed.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="btn btn-ghost text-xs"
        disabled={pending}
        onClick={() => run(() => adminSetPublished(profileId, !published))}
      >
        {published ? "Unpublish" : "Publish"}
      </button>
      <button
        type="button"
        className="btn btn-ghost text-xs"
        disabled={pending}
        onClick={() =>
          run(() =>
            isBlack
              ? adminSetPlan(profileId, "free")
              : adminSetPlan(profileId, "black", 30),
          )
        }
      >
        <BlackDiamond />
        {isBlack ? "Revoke VOID" : "VOID · 1 mo"}
      </button>
      {isBlack && (
        <button
          type="button"
          className="btn btn-ghost text-xs"
          disabled={pending}
          onClick={() => run(() => adminSetPlan(profileId, "black", 30))}
          title="Extend VOID by another month"
        >
          +1 mo
        </button>
      )}
      {msg && <span className="text-xs text-white/45">{msg}</span>}
    </div>
  );
}

export function AdminUserDetailForm({
  profileId,
  slug,
  published,
  isBlack,
  totalViews,
  configJson,
}: {
  profileId: string;
  slug: string;
  published: boolean;
  isBlack: boolean;
  totalViews: number;
  configJson: string;
}) {
  const [slugVal, setSlug] = useState(slug);
  const [views, setViews] = useState(String(totalViews));
  const [json, setJson] = useState(configJson);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function run(fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) {
    start(async () => {
      const res = await fn();
      setMsg(res.ok ? res.message || "Done." : res.error || "Failed.");
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {msg && (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70">
          {msg}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="label">
            <span>Slug</span>
          </div>
          <div className="flex gap-2">
            <input
              className="soft-input"
              value={slugVal}
              onChange={(e) => setSlug(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-ghost shrink-0"
              disabled={pending}
              onClick={() => run(() => adminUpdateSlug(profileId, slugVal))}
            >
              Save
            </button>
          </div>
        </div>
        <div>
          <div className="label">
            <span>Total views</span>
          </div>
          <div className="flex gap-2">
            <input
              className="soft-input"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              inputMode="numeric"
            />
            <button
              type="button"
              className="btn btn-ghost shrink-0"
              disabled={pending}
              onClick={() => run(() => adminSetViews(profileId, Number(views)))}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={pending}
          onClick={() => run(() => adminSetPublished(profileId, !published))}
        >
          {published ? "Unpublish page" : "Publish page"}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={pending}
          onClick={() =>
            run(() =>
              isBlack
                ? adminSetPlan(profileId, "free")
                : adminSetPlan(profileId, "black", 30),
            )
          }
        >
          <BlackDiamond />
          {isBlack ? "Revoke VOID" : "Grant VOID · 1 month"}
        </button>
        {isBlack && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={pending}
            onClick={() => run(() => adminSetPlan(profileId, "black", 30))}
          >
            <BlackDiamond /> Extend +1 month
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          disabled={pending}
          onClick={() => run(() => adminResetConfig(profileId))}
        >
          Reset config
        </button>
        <button
          type="button"
          className="btn btn-danger"
          disabled={pending}
          onClick={() => {
            const typed = window.prompt(
              "This permanently deletes the user + page. Type DELETE to confirm.",
            );
            if (typed !== "DELETE") {
              setMsg("Delete canceled.");
              return;
            }
            run(async () => {
              const res = await adminDeleteUser(profileId, "DELETE");
              if (res.ok) router.push("/admin");
              return res;
            });
          }}
        >
          Delete user
        </button>
      </div>

      <div>
        <div className="label">
          <span>Page config JSON</span>
        </div>
        <textarea
          className="soft-input min-h-[320px] font-mono text-xs"
          value={json}
          onChange={(e) => setJson(e.target.value)}
          spellCheck={false}
        />
        <button
          type="button"
          className="btn btn-primary mt-3"
          disabled={pending}
          onClick={() => run(() => adminSaveConfig(profileId, json))}
        >
          Save config
        </button>
      </div>
    </div>
  );
}

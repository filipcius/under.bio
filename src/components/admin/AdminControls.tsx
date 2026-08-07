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
import { SoftSelect } from "@/components/forms/SoftSelect";

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
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        className="btn btn-ghost px-2 text-[11px]"
        disabled={pending}
        onClick={() => run(() => adminSetPublished(profileId, !published))}
      >
        {published ? "Hide" : "Publish"}
      </button>
      <button
        type="button"
        className="btn btn-ghost px-2 text-[11px]"
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
        {isBlack ? "Revoke" : "1 mo"}
      </button>
      {isBlack && (
        <button
          type="button"
          className="btn btn-ghost px-2 text-[11px]"
          disabled={pending}
          onClick={() => run(() => adminSetPlan(profileId, "black", 30))}
          title="Extend VOID by another month"
        >
          +1 mo
        </button>
      )}
      {msg && <span className="basis-full text-[10px] text-white/40">{msg}</span>}
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
  periodEnd,
  planStatus,
}: {
  profileId: string;
  slug: string;
  published: boolean;
  isBlack: boolean;
  totalViews: number;
  configJson: string;
  periodEnd?: string | null;
  planStatus?: string | null;
}) {
  const [slugVal, setSlug] = useState(slug);
  const [views, setViews] = useState(String(totalViews));
  const [json, setJson] = useState(configJson);
  const [grantDays, setGrantDays] = useState(30);
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
    <div className="space-y-8">
      {msg && (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70">
          {msg}
        </p>
      )}

      <section className="space-y-3">
        <h3 className="text-xs uppercase tracking-[0.18em] text-white/40">
          Identity
        </h3>
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
      </section>

      <section className="space-y-3">
        <h3 className="text-xs uppercase tracking-[0.18em] text-white/40">
          Plan · VOID
        </h3>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
          <p>
            Status:{" "}
            <span className="text-white/80">
              {isBlack ? "VOID active" : "Free"}
            </span>
            {planStatus ? (
              <span className="text-white/40"> · {planStatus}</span>
            ) : null}
          </p>
          <p className="mt-1 text-white/50">
            Period end:{" "}
            {periodEnd ? new Date(periodEnd).toLocaleString() : "—"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SoftSelect
            className="w-40"
            value={String(grantDays)}
            onChange={(v) => setGrantDays(Number(v))}
            options={[
              { value: "7", label: "7 days" },
              { value: "30", label: "30 days" },
              { value: "90", label: "90 days" },
              { value: "365", label: "365 days" },
            ]}
          />
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending}
            onClick={() => run(() => adminSetPlan(profileId, "black", grantDays))}
          >
            <BlackDiamond />
            {isBlack ? `Extend +${grantDays}d` : `Grant VOID · ${grantDays}d`}
          </button>
          {isBlack && (
            <button
              type="button"
              className="btn btn-ghost"
              disabled={pending}
              onClick={() => run(() => adminSetPlan(profileId, "free"))}
            >
              Revoke VOID
            </button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs uppercase tracking-[0.18em] text-white/40">
          Page
        </h3>
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
      </section>

      <section>
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
      </section>
    </div>
  );
}

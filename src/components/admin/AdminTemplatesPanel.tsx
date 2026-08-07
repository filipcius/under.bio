"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminModerateTemplate } from "@/app/actions/admin";
import type { ThemeTemplateListItem } from "@/app/actions/templates";
import { ThemeTemplateCard } from "@/components/ThemeTemplateCard";
import { SoftSelect } from "@/components/forms/SoftSelect";
import type { ThemeTemplateStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type Filter = ThemeTemplateStatus | "all";

export function AdminTemplatesPanel({
  templates,
}: {
  templates: ThemeTemplateListItem[];
}) {
  const [filter, setFilter] = useState<Filter>("pending");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const list = useMemo(() => {
    if (filter === "all") return templates;
    return templates.filter((t) => t.status === filter);
  }, [templates, filter]);

  function run(
    id: string,
    action: "approve" | "reject" | "hide" | "feature" | "unfeature" | "delete",
  ) {
    start(async () => {
      const res = await adminModerateTemplate(id, action);
      setMsg(res.ok ? res.message || "Done." : res.error || "Failed.");
      router.refresh();
    });
  }

  const filters: { id: Filter; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "hidden", label: "Hidden" },
    { id: "all", label: "All" },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title text-lg">Theme templates</h2>
          <p className="help mt-1">Moderate community style submissions.</p>
        </div>
        <SoftSelect
          className="w-40"
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          options={filters.map((f) => ({ value: f.id, label: f.label }))}
        />
      </div>

      {msg && (
        <p className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70">
          {msg}
        </p>
      )}

      {list.length === 0 ? (
        <p className="text-sm text-white/40">No themes in this filter.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((theme) => (
            <div key={theme.id} className="space-y-2">
              <ThemeTemplateCard theme={theme} showStatus />
              <div className="flex flex-wrap gap-1.5">
                {theme.status !== "approved" && (
                  <button
                    type="button"
                    className="btn btn-ghost px-2 text-[11px]"
                    disabled={pending}
                    onClick={() => run(theme.id, "approve")}
                  >
                    Approve
                  </button>
                )}
                {theme.status !== "rejected" && (
                  <button
                    type="button"
                    className="btn btn-ghost px-2 text-[11px]"
                    disabled={pending}
                    onClick={() => run(theme.id, "reject")}
                  >
                    Reject
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost px-2 text-[11px]"
                  disabled={pending}
                  onClick={() => run(theme.id, "hide")}
                >
                  Hide
                </button>
                <button
                  type="button"
                  className={cn(
                    "btn btn-ghost px-2 text-[11px]",
                    theme.featured && "text-sky-200",
                  )}
                  disabled={pending}
                  onClick={() =>
                    run(theme.id, theme.featured ? "unfeature" : "feature")
                  }
                >
                  {theme.featured ? "Unfeature" : "Feature"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost px-2 text-[11px] text-red-300"
                  disabled={pending}
                  onClick={() => {
                    if (!window.confirm(`Delete theme “${theme.name}”?`)) return;
                    run(theme.id, "delete");
                  }}
                >
                  Delete
                </button>
              </div>
              <p className="truncate text-[11px] text-white/35">
                by @{theme.author_slug || "unknown"} · {theme.uses_count} uses
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

export function SaveBar({
  onReset,
  onSave,
  saving,
  message,
}: {
  onReset?: () => void;
  onSave: () => void;
  saving?: boolean;
  message?: string | null;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-5">
      {onReset ? (
        <button type="button" className="btn btn-danger" onClick={onReset} disabled={saving}>
          Reset
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-3">
        {message && <span className="text-sm text-white/55">{message}</span>}
        <button type="button" className="btn btn-primary min-w-28" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

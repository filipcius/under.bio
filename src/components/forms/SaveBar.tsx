"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function SaveBar({
  onReset,
  onSave,
  saving,
  message,
  dirty,
}: {
  onReset?: () => void;
  onSave: () => void;
  saving?: boolean;
  message?: string | null;
  /** When provided, enables sticky dock + smarter Save label */
  dirty?: boolean;
}) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const trackDirty = typeof dirty === "boolean";
  const showDock = trackDirty && dirty;

  useEffect(() => setMounted(true), []);

  const dock =
    mounted &&
    createPortal(
      <AnimatePresence>
        {showDock && (
          <motion.div
            initial={reduce ? false : { y: 72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: 72, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-5"
          >
            <div className="pointer-events-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl border border-white/15 bg-[#111111]/95 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">Unsaved changes</p>
                <p className="truncate text-xs text-white/45">
                  {message || "Save to publish your edits"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {onReset && (
                  <button
                    type="button"
                    className="btn btn-ghost text-sm"
                    onClick={onReset}
                    disabled={saving}
                  >
                    Discard
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary text-sm"
                  onClick={onSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    );

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-5">
        {onReset ? (
          <button
            type="button"
            className="btn btn-danger"
            onClick={onReset}
            disabled={saving}
          >
            Reset
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          {message && !showDock && (
            <span className="text-sm text-white/55">{message}</span>
          )}
          <button
            type="button"
            className="btn btn-primary min-w-28"
            onClick={onSave}
            disabled={saving || (trackDirty && !dirty)}
          >
            {saving
              ? "Saving…"
              : trackDirty
                ? dirty
                  ? "Save changes"
                  : "Saved"
                : "Save"}
          </button>
        </div>
      </div>
      {dock}
    </>
  );
}

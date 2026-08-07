"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/Icon";
import { BlackDiamond } from "@/components/BlackDiamond";
import { cn } from "@/lib/utils";

export type SoftOption = { value: string; label: string; black?: boolean };

export function SoftSelect({
  value,
  onChange,
  options,
  className,
  onBlackLock,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SoftOption[];
  className?: string;
  onBlackLock?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const root = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const current = options.find((o) => o.value === value) || options[0];

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !root.current) return;
    const place = () => {
      const r = root.current!.getBoundingClientRect();
      setMenuPos({
        top: r.bottom + 6,
        left: r.left,
        width: r.width,
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (root.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  const menu =
    open && mounted
      ? createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            className="soft-select-menu soft-select-menu-portal"
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
              zIndex: 80,
            }}
          >
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    className={cn("soft-select-option", active && "is-active")}
                    onClick={() => {
                      if (opt.black && onBlackLock) {
                        onBlackLock();
                        setOpen(false);
                        return;
                      }
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {opt.black && <BlackDiamond />}
                      {opt.label}
                    </span>
                    {active && (
                      <Icon name="check" className="text-[10px] text-white/70" glow={false} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        className="soft-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
          {current?.black && <BlackDiamond className="shrink-0" />}
          <span className="truncate">{current?.label ?? value}</span>
        </span>
        <span className={cn("soft-select-chevron", open && "rotate-180")}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path
              d="M2 3.5L5 6.5L8 3.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {menu}
    </div>
  );
}

/** Compact On / Off control used instead of native select */
export function SoftOnOff({
  value,
  onChange,
  blackLocked,
  onBlackLock,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  blackLocked?: boolean;
  onBlackLock?: () => void;
}) {
  return (
    <div className="soft-onoff" role="group" aria-label="On or Off">
      <button
        type="button"
        className={cn("soft-onoff-btn", value && !blackLocked && "is-active")}
        aria-pressed={value && !blackLocked}
        onClick={() => {
          if (blackLocked && onBlackLock) {
            onBlackLock();
            return;
          }
          onChange(true);
        }}
      >
        {blackLocked && <BlackDiamond className="mr-1" />}
        On
      </button>
      <button
        type="button"
        className={cn("soft-onoff-btn", (!value || blackLocked) && "is-active")}
        aria-pressed={!value || Boolean(blackLocked)}
        onClick={() => onChange(false)}
      >
        Off
      </button>
    </div>
  );
}

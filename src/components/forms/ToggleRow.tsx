"use client";

export function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-4 last:border-0">
      <div>
        <p className="font-medium">{title}</p>
        <p className="help mt-1">{description}</p>
      </div>
      <button
        type="button"
        className="toggle"
        data-on={checked}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-knob" />
      </button>
    </div>
  );
}

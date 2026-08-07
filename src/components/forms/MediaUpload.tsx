"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/Icon";

export function MediaUpload({
  label,
  hint,
  kind,
  value,
  onChange,
  accept,
}: {
  label: string;
  hint?: string;
  kind: "banner" | "background" | "cover" | "audio";
  value: string;
  onChange: (url: string) => void;
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("kind", kind);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="label">
        <span>{label}</span>
        {hint && <span className="help">{hint}</span>}
      </div>

      {value && kind !== "audio" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="mb-2 h-24 w-full rounded-xl object-cover border border-white/10"
        />
      )}
      {value && kind === "audio" && (
        <p className="mb-2 truncate text-xs text-white/50">{value}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost text-sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Icon name="upload" className="text-xs" />
          {uploading ? "Uploading…" : "Choose file"}
        </button>
        {value && (
          <button
            type="button"
            className="btn btn-danger text-sm"
            onClick={() => onChange("")}
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />

      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}

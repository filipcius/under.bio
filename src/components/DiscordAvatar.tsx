import type { ReactNode } from "react";

type DiscordAvatarProps = {
  avatarUrl?: string | null;
  decorationUrl?: string | null;
  size: number;
  alt?: string;
  className?: string;
  /** Border radius for the avatar image (percent or CSS). */
  borderRadius?: string;
  border?: string;
  boxShadow?: string;
  ringClassName?: string;
  /** Extra overlay above the avatar (e.g. status dot). */
  children?: ReactNode;
};

/**
 * Discord-style avatar with optional decoration preset overlay.
 * Decoration extend past the circular crop (same as Discord client).
 */
export function DiscordAvatar({
  avatarUrl,
  decorationUrl,
  size,
  alt = "",
  className = "",
  borderRadius = "50%",
  border,
  boxShadow,
  ringClassName = "",
  children,
}: DiscordAvatarProps) {
  // Discord client ~160% of avatar for decoration frame
  const decoSize = Math.round(size * 1.6);
  // Outer box must be larger so parents with overflow:hidden don't clip ears/etc.
  const box = Math.max(size, decoSize);

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-visible ${className}`}
      style={{ width: box, height: box }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarUrl || "/avatar-fallback.svg"}
        alt={alt}
        className={`relative z-[1] object-cover ${ringClassName}`}
        style={{
          width: size,
          height: size,
          borderRadius,
          border,
          boxShadow,
        }}
      />
      {decorationUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={decorationUrl}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 select-none"
          style={{
            width: decoSize,
            height: decoSize,
            maxWidth: "none",
          }}
          draggable={false}
        />
      ) : null}
      {children ? (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-[3] -translate-x-1/2 -translate-y-1/2"
          style={{ width: size, height: size }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Matches DB constraint profiles_slug_format: start/end alphanumeric, 3–25 chars */
export function slugify(input: string) {
  let slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/[_-]{2,}/g, "-")
    .replace(/^[_-]+|[_-]+$/g, "")
    .slice(0, 25)
    .replace(/[_-]+$/g, "");

  if (slug.length < 3) {
    slug = `${slug}user`.replace(/[^a-z0-9]/g, "").slice(0, 25);
  }
  if (slug.length < 3) {
    slug = `user${Date.now().toString().slice(-6)}`;
  }

  return slug;
}

export function discordAvatarUrl(
  discordId: string,
  avatarHash: string | null | undefined,
  size = 256,
) {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${ext}?size=${size}`;
  }
  const index = Number((BigInt(discordId) >> BigInt(22)) % BigInt(6));
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

export function discordBannerUrl(
  discordId: string,
  bannerHash: string | null | undefined,
  size = 600,
) {
  if (!bannerHash) return null;
  const ext = bannerHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/banners/${discordId}/${bannerHash}.${ext}?size=${size}`;
}

export function hexToRgba(hex: string, opacityPercent: number) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(100, opacityPercent)) / 100})`;
}

import type { ProfileTemplate } from "@/lib/profile-template";

export type ProfileRow = {
  id: string;
  discord_id: string;
  username: string;
  global_name: string | null;
  avatar_hash: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  accent_color: number | null;
  email: string | null;
  discriminator: string | null;
  locale: string | null;
  verified: boolean | null;
  mfa_enabled: boolean | null;
  premium_type: number | null;
  public_flags: number | null;
  slug: string;
  uid: number;
  discord_raw: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type PageRow = {
  id: string;
  profile_id: string;
  config: ProfileTemplate;
  published: boolean;
  total_views: number;
  created_at: string;
  updated_at: string;
};

export type PageViewRow = {
  id: string;
  page_id: string;
  viewed_on: string;
  count: number;
};

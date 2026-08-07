import type { ProfileTemplate } from "@/lib/profile-template";

export type ProfileRow = {
  id: string;
  discord_id: string;
  username: string;
  global_name: string | null;
  avatar_hash: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  /** Discord avatar decoration preset asset hash (from avatar_decoration_data.asset) */
  avatar_decoration_asset?: string | null;
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
  plan?: string | null;
  plan_status?: string | null;
  plan_period_end?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  can_publish_templates?: boolean | null;
  invite_code?: string | null;
  referred_by?: string | null;
  referral_rewards_claimed?: number | null;
  discord_raw: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ThemeTemplateCategory =
  | "dark"
  | "light"
  | "minimal"
  | "neon"
  | "aesthetic"
  | "other";

export type ThemeTemplateStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "hidden";

export type ThemeTemplatePreview = {
  primary: string;
  secondary: string;
  bg: string;
  accent: string;
  font: string;
  box: string;
};

export type ThemeTemplateRow = {
  id: string;
  author_id: string;
  name: string;
  description: string;
  category: ThemeTemplateCategory;
  config: Record<string, unknown>;
  preview: ThemeTemplatePreview;
  status: ThemeTemplateStatus;
  uses_count: number;
  featured: boolean;
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

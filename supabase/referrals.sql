-- Invite / referral system (run in Supabase SQL editor)
-- 10 new signups via your code → 14 days VOID (stacks every 10)

alter table public.profiles
  add column if not exists invite_code text,
  add column if not exists referred_by uuid references public.profiles(id) on delete set null,
  add column if not exists referral_rewards_claimed integer not null default 0;

create unique index if not exists profiles_invite_code_uidx
  on public.profiles (invite_code)
  where invite_code is not null;

create index if not exists profiles_referred_by_idx
  on public.profiles (referred_by)
  where referred_by is not null;

create table if not exists public.referral_attributions (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  invitee_id uuid not null references public.profiles(id) on delete cascade,
  invite_code text not null,
  created_at timestamptz not null default now(),
  constraint referral_attributions_invitee_uidx unique (invitee_id),
  constraint referral_attributions_no_self check (inviter_id <> invitee_id)
);

create index if not exists referral_attributions_inviter_idx
  on public.referral_attributions (inviter_id, created_at desc);

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  milestone integer not null,
  days_granted integer not null default 14,
  period_end timestamptz not null,
  created_at timestamptz not null default now(),
  constraint referral_rewards_milestone_uidx unique (inviter_id, milestone)
);

alter table public.referral_attributions enable row level security;
alter table public.referral_rewards enable row level security;

-- App uses service-role client only (no public policies).

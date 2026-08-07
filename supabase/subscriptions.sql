-- under BLACK subscriptions (run in Supabase SQL editor)

alter table public.profiles
  add column if not exists plan text not null default 'free',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plan_status text not null default 'inactive',
  add column if not exists plan_period_end timestamptz;

create unique index if not exists profiles_stripe_customer_uidx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists profiles_stripe_subscription_uidx
  on public.profiles (stripe_subscription_id)
  where stripe_subscription_id is not null;

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'black'));

comment on column public.profiles.plan is 'free | black (under BLACK paid tier)';

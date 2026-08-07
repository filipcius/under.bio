-- VOID lifetime gifts audit (run in Supabase SQL editor)

create table if not exists public.void_gifts (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  stripe_session_id text not null,
  amount_cents integer not null default 499,
  created_at timestamptz not null default now(),
  constraint void_gifts_session_uidx unique (stripe_session_id)
);

create index if not exists void_gifts_buyer_idx on public.void_gifts (buyer_id, created_at desc);
create index if not exists void_gifts_recipient_idx on public.void_gifts (recipient_id, created_at desc);

alter table public.void_gifts enable row level security;

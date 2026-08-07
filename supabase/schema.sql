-- under.bio schema (run in Supabase SQL editor)
-- Secure by default: RLS enabled, unique slug, one page per account

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  discord_id text not null unique,
  username text not null,
  global_name text,
  avatar_hash text,
  avatar_url text,
  banner_url text,
  accent_color integer,
  email text,
  discriminator text,
  locale text,
  verified boolean default false,
  mfa_enabled boolean default false,
  premium_type integer default 0,
  public_flags integer default 0,
  slug text not null unique,
  uid bigserial unique,
  discord_raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_slug_format check (slug ~ '^[a-z0-9]([a-z0-9_-]{1,23}[a-z0-9])?$'),
  constraint profiles_slug_len check (char_length(slug) between 3 and 25)
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  config jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  total_views bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  viewed_on date not null default (timezone('utc', now()))::date,
  count integer not null default 1,
  unique (page_id, viewed_on)
);

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  label text not null,
  url text not null,
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  name text not null,
  icon text,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  title text not null,
  url text not null,
  sort_order integer not null default 0
);

create index if not exists profiles_slug_idx on public.profiles (slug);
create index if not exists pages_profile_id_idx on public.pages (profile_id);
create index if not exists page_views_page_id_idx on public.page_views (page_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists pages_updated_at on public.pages;
create trigger pages_updated_at
before update on public.pages
for each row execute function public.set_updated_at();

-- Atomic view counter
create or replace function public.increment_page_view(p_page_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.pages
  set total_views = total_views + 1
  where id = p_page_id;

  insert into public.page_views (page_id, viewed_on, count)
  values (p_page_id, (timezone('utc', now()))::date, 1)
  on conflict (page_id, viewed_on)
  do update set count = public.page_views.count + 1;
end;
$$;

revoke all on function public.increment_page_view(uuid) from public;
grant execute on function public.increment_page_view(uuid) to service_role;

alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.page_views enable row level security;
alter table public.links enable row level security;
alter table public.badges enable row level security;
alter table public.tags enable row level security;
alter table public.tracks enable row level security;

-- Public read for published pages (anon can read profile + page by slug via server)
create policy "Public can read profiles"
on public.profiles for select
to anon, authenticated
using (true);

create policy "Public can read published pages"
on public.pages for select
to anon, authenticated
using (published = true);

create policy "Public can read links of published pages"
on public.links for select
to anon, authenticated
using (
  exists (
    select 1 from public.pages p
    where p.id = links.page_id and p.published = true
  )
);

create policy "Public can read badges of published pages"
on public.badges for select
to anon, authenticated
using (
  exists (
    select 1 from public.pages p
    where p.id = badges.page_id and p.published = true
  )
);

create policy "Public can read tags of published pages"
on public.tags for select
to anon, authenticated
using (
  exists (
    select 1 from public.pages p
    where p.id = tags.page_id and p.published = true
  )
);

create policy "Public can read tracks of published pages"
on public.tracks for select
to anon, authenticated
using (
  exists (
    select 1 from public.pages p
    where p.id = tracks.page_id and p.published = true
  )
);

-- No direct client writes — all mutations go through Next.js with service role
-- Keep RLS on; omit insert/update/delete policies for anon/authenticated

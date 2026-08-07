-- Discord avatar decorations on under.bio profiles
-- Run in Supabase SQL editor

alter table public.profiles
  add column if not exists avatar_decoration_asset text;

comment on column public.profiles.avatar_decoration_asset is
  'Discord avatar_decoration_data.asset hash; synced on login';

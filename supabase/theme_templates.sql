-- Theme marketplace (run in Supabase SQL editor)
-- Early-access flag + community theme templates

alter table public.profiles
  add column if not exists can_publish_templates boolean not null default false;

create table if not exists public.theme_templates (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  category text not null default 'other',
  config jsonb not null default '{}'::jsonb,
  preview jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  uses_count integer not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint theme_templates_name_len check (char_length(name) between 3 and 48),
  constraint theme_templates_desc_len check (char_length(description) <= 280),
  constraint theme_templates_category_check check (
    category in ('dark', 'light', 'minimal', 'neon', 'aesthetic', 'other')
  ),
  constraint theme_templates_status_check check (
    status in ('pending', 'approved', 'rejected', 'hidden')
  )
);

create index if not exists theme_templates_status_idx on public.theme_templates (status);
create index if not exists theme_templates_category_idx on public.theme_templates (category);
create index if not exists theme_templates_uses_idx on public.theme_templates (uses_count desc);
create index if not exists theme_templates_author_idx on public.theme_templates (author_id);
create index if not exists theme_templates_featured_idx on public.theme_templates (featured) where featured = true;

drop trigger if exists theme_templates_updated_at on public.theme_templates;
create trigger theme_templates_updated_at
before update on public.theme_templates
for each row execute function public.set_updated_at();

alter table public.theme_templates enable row level security;

-- No public policies: app uses service-role client only (same as pages/profiles).

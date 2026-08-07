-- Admin audit log (run in Supabase SQL editor)

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid,
  actor_discord_id text not null,
  action text not null,
  target_profile_id uuid,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_actor_idx
  on public.admin_audit_log (actor_profile_id);

alter table public.admin_audit_log enable row level security;

-- No public policies: only service role (server) can read/write
revoke all on public.admin_audit_log from anon, authenticated;

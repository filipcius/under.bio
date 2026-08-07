-- Run in Supabase SQL editor (Storage)
insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do nothing;

create policy "Public read profile media"
on storage.objects for select
to public
using (bucket_id = 'profile-media');

-- Writes go through Next.js service role only

-- Storage buckets for volunteer avatars and sector icons

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    5242880, -- 5 MB
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'sector-icons',
    'sector-icons',
    true,
    1048576, -- 1 MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  );


-- RLS Policies: avatars

create policy "avatars: public read"
  on storage.objects as permissive for select
  to public
  using (bucket_id = 'avatars');

create policy "avatars: authenticated insert"
  on storage.objects as permissive for insert
  to authenticated
  with check (bucket_id = 'avatars');

create policy "avatars: authenticated update"
  on storage.objects as permissive for update
  to authenticated
  using (bucket_id = 'avatars')
  with check (bucket_id = 'avatars');

create policy "avatars: authenticated delete"
  on storage.objects as permissive for delete
  to authenticated
  using (bucket_id = 'avatars');


-- RLS Policies: sector-icons

create policy "sector-icons: public read"
  on storage.objects as permissive for select
  to public
  using (bucket_id = 'sector-icons');

create policy "sector-icons: authenticated insert"
  on storage.objects as permissive for insert
  to authenticated
  with check (bucket_id = 'sector-icons');

create policy "sector-icons: authenticated update"
  on storage.objects as permissive for update
  to authenticated
  using (bucket_id = 'sector-icons')
  with check (bucket_id = 'sector-icons');

create policy "sector-icons: authenticated delete"
  on storage.objects as permissive for delete
  to authenticated
  using (bucket_id = 'sector-icons');

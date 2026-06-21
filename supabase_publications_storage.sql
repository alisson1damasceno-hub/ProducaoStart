insert into storage.buckets (id, name, public)
values ('publications', 'publications', true)
on conflict (id) do nothing;

drop policy if exists "mvp_publications_storage_select" on storage.objects;
drop policy if exists "mvp_publications_storage_insert" on storage.objects;
drop policy if exists "mvp_publications_storage_delete" on storage.objects;

create policy "mvp_publications_storage_select" on storage.objects for select using (bucket_id = 'publications');
create policy "mvp_publications_storage_insert" on storage.objects for insert with check (bucket_id = 'publications');
create policy "mvp_publications_storage_delete" on storage.objects for delete using (bucket_id = 'publications');

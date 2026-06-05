grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.products to anon, authenticated;
grant select, insert, update, delete on public.technical_sheets to anon, authenticated;
grant select, insert, update, delete on public.production_orders to anon, authenticated;

alter table public.products enable row level security;
alter table public.technical_sheets enable row level security;
alter table public.production_orders enable row level security;

drop policy if exists "mvp_products_select" on public.products;
drop policy if exists "mvp_products_insert" on public.products;
drop policy if exists "mvp_products_update" on public.products;
drop policy if exists "mvp_products_delete" on public.products;

create policy "mvp_products_select" on public.products for select using (true);
create policy "mvp_products_insert" on public.products for insert with check (true);
create policy "mvp_products_update" on public.products for update using (true) with check (true);
create policy "mvp_products_delete" on public.products for delete using (true);

drop policy if exists "mvp_sheets_select" on public.technical_sheets;
drop policy if exists "mvp_sheets_insert" on public.technical_sheets;
drop policy if exists "mvp_sheets_update" on public.technical_sheets;
drop policy if exists "mvp_sheets_delete" on public.technical_sheets;

create policy "mvp_sheets_select" on public.technical_sheets for select using (true);
create policy "mvp_sheets_insert" on public.technical_sheets for insert with check (true);
create policy "mvp_sheets_update" on public.technical_sheets for update using (true) with check (true);
create policy "mvp_sheets_delete" on public.technical_sheets for delete using (true);

drop policy if exists "mvp_orders_select" on public.production_orders;
drop policy if exists "mvp_orders_insert" on public.production_orders;
drop policy if exists "mvp_orders_update" on public.production_orders;
drop policy if exists "mvp_orders_delete" on public.production_orders;

create policy "mvp_orders_select" on public.production_orders for select using (true);
create policy "mvp_orders_insert" on public.production_orders for insert with check (true);
create policy "mvp_orders_update" on public.production_orders for update using (true) with check (true);
create policy "mvp_orders_delete" on public.production_orders for delete using (true);

alter table if exists public.products
add column if not exists publications jsonb not null default '[]'::jsonb;

alter table if exists public.technical_sheets
add column if not exists publications jsonb not null default '[]'::jsonb;

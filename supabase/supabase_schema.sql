create table if not exists public.products (
  id text primary key,
  name text not null,
  sku text not null,
  category text not null,
  line text not null,
  recycled_percent integer not null default 0,
  status text not null default 'Ativo',
  created_at timestamptz not null default now()
);

create table if not exists public.technical_sheets (
  id text primary key,
  code text not null,
  product_id text not null references public.products(id) on delete cascade,
  version text not null,
  cycle_minutes integer not null default 0,
  unit_cost numeric(10, 2) not null default 0,
  residue text not null default '',
  inputs text not null default '',
  raw_materials jsonb not null default '[]'::jsonb,
  steps text not null default '',
  status text not null default 'Aprovada',
  created_at timestamptz not null default now()
);

create table if not exists public.production_orders (
  id text primary key,
  code text not null,
  sheet_id text not null references public.technical_sheets(id) on delete cascade,
  quantity integer not null default 1,
  due_date date not null,
  priority text not null default 'Média',
  responsible text not null default '',
  lot text not null default '',
  stage text not null default 'recepcao',
  progress integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_technical_sheets_product_id on public.technical_sheets(product_id);
create index if not exists idx_production_orders_sheet_id on public.production_orders(sheet_id);
create index if not exists idx_production_orders_stage on public.production_orders(stage);

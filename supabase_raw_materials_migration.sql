alter table if exists public.technical_sheets
add column if not exists raw_materials jsonb not null default '[]'::jsonb;

update public.technical_sheets
set
  unit_cost = 18.40,
  inputs = 'PEAD reciclado, pigmento verde, aditivo UV, embalagem unitária',
  raw_materials = '[
    {"id":"mp-pol-pead","name":"PEAD reciclado","quantity":7.2,"unit":"kg","unitCost":2.1},
    {"id":"mp-pol-pigmento","name":"Pigmento verde","quantity":0.08,"unit":"kg","unitCost":18},
    {"id":"mp-pol-uv","name":"Aditivo UV","quantity":0.03,"unit":"kg","unitCost":32},
    {"id":"mp-pol-embalagem","name":"Embalagem unitária","quantity":1,"unit":"un","unitCost":0.88}
  ]'::jsonb
where code = 'FT-001';

update public.technical_sheets
set
  unit_cost = 1.64,
  inputs = 'Resíduo plástico moído, frasco, tampa, rótulo',
  raw_materials = '[
    {"id":"mp-rep-residuo","name":"Resíduo plástico moído","quantity":0.12,"unit":"kg","unitCost":2.3},
    {"id":"mp-rep-frasco","name":"Frasco 500ml","quantity":1,"unit":"un","unitCost":1.1},
    {"id":"mp-rep-tampa","name":"Tampa","quantity":1,"unit":"un","unitCost":0.18},
    {"id":"mp-rep-rotulo","name":"Rótulo","quantity":1,"unit":"un","unitCost":0.08}
  ]'::jsonb
where code = 'FT-002';

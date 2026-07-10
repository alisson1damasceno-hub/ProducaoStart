insert into public.products (id, name, sku, category, line, recycled_percent, status)
values
  ('prod-1', 'Placa Poliframe 2,40m', 'POL-240-STD', 'Poliframe', 'Linha 01', 68, 'Ativo'),
  ('prod-2', 'Reparô 500ml', 'REP-500', 'Reparô', 'Envase', 40, 'Ativo')
on conflict (id) do update set
  name = excluded.name,
  sku = excluded.sku,
  category = excluded.category,
  line = excluded.line,
  recycled_percent = excluded.recycled_percent,
  status = excluded.status;

insert into public.technical_sheets (id, code, product_id, version, cycle_minutes, unit_cost, residue, inputs, raw_materials, steps, status)
values
  (
    'sheet-1',
    'FT-001',
    'prod-1',
    '2.1',
    45,
    18.40,
    '7,5 kg/un',
    'PEAD reciclado, pigmento verde, aditivo UV, embalagem unitária',
    '[
      {"id":"mp-pol-pead","name":"PEAD reciclado","quantity":7.2,"unit":"kg","unitCost":2.1},
      {"id":"mp-pol-pigmento","name":"Pigmento verde","quantity":0.08,"unit":"kg","unitCost":18},
      {"id":"mp-pol-uv","name":"Aditivo UV","quantity":0.03,"unit":"kg","unitCost":32},
      {"id":"mp-pol-embalagem","name":"Embalagem unitária","quantity":1,"unit":"un","unitCost":0.88}
    ]'::jsonb,
    'Triagem, moagem, mistura, prensagem, resfriamento, inspeção',
    'Aprovada'
  ),
  (
    'sheet-2',
    'FT-002',
    'prod-2',
    '1.3',
    58,
    1.64,
    '120g/un',
    'Resíduo plástico moído, frasco, tampa, rótulo',
    '[
      {"id":"mp-rep-residuo","name":"Resíduo plástico moído","quantity":0.12,"unit":"kg","unitCost":2.3},
      {"id":"mp-rep-frasco","name":"Frasco 500ml","quantity":1,"unit":"un","unitCost":1.1},
      {"id":"mp-rep-tampa","name":"Tampa","quantity":1,"unit":"un","unitCost":0.18},
      {"id":"mp-rep-rotulo","name":"Rótulo","quantity":1,"unit":"un","unitCost":0.08}
    ]'::jsonb,
    'Pesagem, moagem, formulação, envase, rotulagem',
    'Aprovada'
  )
on conflict (id) do update set
  code = excluded.code,
  product_id = excluded.product_id,
  version = excluded.version,
  cycle_minutes = excluded.cycle_minutes,
  unit_cost = excluded.unit_cost,
  residue = excluded.residue,
  inputs = excluded.inputs,
  raw_materials = excluded.raw_materials,
  steps = excluded.steps,
  status = excluded.status;

insert into public.production_orders (id, code, sheet_id, quantity, due_date, priority, responsible, lot, stage, progress, created_at)
values
  ('order-1', 'OP-0191', 'sheet-1', 80, '2026-04-27', 'Alta', 'Carlos P.', 'LT-2459', 'processamento', 45, '2026-04-20T09:14:00.000Z'),
  ('order-2', 'OP-0192', 'sheet-2', 500, '2026-04-28', 'Média', 'Ana L.', 'LT-2458', 'fabricacao', 70, '2026-04-20T10:30:00.000Z')
on conflict (id) do update set
  code = excluded.code,
  sheet_id = excluded.sheet_id,
  quantity = excluded.quantity,
  due_date = excluded.due_date,
  priority = excluded.priority,
  responsible = excluded.responsible,
  lot = excluded.lot,
  stage = excluded.stage,
  progress = excluded.progress,
  created_at = excluded.created_at;

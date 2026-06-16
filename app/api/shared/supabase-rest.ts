import type { MvpData, Product, ProductionOrder, Publication, RawMaterial, TechnicalSheet } from "../../shared/types";
import { seedData } from "../../shared/seed";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseRestKey = process.env.SUPABASE_REST_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const REQUEST_TIMEOUT_MS = 5000;

type DbProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  line: string;
  recycled_percent: number;
  status: Product["status"];
  publications?: Publication[] | null;
};

type DbTechnicalSheet = {
  id: string;
  code: string;
  product_id: string;
  version: string;
  cycle_minutes: number;
  unit_cost: number | string;
  residue: string;
  inputs: string;
  raw_materials?: RawMaterial[] | null;
  publications?: Publication[] | null;
  steps: string;
  status: TechnicalSheet["status"];
};

type DbProductionOrder = {
  id: string;
  code: string;
  sheet_id: string;
  quantity: number;
  due_date: string;
  priority: ProductionOrder["priority"];
  responsible: string;
  lot: string;
  stage: ProductionOrder["stage"];
  progress: number;
  created_at: string;
  comments?: ProductionOrder["comments"] | null;
};

function assertConfig() {
  if (!supabaseUrl || !supabaseRestKey) {
    throw new Error("Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_REST_KEY.");
  }
}

function endpoint(table: string, query = "") {
  assertConfig();
  return `${supabaseUrl as string}/rest/v1/${table}${query}`;
}

function headers(extra?: HeadersInit) {
  assertConfig();

  return {
    apikey: supabaseRestKey as string,
    Authorization: `Bearer ${supabaseRestKey as string}`,
    "Content-Type": "application/json",
    ...extra
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const response = await fetch(path, {
    ...init,
    headers: headers(init?.headers),
                               cache: "no-store",
                               signal: controller.signal
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Erro Supabase: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export function toProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    line: row.line,
    recycledPercent: row.recycled_percent,
    status: row.status,
    publications: Array.isArray(row.publications) ? row.publications : []
  };
}

export function toDbProduct(product: Product): DbProduct {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    line: product.line,
    recycled_percent: product.recycledPercent,
    status: product.status,
    publications: product.publications || []
  };
}

function toDbProductPatch(product: Partial<Product>) {
  return {
    ...(product.name !== undefined ? { name: product.name } : {}),
    ...(product.sku !== undefined ? { sku: product.sku } : {}),
    ...(product.category !== undefined ? { category: product.category } : {}),
    ...(product.line !== undefined ? { line: product.line } : {}),
    ...(product.recycledPercent !== undefined ? { recycled_percent: product.recycledPercent } : {}),
    ...(product.status !== undefined ? { status: product.status } : {}),
    ...(product.publications !== undefined ? { publications: product.publications } : {})
  };
}

export function toSheet(row: DbTechnicalSheet): TechnicalSheet {
  const seedSheet = seedData.sheets.find((sheet) => sheet.id === row.id || sheet.code === row.code);

  const rawMaterials =
  Array.isArray(row.raw_materials) && row.raw_materials.length
  ? row.raw_materials
  : seedSheet?.rawMaterials || [];

  return {
    id: row.id,
    code: row.code,
    productId: row.product_id,
    version: row.version,
    cycleMinutes: row.cycle_minutes,
    unitCost: Number(row.unit_cost),
    residue: row.residue,
    inputs: row.inputs,
    rawMaterials,
    publications: Array.isArray(row.publications) ? row.publications : [],
    steps: row.steps,
    status: row.status
  };
}

export function toDbSheet(sheet: TechnicalSheet): DbTechnicalSheet {
  return {
    id: sheet.id,
    code: sheet.code,
    product_id: sheet.productId,
    version: sheet.version,
    cycle_minutes: sheet.cycleMinutes,
    unit_cost: sheet.unitCost,
    residue: sheet.residue,
    inputs: sheet.inputs,
    raw_materials: sheet.rawMaterials,
    publications: sheet.publications || [],
    steps: sheet.steps,
    status: sheet.status
  };
}

function toDbSheetPatch(sheet: Partial<TechnicalSheet>) {
  return {
    ...(sheet.code !== undefined ? { code: sheet.code } : {}),
    ...(sheet.productId !== undefined ? { product_id: sheet.productId } : {}),
    ...(sheet.version !== undefined ? { version: sheet.version } : {}),
    ...(sheet.cycleMinutes !== undefined ? { cycle_minutes: sheet.cycleMinutes } : {}),
    ...(sheet.unitCost !== undefined ? { unit_cost: sheet.unitCost } : {}),
    ...(sheet.residue !== undefined ? { residue: sheet.residue } : {}),
    ...(sheet.inputs !== undefined ? { inputs: sheet.inputs } : {}),
    ...(sheet.rawMaterials !== undefined ? { raw_materials: sheet.rawMaterials } : {}),
    ...(sheet.publications !== undefined ? { publications: sheet.publications } : {}),
    ...(sheet.steps !== undefined ? { steps: sheet.steps } : {}),
    ...(sheet.status !== undefined ? { status: sheet.status } : {})
  };
}

export function toOrder(row: DbProductionOrder): ProductionOrder {
  return {
    id: row.id,
    code: row.code,
    sheetId: row.sheet_id,
    quantity: row.quantity,
    dueDate: row.due_date,
    priority: row.priority,
    responsible: row.responsible,
    lot: row.lot,
    stage: row.stage,
    progress: row.progress,
    createdAt: row.created_at,
    comments: Array.isArray(row.comments) ? row.comments : []
  };
}

export function toDbOrder(order: ProductionOrder): DbProductionOrder {
  return {
    id: order.id,
    code: order.code,
    sheet_id: order.sheetId,
    quantity: order.quantity,
    due_date: order.dueDate,
    priority: order.priority,
    responsible: order.responsible,
    lot: order.lot,
    stage: order.stage,
    progress: order.progress,
    created_at: order.createdAt,
    comments: Array.isArray(order.comments) ? order.comments : []
  };
}

function toDbOrderPatch(order: Partial<ProductionOrder>) {
  return {
    ...(order.code !== undefined ? { code: order.code } : {}),
    ...(order.sheetId !== undefined ? { sheet_id: order.sheetId } : {}),
    ...(order.quantity !== undefined ? { quantity: order.quantity } : {}),
    ...(order.dueDate !== undefined ? { due_date: order.dueDate } : {}),
    ...(order.priority !== undefined ? { priority: order.priority } : {}),
    ...(order.responsible !== undefined ? { responsible: order.responsible } : {}),
    ...(order.lot !== undefined ? { lot: order.lot } : {}),
    ...(order.stage !== undefined ? { stage: order.stage } : {}),
    ...(order.progress !== undefined ? { progress: order.progress } : {}),
    ...(order.createdAt !== undefined ? { created_at: order.createdAt } : {}),
    ...(order.comments !== undefined ? { comments: order.comments } : {})
  };
}

export async function getMvpData(): Promise<MvpData> {
  const [products, sheets, orders] = await Promise.all([
    request<DbProduct[]>(endpoint("products", "?select=*&order=created_at.desc")),
                                                       request<DbTechnicalSheet[]>(endpoint("technical_sheets", "?select=*&order=created_at.desc")),
                                                       request<DbProductionOrder[]>(endpoint("production_orders", "?select=*&order=created_at.desc"))
  ]);

  return {
    products: products.map(toProduct),
    sheets: sheets.map(toSheet),
    orders: orders.map(toOrder)
  };
}

export async function insertProduct(product: Product) {
  const rows = await request<DbProduct[]>(endpoint("products"), {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(toDbProduct(product))
  });

  return toProduct(rows[0]);
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const rows = await request<DbProduct[]>(endpoint("products", `?id=eq.${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(toDbProductPatch(product))
  });

  return toProduct(rows[0]);
}

export async function deleteProduct(id: string) {
  await request<void>(endpoint("products", `?id=eq.${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
}

export async function insertSheet(sheet: TechnicalSheet) {
  const rows = await request<DbTechnicalSheet[]>(endpoint("technical_sheets"), {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(toDbSheet(sheet))
  });

  return toSheet(rows[0]);
}

export async function updateSheet(id: string, sheet: Partial<TechnicalSheet>) {
  const rows = await request<DbTechnicalSheet[]>(endpoint("technical_sheets", `?id=eq.${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(toDbSheetPatch(sheet))
  });

  return toSheet(rows[0]);
}

export async function deleteSheet(id: string) {
  await request<void>(endpoint("technical_sheets", `?id=eq.${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
}

export async function insertOrder(order: ProductionOrder) {
  const rows = await request<DbProductionOrder[]>(endpoint("production_orders"), {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(toDbOrder(order))
  });

  return toOrder(rows[0]);
}

export async function updateOrderStage(id: string, stage: ProductionOrder["stage"], progress: number) {
  return updateOrder(id, { stage, progress });
}

export async function updateOrder(id: string, order: Partial<ProductionOrder>) {
  const rows = await request<DbProductionOrder[]>(endpoint("production_orders", `?id=eq.${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(toDbOrderPatch(order))
  });

  return toOrder(rows[0]);
}

export async function deleteOrder(id: string) {
  await request<void>(endpoint("production_orders", `?id=eq.${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
}

async function deleteAll(table: string) {
  await request<void>(endpoint(table, "?id=not.is.null"), {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
}

export async function resetMvpData() {
  await deleteAll("production_orders");
  await deleteAll("technical_sheets");
  await deleteAll("products");

  await request(endpoint("products"), {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(seedData.products.map(toDbProduct))
  });

  await request(endpoint("technical_sheets"), {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(seedData.sheets.map(toDbSheet))
  });

  await request(endpoint("production_orders"), {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(
      seedData.orders.map((order) =>
      toDbOrder({
        ...order,
        comments: Array.isArray(order.comments) ? order.comments : []
      })
      )
    )
  });

  return getMvpData();
}

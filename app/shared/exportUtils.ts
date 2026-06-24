import type { ProductionOrder, TechnicalSheet, Product } from "./types";
import { stageLabels } from "./seed";
import { sheetMaterialCost } from "./materials";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// ── helpers ────────────────────────────────────────────────────────────────

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvRow(cells: (string | number)[]) {
  return cells
    .map((cell) => {
      const str = String(cell ?? "");
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    })
    .join(",");
}

function sheetLabel(
  sheetId: string,
  sheets: TechnicalSheet[],
  products: Product[]
) {
  const sheet = sheets.find((s) => s.id === sheetId);
  const product = products.find((p) => p.id === sheet?.productId);
  return sheet && product ? `${sheet.code} - ${product.name}` : "—";
}

function orderMaterialCost(order: ProductionOrder, sheets: TechnicalSheet[]) {
  const sheet = sheets.find((s) => s.id === order.sheetId);
  return sheet ? sheetMaterialCost(sheet) * order.quantity : 0;
}

// ── CSV ────────────────────────────────────────────────────────────────────

export function exportOrdersCSV(
  orders: ProductionOrder[],
  sheets: TechnicalSheet[],
  products: Product[]
) {
  const header = csvRow([
    "OP",
    "Lote",
    "Ficha Técnica",
    "Quantidade",
    "Custo MP Previsto",
    "Responsável",
    "Prioridade",
    "Prazo",
    "Etapa",
    "Progresso (%)",
    "Criado em",
  ]);

  const rows = orders.map((order) =>
    csvRow([
      order.code,
      order.lot,
      sheetLabel(order.sheetId, sheets, products),
      order.quantity,
      currency.format(orderMaterialCost(order, sheets)),
      order.responsible,
      order.priority,
      new Date(`${order.dueDate}T00:00:00`).toLocaleDateString("pt-BR"),
      stageLabels[order.stage],
      order.progress,
      new Date(order.createdAt).toLocaleString("pt-BR"),
    ])
  );

  const csv = [header, ...rows].join("\n");
  const date = new Date().toISOString().slice(0, 10);
  triggerDownload("\uFEFF" + csv, `ordens-producao-${date}.csv`, "text/csv;charset=utf-8");
}

// ── JSON ───────────────────────────────────────────────────────────────────

export function exportOrdersJSON(
  orders: ProductionOrder[],
  sheets: TechnicalSheet[],
  products: Product[]
) {
  const payload = {
    exportedAt: new Date().toISOString(),
    source: "Start Solidarium MVP",
    totalOrdens: orders.length,
    ordens: orders.map((order) => ({
      op: order.code,
      lote: order.lot,
      fichaTecnica: sheetLabel(order.sheetId, sheets, products),
      quantidade: order.quantity,
      custoMPPrevisto: orderMaterialCost(order, sheets),
      responsavel: order.responsible,
      prioridade: order.priority,
      prazo: order.dueDate,
      etapa: stageLabels[order.stage],
      progresso: order.progress,
      criadoEm: order.createdAt,
    })),
  };

  const date = new Date().toISOString().slice(0, 10);
  triggerDownload(
    JSON.stringify(payload, null, 2),
    `ordens-producao-${date}.json`,
    "application/json"
  );
}
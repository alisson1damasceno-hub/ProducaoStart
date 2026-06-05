import type { ProductionOrder, RawMaterial, TechnicalSheet } from "./types";

export function normalizeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

export function materialLineCost(material: Pick<RawMaterial, "quantity" | "unitCost">) {
  return normalizeNumber(material.quantity) * normalizeNumber(material.unitCost);
}

export function sheetMaterialCost(sheet: Pick<TechnicalSheet, "unitCost"> & { rawMaterials?: RawMaterial[] }) {
  const materials = Array.isArray(sheet.rawMaterials) ? sheet.rawMaterials : [];
  if (!materials.length) return normalizeNumber(sheet.unitCost);
  return materials.reduce((total, material) => total + materialLineCost(material), 0);
}

export function materialSummary(materials: RawMaterial[]) {
  return materials.map((material) => material.name.trim()).filter(Boolean).join(", ");
}

export function cleanRawMaterials(materials: RawMaterial[]) {
  return materials
    .map((material) => ({
      ...material,
      name: material.name.trim(),
      unit: material.unit.trim() || "un",
      quantity: normalizeNumber(material.quantity),
      unitCost: normalizeNumber(material.unitCost)
    }))
    .filter((material) => material.name && material.quantity > 0);
}

export function materialsFromLegacyInputs(inputs: string) {
  return inputs
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name, index) => ({
      id: `legacy-mp-${index + 1}`,
      name,
      quantity: 0,
      unit: "un",
      unitCost: 0
    }));
}

export function orderMaterialConsumption(sheet: TechnicalSheet, orderQuantity: ProductionOrder["quantity"]) {
  const quantity = normalizeNumber(orderQuantity);
  const materials = Array.isArray(sheet.rawMaterials) ? sheet.rawMaterials : [];
  return materials.map((material) => {
    const totalQuantity = normalizeNumber(material.quantity) * quantity;
    return {
      ...material,
      totalQuantity,
      totalCost: totalQuantity * normalizeNumber(material.unitCost)
    };
  });
}

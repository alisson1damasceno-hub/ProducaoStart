import type { MvpData } from "./types";

export const stageLabels = {
  recepcao: "Recepção",
  processamento: "Processamento",
  fabricacao: "Fabricação",
  qualidade: "Qualidade",
  embalagem: "Embalagem",
  concluido: "Concluído"
} as const;

export const seedData: MvpData = {
  products: [
    {
      id: "prod-1",
      name: "Placa Poliframe 2,40m",
      sku: "POL-240-STD",
      category: "Poliframe",
      line: "Linha 01",
      recycledPercent: 68,
      status: "Ativo"
    },
    {
      id: "prod-2",
      name: "Reparô 500ml",
      sku: "REP-500",
      category: "Reparô",
      line: "Envase",
      recycledPercent: 40,
      status: "Ativo"
    }
  ],
  sheets: [
    {
      id: "sheet-1",
      code: "FT-001",
      productId: "prod-1",
      version: "2.1",
      cycleMinutes: 45,
      unitCost: 18.4,
      residue: "7,5 kg/un",
      inputs: "PEAD reciclado, pigmento verde, aditivo UV, embalagem unitária",
      rawMaterials: [
        { id: "mp-pol-pead", name: "PEAD reciclado", quantity: 7.2, unit: "kg", unitCost: 2.1 },
        { id: "mp-pol-pigmento", name: "Pigmento verde", quantity: 0.08, unit: "kg", unitCost: 18 },
        { id: "mp-pol-uv", name: "Aditivo UV", quantity: 0.03, unit: "kg", unitCost: 32 },
        { id: "mp-pol-embalagem", name: "Embalagem unitária", quantity: 1, unit: "un", unitCost: 0.88 }
      ],
      steps: "Triagem, moagem, mistura, prensagem, resfriamento, inspeção",
      status: "Aprovada"
    },
    {
      id: "sheet-2",
      code: "FT-002",
      productId: "prod-2",
      version: "1.3",
      cycleMinutes: 58,
      unitCost: 1.64,
      residue: "120g/un",
      inputs: "Resíduo plástico moído, frasco, tampa, rótulo",
      rawMaterials: [
        { id: "mp-rep-residuo", name: "Resíduo plástico moído", quantity: 0.12, unit: "kg", unitCost: 2.3 },
        { id: "mp-rep-frasco", name: "Frasco 500ml", quantity: 1, unit: "un", unitCost: 1.1 },
        { id: "mp-rep-tampa", name: "Tampa", quantity: 1, unit: "un", unitCost: 0.18 },
        { id: "mp-rep-rotulo", name: "Rótulo", quantity: 1, unit: "un", unitCost: 0.08 }
      ],
      steps: "Pesagem, moagem, formulação, envase, rotulagem",
      status: "Aprovada"
    }
  ],
  orders: [
    {
      id: "order-1",
      code: "OP-0191",
      sheetId: "sheet-1",
      quantity: 80,
      dueDate: "2026-04-27",
      priority: "Alta",
      responsible: "Carlos P.",
      lot: "LT-2459",
      stage: "processamento",
      progress: 45,
      createdAt: "2026-04-20T09:14:00.000Z",
      comments: []
    },
    {
      id: "order-2",
      code: "OP-0192",
      sheetId: "sheet-2",
      quantity: 500,
      dueDate: "2026-04-28",
      priority: "Média",
      responsible: "Ana L.",
      lot: "LT-2458",
      stage: "fabricacao",
      progress: 70,
      createdAt: "2026-04-20T10:30:00.000Z",
      comments: []
    }
  ]
};

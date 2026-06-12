export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  line: string;
  recycledPercent: number;
  status: "Ativo" | "Em desenvolvimento";
};

export type RawMaterial = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
};

export type TechnicalSheet = {
  id: string;
  code: string;
  productId: string;
  version: string;
  cycleMinutes: number;
  unitCost: number;
  residue: string;
  inputs: string;
  rawMaterials: RawMaterial[];
  steps: string;
  status: "Aprovada" | "Em revisão";
};

export type ProductionStage =
  | "recepcao"
  | "processamento"
  | "fabricacao"
  | "qualidade"
  | "embalagem"
  | "concluido";

export type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

export type ProductionOrder = {
  id: string;
  code: string;
  sheetId: string;
  quantity: number;
  dueDate: string;
  priority: "Alta" | "Média" | "Baixa";
  responsible: string;
  lot: string;
  stage: ProductionStage;
  progress: number;
  createdAt: string;
  comments: Comment[];
};

export type MvpData = {
  products: Product[];
  sheets: TechnicalSheet[];
  orders: ProductionOrder[];
};

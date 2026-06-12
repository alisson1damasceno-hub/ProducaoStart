"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  ClipboardCheck,
  ClipboardPlus,
  Clock3,
  Coins,
  Eye,
  Factory,
  Package,
  Pencil,
  PlusCircle,
  Save,
  Trash2,
  X
} from "lucide-react";
import { Shell } from "../shared/shell";
import { cleanRawMaterials, materialLineCost, materialSummary, materialsFromLegacyInputs, sheetMaterialCost } from "../shared/materials";
import { useMvpData } from "../shared/store";
import type { RawMaterial, TechnicalSheet } from "../shared/types";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

type SheetForm = Omit<TechnicalSheet, "id" | "code">;

function createMaterial(): RawMaterial {
  return {
    id: `mp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: "",
    quantity: 1,
    unit: "kg",
    unitCost: 0
  };
}

const defaultForm: SheetForm = {
  productId: "",
  version: "1.0",
  cycleMinutes: 45,
  unitCost: 0,
  residue: "1 kg/un",
  inputs: "",
  rawMaterials: [createMaterial()],
  steps: "",
  status: "Aprovada"
};

export default function TechnicalSheetsPage() {
  const { products, sheets, orders, addSheet, updateSheet, deleteSheet } = useMvpData();
  const [form, setForm] = useState<SheetForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<TechnicalSheet | null>(null);

  const selectedProductId = form.productId || products[0]?.id || "";
  const validMaterials = cleanRawMaterials(form.rawMaterials);
  const calculatedUnitCost = validMaterials.reduce((total, material) => total + materialLineCost(material), 0);
  const approvedSheets = sheets.filter((sheet) => sheet.status === "Aprovada").length;
  const averageCycle = sheets.length
    ? Math.round(sheets.reduce((total, sheet) => total + sheet.cycleMinutes, 0) / sheets.length)
    : 0;
  const productsWithoutSheet = products.filter((product) => !sheets.some((sheet) => sheet.productId === product.id)).length;
  const editingSheet = sheets.find((sheet) => sheet.id === editingId);

  function productName(id: string) {
    return products.find((product) => product.id === id)?.name || "Produto não encontrado";
  }

  function resetForm(productId = selectedProductId) {
    setEditingId(null);
    setForm({ ...defaultForm, productId, rawMaterials: [createMaterial()] });
  }

  function updateMaterial(id: string, patch: Partial<RawMaterial>) {
    setForm((current) => ({
      ...current,
      rawMaterials: current.rawMaterials.map((material) => (material.id === id ? { ...material, ...patch } : material))
    }));
  }

  function addMaterial() {
    setForm((current) => ({
      ...current,
      rawMaterials: [...current.rawMaterials, createMaterial()]
    }));
  }

  function removeMaterial(id: string) {
    setForm((current) => {
      if (current.rawMaterials.length <= 1) {
        return { ...current, rawMaterials: [createMaterial()] };
      }
      return {
        ...current,
        rawMaterials: current.rawMaterials.filter((material) => material.id !== id)
      };
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!selectedProductId || !validMaterials.length || !form.steps) return;

    const payload = {
      ...form,
      productId: selectedProductId,
      inputs: materialSummary(validMaterials),
      rawMaterials: validMaterials,
      unitCost: calculatedUnitCost
    };

    if (editingId && editingSheet) {
      updateSheet({ ...payload, id: editingId, code: editingSheet.code });
    } else {
      addSheet(payload);
    }

    resetForm(selectedProductId);
  }

  function startEdit(sheet: TechnicalSheet) {
    const rawMaterials = sheet.rawMaterials.length ? sheet.rawMaterials : materialsFromLegacyInputs(sheet.inputs);
    setViewing(null);
    setEditingId(sheet.id);
    setForm({
      productId: sheet.productId,
      version: sheet.version,
      cycleMinutes: sheet.cycleMinutes,
      unitCost: sheet.unitCost,
      residue: sheet.residue,
      inputs: sheet.inputs,
      rawMaterials: rawMaterials.length ? rawMaterials : [createMaterial()],
      steps: sheet.steps,
      status: sheet.status
    });
  }

  function confirmDelete(sheet: TechnicalSheet) {
    const relatedOrders = orders.filter((order) => order.sheetId === sheet.id);
    const message = `Excluir ${sheet.code} também remove ${relatedOrders.length} OP(s) vinculada(s). Confirmar?`;
    if (window.confirm(message)) {
      deleteSheet(sheet.id);
      if (viewing?.id === sheet.id) setViewing(null);
      if (editingId === sheet.id) resetForm();
    }
  }

  function renderMaterials(sheet: TechnicalSheet) {
    if (!sheet.rawMaterials.length) {
      return <p>{sheet.inputs || "Sem matérias-primas detalhadas."}</p>;
    }

    return (
      <div className="material-list">
        {sheet.rawMaterials.map((material) => (
          <div className="material-line" key={material.id}>
            <span>{material.name}</span>
            <strong>{material.quantity} {material.unit}</strong>
            <strong>{currency.format(material.unitCost)}/{material.unit}</strong>
            <strong>{currency.format(materialLineCost(material))}/un</strong>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Shell active="ficha">
      <div className="page-header">
        <div>
          <h2>Fichas técnicas</h2>
          <div className="subtitle">Cadastre a receita produtiva com matéria-prima, consumo por unidade e custo individual.</div>
        </div>
        <Link className="btn btn-primary btn-lg" href="/ordens">
          Próximo <ArrowRight size={18} />
        </Link>
      </div>

      <div className="kpi-row compact">
        <div className="kpi">
          <div className="kpi-icon"><ClipboardCheck size={18} /></div>
          <div className="kpi-label">Fichas aprovadas</div>
          <div className="kpi-value">{approvedSheets}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><Factory size={18} /></div>
          <div className="kpi-label">Produtos sem ficha</div>
          <div className="kpi-value">{productsWithoutSheet}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><Clock3 size={18} /></div>
          <div className="kpi-label">Ciclo médio</div>
          <div className="kpi-value">{averageCycle} min</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><Package size={18} /></div>
          <div className="kpi-label">MP cadastradas</div>
          <div className="kpi-value">{sheets.reduce((total, sheet) => total + sheet.rawMaterials.length, 0)}</div>
        </div>
      </div>

      <div className="workbench-grid">
        <form className="card form-panel" onSubmit={submit}>
          <div className="section-title">
            <div>
              <h3>{editingId ? "Editar ficha técnica" : "Nova ficha técnica"}</h3>
              <p>{editingSheet ? `Alterando ${editingSheet.code}` : "Produto, ciclo, MP, custo e etapas."}</p>
            </div>
            <span className="badge badge-blue">CRUD</span>
          </div>

          <div className="form-group">
            <label className="required">Produto</label>
            <select value={selectedProductId} onChange={(e) => setForm({ ...form, productId: e.target.value })} disabled={products.length === 0}>
              {products.length === 0 ? (
                <option>Nenhum produto cadastrado</option>
              ) : (
                products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)
              )}
            </select>
          </div>

          <div className="row-3">
            <div className="form-group">
              <label>Versão</label>
              <input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Ciclo min.</label>
              <input type="number" min="1" value={form.cycleMinutes} onChange={(e) => setForm({ ...form, cycleMinutes: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Custo MP/un.</label>
              <input readOnly value={currency.format(calculatedUnitCost)} />
            </div>
          </div>

          <div className="row">
            <div className="form-group">
              <label>Resíduo usado</label>
              <input value={form.residue} onChange={(e) => setForm({ ...form, residue: e.target.value })} placeholder="Ex: 7,5 kg/un" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TechnicalSheet["status"] })}>
                <option>Aprovada</option>
                <option>Em revisão</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <div className="material-editor-head">
              <label className="required">Matérias-primas por unidade produzida</label>
              <button className="btn btn-secondary compact-btn" type="button" onClick={addMaterial}>
                <PlusCircle size={15} /> Adicionar MP
              </button>
            </div>

            <div className="material-editor">
              <div className="material-editor-row material-editor-labels">
                <span>MP</span>
                <span>Qtd.</span>
                <span>Un.</span>
                <span>Custo unit.</span>
                <span>Custo/un.</span>
                <span />
              </div>
              {form.rawMaterials.map((material) => (
                <div className="material-editor-row" key={material.id}>
                  <input value={material.name} onChange={(e) => updateMaterial(material.id, { name: e.target.value })} placeholder="Ex: PEAD reciclado" />
                  <input type="number" min="0" step="0.001" value={material.quantity} onChange={(e) => updateMaterial(material.id, { quantity: Number(e.target.value) })} />
                  <input value={material.unit} onChange={(e) => updateMaterial(material.id, { unit: e.target.value })} placeholder="kg" />
                  <input type="number" min="0" step="0.01" value={material.unitCost} onChange={(e) => updateMaterial(material.id, { unitCost: Number(e.target.value) })} />
                  <strong>{currency.format(materialLineCost(material))}</strong>
                  <button className="icon-btn danger" type="button" onClick={() => removeMaterial(material.id)} title="Remover MP"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>

            <div className="material-total">
              <Calculator size={16} />
              <span>Custo total de matéria-prima por unidade</span>
              <strong>{currency.format(calculatedUnitCost)}</strong>
            </div>
          </div>

          <div className="form-group">
            <label className="required">Etapas</label>
            <textarea value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} placeholder="Ex: Triagem, moagem, mistura, inspeção" />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={products.length === 0 || validMaterials.length === 0}>
              {editingId ? <Save size={17} /> : <ClipboardPlus size={17} />} {editingId ? "Salvar edição" : "Salvar ficha"}
            </button>
            {editingId && (
              <button className="btn btn-secondary" type="button" onClick={() => resetForm()}>
                <X size={16} /> Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="card">
          <div className="section-title">
            <div>
              <h3>Fichas técnicas</h3>
              <p>Base técnica disponível para gerar ordens e prever baixa de estoque.</p>
            </div>
          </div>

          {viewing && (
            <div className="detail-panel">
              <div>
                <span className="eyebrow">Visualização</span>
                <h3>{viewing.code} · {productName(viewing.productId)}</h3>
                <p>v{viewing.version} · {viewing.cycleMinutes} min · {currency.format(sheetMaterialCost(viewing))}/un em MP</p>
              </div>
              <div className="detail-panel-actions">
                <button className="icon-btn" type="button" onClick={() => startEdit(viewing)} title="Editar ficha"><Pencil size={16} /></button>
                <button className="icon-btn danger" type="button" onClick={() => confirmDelete(viewing)} title="Excluir ficha"><Trash2 size={16} /></button>
                <button className="icon-btn" type="button" onClick={() => setViewing(null)} title="Fechar"><X size={16} /></button>
              </div>
            </div>
          )}

          {sheets.length === 0 ? (
            <div className="empty-column">Nenhuma ficha técnica cadastrada ainda.</div>
          ) : (
            <div className="sheet-grid">
              {sheets.map((sheet) => {
                const linkedOrders = orders.filter((order) => order.sheetId === sheet.id).length;
                return (
                  <article className="sheet-card" key={sheet.id}>
                    <div className="sheet-card-head">
                      <div>
                        <span className="sheet-code">{sheet.code}</span>
                        <strong>{productName(sheet.productId)}</strong>
                      </div>
                      <span className={`badge ${sheet.status === "Aprovada" ? "badge-green" : "badge-orange"}`}>{sheet.status}</span>
                    </div>
                    <div className="sheet-metrics">
                      <span><Clock3 size={14} /> {sheet.cycleMinutes} min</span>
                      <span><Coins size={14} /> {currency.format(sheetMaterialCost(sheet))}/un MP</span>
                      <span><Factory size={14} /> {linkedOrders} OP(s)</span>
                    </div>
                    <div className="sheet-detail">
                      <span>Matérias-primas</span>
                      {renderMaterials(sheet)}
                    </div>
                    <div className="sheet-detail">
                      <span>Etapas</span>
                      <p>{sheet.steps}</p>
                    </div>
                    <div className="crud-actions">
                      <button className="icon-btn" type="button" onClick={() => setViewing(sheet)} title="Visualizar ficha"><Eye size={16} /></button>
                      <button className="icon-btn" type="button" onClick={() => startEdit(sheet)} title="Editar ficha"><Pencil size={16} /></button>
                      <button className="icon-btn danger" type="button" onClick={() => confirmDelete(sheet)} title="Excluir ficha"><Trash2 size={16} /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

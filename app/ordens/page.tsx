"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Coins, Eye, Package, Pencil, PlusCircle, Save, Trash2, X } from "lucide-react";
import { Shell } from "../shared/shell";
import { useMvpData } from "../shared/store";
import { stageLabels } from "../shared/seed";
import { orderMaterialConsumption, sheetMaterialCost } from "../shared/materials";
import type { ProductionOrder, ProductionStage } from "../shared/types";

type OrderForm = Pick<ProductionOrder, "sheetId" | "quantity" | "dueDate" | "priority" | "responsible" | "stage" | "progress">;

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const defaultForm: OrderForm = {
  sheetId: "",
  quantity: 100,
  dueDate: "2026-04-30",
  priority: "Média",
  responsible: "Carlos P.",
  stage: "recepcao",
  progress: 0
};

export default function OrdersPage() {
  const { products, sheets, orders, addOrder, updateOrder, deleteOrder } = useMvpData();
  const [form, setForm] = useState<OrderForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<ProductionOrder | null>(null);

  const selectedSheetId = form.sheetId || sheets[0]?.id || "";
  const selectedSheet = sheets.find((sheet) => sheet.id === selectedSheetId);
  const plannedMaterials = selectedSheet ? orderMaterialConsumption(selectedSheet, form.quantity) : [];
  const plannedMaterialCost = plannedMaterials.reduce((total, material) => total + material.totalCost, 0);
  const editingOrder = orders.find((order) => order.id === editingId);

  function sheetLabel(id: string) {
    const sheet = sheets.find((item) => item.id === id);
    const product = products.find((item) => item.id === sheet?.productId);
    return sheet && product ? `${sheet.code} - ${product.name}` : "Ficha não encontrada";
  }

  function orderMaterialCost(order: ProductionOrder) {
    const sheet = sheets.find((item) => item.id === order.sheetId);
    return sheet ? sheetMaterialCost(sheet) * order.quantity : 0;
  }

  function resetForm(sheetId = selectedSheetId) {
    setEditingId(null);
    setForm({ ...defaultForm, sheetId });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!selectedSheetId) return;

    if (editingId && editingOrder) {
      updateOrder({
        ...editingOrder,
        ...form,
        sheetId: selectedSheetId
      });
    } else {
      addOrder({
        sheetId: selectedSheetId,
        quantity: form.quantity,
        dueDate: form.dueDate,
        priority: form.priority,
        responsible: form.responsible
      });
    }

    resetForm(selectedSheetId);
  }

  function startEdit(order: ProductionOrder) {
    setViewing(null);
    setEditingId(order.id);
    setForm({
      sheetId: order.sheetId,
      quantity: order.quantity,
      dueDate: order.dueDate,
      priority: order.priority,
      responsible: order.responsible,
      stage: order.stage,
      progress: order.progress
    });
  }

  function confirmDelete(order: ProductionOrder) {
    if (window.confirm(`Excluir ${order.code}? Essa ação remove a OP da visão geral e do Kanban.`)) {
      deleteOrder(order.id);
      if (viewing?.id === order.id) setViewing(null);
      if (editingId === order.id) resetForm();
    }
  }

  return (
    <Shell active="ordens">
      <div className="page-header">
        <div>
          <h2>Ordens de produção</h2>
          <div className="subtitle">Abra, edite e acompanhe ordens ligadas à ficha técnica, já com baixa prevista de MP.</div>
        </div>
        <Link className="btn btn-primary btn-lg" href="/ops">
          Ver OPs <ArrowRight size={18} />
        </Link>
      </div>

      <div className="workbench-grid">
        <form className="card form-panel" onSubmit={submit}>
          <div className="section-title">
            <div>
              <h3>{editingId ? "Editar OP" : "Nova ordem"}</h3>
              <p>{editingOrder ? `Alterando ${editingOrder.code}` : "A OP nasce da ficha e calcula consumo de matéria-prima."}</p>
            </div>
            <span className="badge badge-blue">CRUD</span>
          </div>

          <div className="form-group">
            <label className="required">Ficha técnica</label>
            <select value={selectedSheetId} onChange={(e) => setForm({ ...form, sheetId: e.target.value })} disabled={sheets.length === 0}>
              {sheets.length === 0 ? (
                <option>Nenhuma ficha cadastrada</option>
              ) : (
                sheets.map((sheet) => <option key={sheet.id} value={sheet.id}>{sheetLabel(sheet.id)}</option>)
              )}
            </select>
          </div>

          <div className="row">
            <div className="form-group">
              <label>Quantidade</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Prazo</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>

          <div className="row">
            <div className="form-group">
              <label>Prioridade</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as ProductionOrder["priority"] })}>
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
            </div>
            <div className="form-group">
              <label>Responsável</label>
              <input value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} />
            </div>
          </div>

          {editingId && (
            <div className="row">
              <div className="form-group">
                <label>Status atual</label>
                <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as ProductionStage })}>
                  {Object.entries(stageLabels).map(([stage, label]) => (
                    <option value={stage} key={stage}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Progresso</label>
                <input type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} />
              </div>
            </div>
          )}

          {selectedSheet && selectedSheet.rawMaterials.length > 0 && (
            <div className="materials-consumption">
              <div className="materials-consumption-head">
                <Package size={17} />
                <div>
                  <strong>Baixa prevista de MP</strong>
                  <span>{form.quantity} unidade(s) com base em {selectedSheet.code}</span>
                </div>
              </div>
              {plannedMaterials.map((material) => (
                <div className="consumption-row" key={material.id}>
                  <span>{material.name}</span>
                  <strong>{material.totalQuantity.toLocaleString("pt-BR")} {material.unit}</strong>
                  <strong>{currency.format(material.totalCost)}</strong>
                </div>
              ))}
              <div className="consumption-total">
                <Coins size={15} />
                <span>Custo previsto da OP</span>
                <strong>{currency.format(plannedMaterialCost)}</strong>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={sheets.length === 0}>
              {editingId ? <Save size={17} /> : <PlusCircle size={17} />} {editingId ? "Salvar edição" : "Abrir OP"}
            </button>
            {editingId && (
              <button className="btn btn-secondary" type="button" onClick={() => resetForm()}>
                <X size={16} /> Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="card table-card">
          <div className="section-title">
            <div>
              <h3>Ordens geradas</h3>
              <p>Visualize, edite ou exclua OPs antes de acompanhar no Kanban.</p>
            </div>
          </div>

          {viewing && (
            <div className="detail-panel">
              <div>
                <span className="eyebrow">Visualização</span>
                <h3>{viewing.code} · {sheetLabel(viewing.sheetId)}</h3>
                <p>{viewing.quantity} un · {stageLabels[viewing.stage]} · {viewing.progress}% · MP {currency.format(orderMaterialCost(viewing))}</p>
              </div>
              <div className="detail-panel-actions">
                <button className="icon-btn" type="button" onClick={() => startEdit(viewing)} title="Editar OP"><Pencil size={16} /></button>
                <button className="icon-btn danger" type="button" onClick={() => confirmDelete(viewing)} title="Excluir OP"><Trash2 size={16} /></button>
                <button className="icon-btn" type="button" onClick={() => setViewing(null)} title="Fechar"><X size={16} /></button>
              </div>
            </div>
          )}

          <div className="ops-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>OP</th>
                  <th>Ficha</th>
                  <th>Qtd</th>
                  <th>MP prevista</th>
                  <th>Prazo</th>
                  <th>Etapa</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.code}</strong><span className="meta">{order.responsible}</span></td>
                    <td>{sheetLabel(order.sheetId)}</td>
                    <td>{order.quantity} un</td>
                    <td>{currency.format(orderMaterialCost(order))}</td>
                    <td>{new Date(`${order.dueDate}T00:00:00`).toLocaleDateString("pt-BR")}</td>
                    <td><span className="badge badge-blue">{stageLabels[order.stage]}</span></td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" type="button" onClick={() => setViewing(order)} title="Visualizar OP"><Eye size={16} /></button>
                        <button className="icon-btn" type="button" onClick={() => startEdit(order)} title="Editar OP"><Pencil size={16} /></button>
                        <button className="icon-btn danger" type="button" onClick={() => confirmDelete(order)} title="Excluir OP"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && <div className="empty-column">Nenhuma OP cadastrada ainda.</div>}
        </div>
      </div>
    </Shell>
  );
}

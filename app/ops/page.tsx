"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Eye, Pencil, Save, Search, Trash2, X } from "lucide-react";
import { Shell } from "../shared/shell";
import { stageLabels } from "../shared/seed";
import { orderMaterialConsumption, sheetMaterialCost } from "../shared/materials";
import { useMvpData } from "../shared/store";
import type { ProductionOrder, ProductionStage, TechnicalSheet } from "../shared/types";

const allStages = Object.keys(stageLabels) as ProductionStage[];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function priorityClass(priority: ProductionOrder["priority"]) {
  if (priority === "Alta") return "badge-red";
  if (priority === "Média") return "badge-orange";
  return "badge-green";
}

function stageClass(stage: ProductionStage) {
  if (stage === "concluido") return "badge-green";
  if (stage === "qualidade" || stage === "embalagem") return "badge-blue";
  if (stage === "recepcao") return "badge-orange";
  return "badge-purple";
}

function isLate(order: ProductionOrder) {
  const today = new Date();
  const dueDate = new Date(`${order.dueDate}T23:59:59`);
  return order.stage !== "concluido" && dueDate < today;
}

export default function OpsOverviewPage() {
  const { products, sheets, orders, updateOrder, deleteOrder } = useMvpData();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<"todas" | ProductionStage>("todas");
  const [viewing, setViewing] = useState<ProductionOrder | null>(null);
  const [editing, setEditing] = useState<ProductionOrder | null>(null);

  const completed = orders.filter((order) => order.stage === "concluido");
  const late = orders.filter(isLate);
  const active = orders.filter((order) => order.stage !== "concluido");

  function findSheet(sheetId: string) {
    return sheets.find((item) => item.id === sheetId);
  }

  function sheetInfo(sheetId: string) {
    const sheet = findSheet(sheetId);
    const product = products.find((item) => item.id === sheet?.productId);
    return {
      sheet,
      code: sheet?.code || "Sem FT",
      productName: product?.name || "Produto não encontrado"
    };
  }

  function orderMaterialCost(order: ProductionOrder, sheet?: TechnicalSheet) {
    const currentSheet = sheet || findSheet(order.sheetId);
    return currentSheet ? sheetMaterialCost(currentSheet) * order.quantity : 0;
  }

  const filteredOrders = orders.filter((order) => {
    const info = sheetInfo(order.sheetId);
    const text = `${order.code} ${order.lot} ${order.responsible} ${info.code} ${info.productName}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesStage = stageFilter === "todas" || order.stage === stageFilter;
    return matchesQuery && matchesStage;
  });

  function confirmDelete(order: ProductionOrder) {
    if (window.confirm(`Excluir ${order.code}? Essa ação remove a OP da visão geral e do Kanban.`)) {
      deleteOrder(order.id);
      if (viewing?.id === order.id) setViewing(null);
      if (editing?.id === order.id) setEditing(null);
    }
  }

  function saveEditing() {
    if (!editing) return;
    updateOrder(editing);
    setEditing(null);
    setViewing(editing);
  }

  return (
    <Shell active="ops">
      <div className="page-header">
        <div>
          <h2>Visão geral das OPs</h2>
          <div className="subtitle">Todas as ordens, concluídas ou em andamento, com status atual, prioridade e custo previsto de MP.</div>
        </div>
        <Link className="btn btn-primary btn-lg" href="/kanban">
          Abrir Kanban <ArrowRight size={18} />
        </Link>
      </div>

      <div className="kpi-row compact">
        <div className="kpi">
          <div className="kpi-icon"><ClipboardList size={18} /></div>
          <div className="kpi-label">Total de OPs</div>
          <div className="kpi-value">{orders.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><Activity size={18} /></div>
          <div className="kpi-label">Em andamento</div>
          <div className="kpi-value">{active.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><CheckCircle2 size={18} /></div>
          <div className="kpi-label">Feitas</div>
          <div className="kpi-value">{completed.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><AlertTriangle size={18} /></div>
          <div className="kpi-label">Atrasadas</div>
          <div className="kpi-value">{late.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">
          <div>
            <h3>Painel operacional</h3>
            <p>Use para responder rapidamente onde cada OP está agora e quanto de MP ela consome.</p>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-field">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por OP, produto, lote ou responsável" />
          </div>
          <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value as "todas" | ProductionStage)}>
            <option value="todas">Todas as etapas</option>
            {allStages.map((stage) => (
              <option value={stage} key={stage}>{stageLabels[stage]}</option>
            ))}
          </select>
        </div>

        {editing && (
          <div className="detail-panel edit-panel">
            <div>
              <span className="eyebrow">Edição rápida</span>
              <h3>{editing.code} · {sheetInfo(editing.sheetId).productName}</h3>
              <div className="quick-edit-grid">
                <label>
                  Qtd
                  <input type="number" min="1" value={editing.quantity} onChange={(event) => setEditing({ ...editing, quantity: Number(event.target.value) })} />
                </label>
                <label>
                  Prazo
                  <input type="date" value={editing.dueDate} onChange={(event) => setEditing({ ...editing, dueDate: event.target.value })} />
                </label>
                <label>
                  Prioridade
                  <select value={editing.priority} onChange={(event) => setEditing({ ...editing, priority: event.target.value as ProductionOrder["priority"] })}>
                    <option>Alta</option>
                    <option>Média</option>
                    <option>Baixa</option>
                  </select>
                </label>
                <label>
                  Status
                  <select value={editing.stage} onChange={(event) => setEditing({ ...editing, stage: event.target.value as ProductionStage })}>
                    {allStages.map((stage) => <option value={stage} key={stage}>{stageLabels[stage]}</option>)}
                  </select>
                </label>
                <label>
                  Progresso
                  <input type="number" min="0" max="100" value={editing.progress} onChange={(event) => setEditing({ ...editing, progress: Number(event.target.value) })} />
                </label>
                <label>
                  Responsável
                  <input value={editing.responsible} onChange={(event) => setEditing({ ...editing, responsible: event.target.value })} />
                </label>
              </div>
            </div>
            <div className="detail-panel-actions">
              <button className="icon-btn" type="button" onClick={saveEditing} title="Salvar OP"><Save size={16} /></button>
              <button className="icon-btn" type="button" onClick={() => setEditing(null)} title="Cancelar"><X size={16} /></button>
            </div>
          </div>
        )}

        {viewing && !editing && (
          <div className="detail-panel">
            <div>
              <span className="eyebrow">Visualização</span>
              <h3>{viewing.code} · {sheetInfo(viewing.sheetId).productName}</h3>
              <p>
                {viewing.quantity} un · {stageLabels[viewing.stage]} · {viewing.progress}% · {viewing.responsible} · MP {currency.format(orderMaterialCost(viewing))}
              </p>
              {sheetInfo(viewing.sheetId).sheet?.rawMaterials.length ? (
                <div className="inline-materials">
                  {orderMaterialConsumption(sheetInfo(viewing.sheetId).sheet as TechnicalSheet, viewing.quantity).slice(0, 4).map((material) => (
                    <span key={material.id}>{material.name}: {material.totalQuantity.toLocaleString("pt-BR")} {material.unit}</span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="detail-panel-actions">
              <button className="icon-btn" type="button" onClick={() => setEditing(viewing)} title="Editar OP"><Pencil size={16} /></button>
              <button className="icon-btn danger" type="button" onClick={() => confirmDelete(viewing)} title="Excluir OP"><Trash2 size={16} /></button>
              <button className="icon-btn" type="button" onClick={() => setViewing(null)} title="Fechar"><X size={16} /></button>
            </div>
          </div>
        )}

        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>OP</th>
                <th>Produto</th>
                <th>Qtd</th>
                <th>MP prevista</th>
                <th>Prioridade</th>
                <th>Status atual</th>
                <th>Progresso</th>
                <th>Prazo</th>
                <th>Responsável</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const info = sheetInfo(order.sheetId);
                return (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.code}</strong>
                      <span className="meta">{order.lot} · {info.code}</span>
                    </td>
                    <td>{info.productName}</td>
                    <td>{order.quantity} un</td>
                    <td>{currency.format(orderMaterialCost(order, info.sheet))}</td>
                    <td><span className={`badge ${priorityClass(order.priority)}`}>{order.priority}</span></td>
                    <td>
                      <span className={`badge ${stageClass(order.stage)}`}>{stageLabels[order.stage]}</span>
                      {isLate(order) && <span className="late-dot">Atrasada</span>}
                    </td>
                    <td>
                      <div className="table-progress">
                        <div className="progress-mini">
                          <div className="bar" style={{ width: `${order.progress}%` }} />
                        </div>
                        <strong>{order.progress}%</strong>
                      </div>
                    </td>
                    <td>{new Date(`${order.dueDate}T00:00:00`).toLocaleDateString("pt-BR")}</td>
                    <td>{order.responsible}</td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" type="button" onClick={() => setViewing(order)} title="Visualizar OP"><Eye size={16} /></button>
                        <button className="icon-btn" type="button" onClick={() => { setViewing(null); setEditing(order); }} title="Editar OP"><Pencil size={16} /></button>
                        <button className="icon-btn danger" type="button" onClick={() => confirmDelete(order)} title="Excluir OP"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="empty-column">Nenhuma OP encontrada com os filtros atuais.</div>
        )}
      </div>
    </Shell>
  );
}

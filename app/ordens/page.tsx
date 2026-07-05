"use client";

import { Fragment, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  Clock3,
  Coins,
  Download,
  MessageSquare,
  Package,
  Pencil,
  PlusCircle,
  Save,
  Search,
  Send,
  Share2,
  SlidersHorizontal,
  Trash2,
  UserCircle,
  X
} from "lucide-react";
import { Shell } from "../shared/shell";
import { useMvpData } from "../shared/store";
import { usePapel } from "../login/usePapel";
import { stageLabels } from "../shared/seed";
import { orderMaterialConsumption, sheetMaterialCost } from "../shared/materials";
import { exportOrdersCSV, exportOrdersJSON } from "../shared/exportUtils";
import { ShareModal } from "../shared/ShareModal";
import { sessaoAtual } from "../login/authApi";
import type { Sessao } from "../login/types";
import type { ProductionOrder, ProductionStage } from "../shared/types";

type OrderForm = Pick<
  ProductionOrder,
  "sheetId" | "quantity" | "dueDate" | "priority" | "responsible" | "stage" | "progress"
>;

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
  const { products, sheets, orders, addOrder, updateOrder, deleteOrder, addComment } = useMvpData();
  const { podeEditar, podeExcluir } = usePapel();

  const [form, setForm] = useState<OrderForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<ProductionOrder | null>(null);
  const [commentText, setCommentText] = useState("");
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [showShare, setShowShare] = useState(false);

  // Filtro e pesquisa (item 6: filtrar por data, período, tipo, usuário, status ou categoria)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState<ProductionStage | "todas">("todas");
  const [filterPriority, setFilterPriority] = useState<ProductionOrder["priority"] | "todas">("todas");
  const [filterResponsible, setFilterResponsible] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [groupByStage, setGroupByStage] = useState(false);
  const [sortKey, setSortKey] = useState<"code" | "quantity" | "dueDate" | "stage" | "responsible">("dueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const selectedSheetId = form.sheetId || sheets[0]?.id || "";
  const selectedSheet = sheets.find((sheet) => sheet.id === selectedSheetId);
  const plannedMaterials = selectedSheet ? orderMaterialConsumption(selectedSheet, form.quantity) : [];
  const plannedMaterialCost = plannedMaterials.reduce((total, material) => total + material.totalCost, 0);
  const editingOrder = orders.find((order) => order.id === editingId);

  const viewingOrder = viewing ? orders.find((order) => order.id === viewing.id) ?? null : null;
  const viewingComments = viewingOrder?.comments ?? [];

  const commentAuthorName = sessao?.usuario.nome || sessao?.usuario.email || "Usuário";

  useEffect(() => {
    sessaoAtual().then(setSessao);
  }, []);

  function sheetLabel(id: string) {
    const sheet = sheets.find((item) => item.id === id);
    const product = products.find((item) => item.id === sheet?.productId);
    return sheet && product ? `${sheet.code} - ${product.name}` : "Ficha não encontrada";
  }

  function orderMaterialCost(order: ProductionOrder) {
    const sheet = sheets.find((item) => item.id === order.sheetId);
    return sheet ? sheetMaterialCost(sheet) * order.quantity : 0;
  }

  const responsibleOptions = useMemo(
    () => Array.from(new Set(orders.map((order) => order.responsible))).sort(),
    [orders]
  );

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function clearFilters() {
    setSearchTerm("");
    setFilterStage("todas");
    setFilterPriority("todas");
    setFilterResponsible("todos");
    setDateFrom("");
    setDateTo("");
  }

  const filtersActive =
    searchTerm.trim() !== "" ||
    filterStage !== "todas" ||
    filterPriority !== "todas" ||
    filterResponsible !== "todos" ||
    dateFrom !== "" ||
    dateTo !== "";

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      if (filterStage !== "todas" && order.stage !== filterStage) return false;
      if (filterPriority !== "todas" && order.priority !== filterPriority) return false;
      if (filterResponsible !== "todos" && order.responsible !== filterResponsible) return false;
      if (dateFrom && order.dueDate < dateFrom) return false;
      if (dateTo && order.dueDate > dateTo) return false;

      if (term) {
        const haystack = `${order.code} ${sheetLabel(order.sheetId)} ${order.responsible} ${order.lot}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      return true;
    });
  }, [orders, sheets, products, searchTerm, filterStage, filterPriority, filterResponsible, dateFrom, dateTo]);

  const sortedOrders = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;

    return [...filteredOrders].sort((a, b) => {
      switch (sortKey) {
        case "quantity":
          return (a.quantity - b.quantity) * dir;
        case "dueDate":
          return a.dueDate.localeCompare(b.dueDate) * dir;
        case "stage":
          return stageLabels[a.stage].localeCompare(stageLabels[b.stage]) * dir;
        case "responsible":
          return a.responsible.localeCompare(b.responsible) * dir;
        case "code":
        default:
          return a.code.localeCompare(b.code) * dir;
      }
    });
  }, [filteredOrders, sortKey, sortDir]);

  const groupedOrders = useMemo(() => {
    if (!groupByStage) return null;

    const groups = new Map<ProductionStage, ProductionOrder[]>();
    sortedOrders.forEach((order) => {
      const list = groups.get(order.stage) || [];
      list.push(order);
      groups.set(order.stage, list);
    });
    return groups;
  }, [groupByStage, sortedOrders]);

  const totals = useMemo(() => {
    const totalQuantity = filteredOrders.reduce((sum, order) => sum + order.quantity, 0);
    const totalCost = filteredOrders.reduce((sum, order) => sum + orderMaterialCost(order), 0);
    const avgProgress = filteredOrders.length
      ? filteredOrders.reduce((sum, order) => sum + order.progress, 0) / filteredOrders.length
      : 0;

    return { totalQuantity, totalCost, avgProgress, count: filteredOrders.length };
  }, [filteredOrders, sheets]);

  // Representação visual: quantidade por etapa (barras) e distribuição por prioridade (pizza)
  const stageChartData = useMemo(() => {
    const stageOrder: ProductionStage[] = [
      "recepcao",
      "processamento",
      "fabricacao",
      "qualidade",
      "embalagem",
      "concluido"
    ];

    return stageOrder
      .map((stage) => ({
        stage,
        label: stageLabels[stage],
        quantity: filteredOrders.filter((order) => order.stage === stage).reduce((sum, o) => sum + o.quantity, 0),
        count: filteredOrders.filter((order) => order.stage === stage).length
      }))
      .filter((item) => item.count > 0);
  }, [filteredOrders]);

  const maxStageQuantity = Math.max(1, ...stageChartData.map((item) => item.quantity));

  const priorityColors: Record<ProductionOrder["priority"], string> = {
    Alta: "#ef4444",
    Média: "#f59e0b",
    Baixa: "#22c55e"
  };

  const priorityChartData = useMemo(() => {
    const priorities: ProductionOrder["priority"][] = ["Alta", "Média", "Baixa"];
    return priorities
      .map((priority) => ({
        priority,
        count: filteredOrders.filter((order) => order.priority === priority).length
      }))
      .filter((item) => item.count > 0);
  }, [filteredOrders]);

  const priorityTotal = Math.max(1, priorityChartData.reduce((sum, item) => sum + item.count, 0));

  const priorityPieGradient = useMemo(() => {
    let acc = 0;
    const stops = priorityChartData.map((item) => {
      const start = (acc / priorityTotal) * 360;
      acc += item.count;
      const end = (acc / priorityTotal) * 360;
      return `${priorityColors[item.priority]} ${start}deg ${end}deg`;
    });
    return stops.length ? `conic-gradient(${stops.join(", ")})` : "var(--surface)";
  }, [priorityChartData, priorityTotal]);

  function sortIcon(key: typeof sortKey) {
    return (
      <button
        type="button"
        onClick={() => toggleSort(key)}
        style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit", padding: 0 }}
        title="Ordenar"
      >
        <ArrowUpDown size={12} style={{ opacity: sortKey === key ? 1 : 0.4 }} />
      </button>
    );
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

  function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!viewingOrder || !commentText.trim()) return;
    addComment(viewingOrder.id, commentAuthorName, commentText.trim());
    setCommentText("");
  }

  function formatDateTime(date: string) {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return (
    <Shell active="ordens">
      <div className="page-header">
        <div>
          <h2>Ordens de produção</h2>
          <div className="subtitle">
            Abra, edite e acompanhe ordens ligadas à ficha técnica, já com baixa prevista de MP.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div className="export-group">
            <span className="export-label"><Download size={13} /> Exportar</span>
            <button
              className="btn btn-secondary"
              onClick={() => exportOrdersCSV(orders, sheets, products)}
              disabled={orders.length === 0}
              title="Baixar CSV"
            >
              CSV
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => exportOrdersJSON(orders, sheets, products)}
              disabled={orders.length === 0}
              title="Baixar JSON"
            >
              JSON
            </button>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => setShowShare(true)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Share2 size={15} /> Compartilhar
          </button>

          <Link className="btn btn-primary btn-lg" href="/ops">
            Ver OPs <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}

      <div className="workbench-grid">
        {podeEditar ? (
        <form className="card form-panel" onSubmit={submit}>
          <div className="section-title">
            <div>
              <h3>{editingId ? "Editar OP" : "Nova ordem"}</h3>
              <p>
                {editingOrder
                  ? `Alterando ${editingOrder.code}`
                  : "A OP nasce da ficha e calcula consumo de matéria-prima."}
              </p>
            </div>
            <span className="badge badge-blue">CRUD</span>
          </div>

          <div className="form-group">
            <label className="required">Ficha técnica</label>
            <select
              value={selectedSheetId}
              onChange={(e) => setForm({ ...form, sheetId: e.target.value })}
              disabled={sheets.length === 0}
            >
              {sheets.length === 0 ? (
                <option>Nenhuma ficha cadastrada</option>
              ) : (
                sheets.map((sheet) => (
                  <option key={sheet.id} value={sheet.id}>
                    {sheetLabel(sheet.id)}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="row">
            <div className="form-group">
              <label>Quantidade</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Prazo</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="row">
            <div className="form-group">
              <label>Prioridade</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as ProductionOrder["priority"] })}
              >
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
            </div>
            <div className="form-group">
              <label>Responsável</label>
              <input
                value={form.responsible}
                onChange={(e) => setForm({ ...form, responsible: e.target.value })}
              />
            </div>
          </div>

          {editingId && (
            <div className="row">
              <div className="form-group">
                <label>Status atual</label>
                <select
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: e.target.value as ProductionStage })}
                >
                  {Object.entries(stageLabels).map(([stage, label]) => (
                    <option value={stage} key={stage}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Progresso</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                />
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
              {editingId ? <Save size={17} /> : <PlusCircle size={17} />}
              {editingId ? "Salvar edição" : "Abrir OP"}
            </button>
            {editingId && (
              <button className="btn btn-secondary" type="button" onClick={() => resetForm()}>
                <X size={16} /> Cancelar
              </button>
            )}
          </div>
        </form>
        ) : (
          <div className="card form-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#71717a", textAlign: "center" }}>
            <span style={{ fontSize: 32 }}>🔒</span>
            <strong>Acesso restrito</strong>
            <p className="subtitle">Somente Admin e Owner podem criar ou editar ordens.</p>
          </div>
        )}

        <div className="card table-card">
          <div className="section-title">
            <div>
              <h3>Ordens geradas</h3>
              <p>Visualize, edite ou exclua OPs antes de acompanhar no Kanban.</p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--border)",
              marginBottom: 14
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "1 1 220px", minWidth: 200 }}>
              <Search size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Pesquisar por OP, produto, lote ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 10px", background: "var(--surface)", color: "var(--text)", fontSize: 13 }}
              />
            </div>

            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value as ProductionStage | "todas")}
              style={{ borderRadius: 10, padding: "8px 10px", fontSize: 13 }}
              title="Filtrar por status/etapa"
            >
              <option value="todas">Todas as etapas</option>
              {Object.entries(stageLabels).map(([stage, label]) => (
                <option key={stage} value={stage}>{label}</option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as ProductionOrder["priority"] | "todas")}
              style={{ borderRadius: 10, padding: "8px 10px", fontSize: 13 }}
              title="Filtrar por categoria/prioridade"
            >
              <option value="todas">Todas as prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>

            <select
              value={filterResponsible}
              onChange={(e) => setFilterResponsible(e.target.value)}
              style={{ borderRadius: 10, padding: "8px 10px", fontSize: 13 }}
              title="Filtrar por usuário responsável"
            >
              <option value="todos">Todos os usuários</option>
              {responsibleOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
              <span>Período:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{ borderRadius: 10, padding: "7px 8px", fontSize: 12 }}
                title="Data inicial"
              />
              <span>até</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{ borderRadius: 10, padding: "7px 8px", fontSize: 12 }}
                title="Data final"
              />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}>
              <input type="checkbox" checked={groupByStage} onChange={(e) => setGroupByStage(e.target.checked)} />
              <SlidersHorizontal size={13} /> Agrupar por etapa
            </label>

            {filtersActive && (
              <button className="btn btn-secondary" type="button" onClick={clearFilters} style={{ fontSize: 12, padding: "7px 12px" }}>
                <X size={13} /> Limpar filtros
              </button>
            )}
          </div>

          {filteredOrders.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 18 }}>
              <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16, background: "var(--surface)" }}>
                <strong style={{ fontSize: 13 }}>Quantidade por etapa</strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                  {stageChartData.map((item) => (
                    <div key={item.stage} style={{ display: "grid", gridTemplateColumns: "110px 1fr 70px", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.label}</span>
                      <div style={{ background: "var(--border)", borderRadius: 6, height: 12, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${(item.quantity / maxStageQuantity) * 100}%`,
                            height: "100%",
                            background: "var(--accent, #3b82f6)",
                            borderRadius: 6
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 12, textAlign: "right" }}>{item.quantity} un</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16, background: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <strong style={{ fontSize: 13, alignSelf: "flex-start" }}>OPs por prioridade</strong>
                <div
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    background: priorityPieGradient
                  }}
                  title="Distribuição por prioridade"
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                  {priorityChartData.map((item) => (
                    <div key={item.priority} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: priorityColors[item.priority], display: "inline-block" }} />
                        {item.priority}
                      </span>
                      <span>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {viewingOrder && (
            <div className="detail-panel" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div>
                  <span className="eyebrow">Visualização</span>
                  <h3>{viewingOrder.code} · {sheetLabel(viewingOrder.sheetId)}</h3>
                  <p>
                    {viewingOrder.quantity} un · {stageLabels[viewingOrder.stage]} ·{" "}
                    {viewingOrder.progress}% · MP {currency.format(orderMaterialCost(viewingOrder))}
                  </p>
                </div>
                <div className="detail-panel-actions">
                  {podeEditar && <button className="icon-btn" type="button" onClick={() => startEdit(viewingOrder)} title="Editar OP"><Pencil size={16} /></button>}
                  {podeExcluir && <button className="icon-btn danger" type="button" onClick={() => confirmDelete(viewingOrder)} title="Excluir OP"><Trash2 size={16} /></button>}
                  <button className="icon-btn" type="button" onClick={() => setViewing(null)} title="Comentário da OP"
                  >
                  <MessageSquare size={16} />
                  </button>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 16, border: "1px solid var(--border)", background: "var(--surface)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)" }}>
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 15 }}>Histórico da OP</strong>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                        Observações, decisões e ocorrências registradas durante a produção.
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-blue">{viewingComments.length} comentário(s)</span>
                </div>

                <form
                  onSubmit={submitComment}
                  style={{ display: "flex", flexDirection: "column", gap: 12, padding: 14, border: "1px solid var(--border)", borderRadius: 16, background: "var(--surface)", boxShadow: "0 10px 28px rgba(15, 23, 42, 0.07)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 999, display: "grid", placeItems: "center", border: "1px solid var(--border)", background: "var(--surface)" }}>
                        <UserCircle size={19} />
                      </div>
                      <div>
                        <strong style={{ fontSize: 13 }}>{commentAuthorName}</strong>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                          Comentando com a conta logada.
                        </p>
                      </div>
                    </div>
                  </div>

                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ex: material conferido, atraso informado, ajuste necessário..."
                    rows={3}
                    style={{ width: "100%", minHeight: 86, resize: "vertical", fontSize: 14, fontFamily: "inherit", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 13, background: "var(--surface)", color: "var(--text)", outline: "none", lineHeight: 1.5 }}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Esse registro ficará salvo nesta ordem.
                    </span>
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={!commentText.trim()}
                      style={{ padding: "10px 18px", borderRadius: 12, fontWeight: 700, opacity: commentText.trim() ? 1 : 0.55, cursor: commentText.trim() ? "pointer" : "not-allowed" }}
                    >
                      <Send size={15} /> Registrar
                    </button>
                  </div>
                </form>

                <div style={{ display: "flex", flexDirection: "column", gap: 0, maxHeight: 330, overflowY: "auto", padding: viewingComments.length ? "4px 2px 4px 0" : 0 }}>
                  {viewingComments.length === 0 ? (
                    <div style={{ border: "1px dashed var(--border)", borderRadius: 16, padding: 18, background: "var(--surface)", color: "var(--text-muted)", fontSize: 13, lineHeight: 1.55, display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <Clock3 size={18} />
                      <div>
                        <strong style={{ display: "block", color: "var(--text)", marginBottom: 4 }}>
                          Nenhum registro ainda
                        </strong>
                        Use este espaço para registrar atrasos, conferências, decisões, ajustes ou qualquer ocorrência importante desta OP.
                      </div>
                    </div>
                  ) : (
                    viewingComments.map((comment, index) => (
                      <div
                        key={comment.id}
                        style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 10, position: "relative", paddingBottom: index === viewingComments.length - 1 ? 0 : 14 }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                          <div style={{ width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center", border: "1px solid var(--border)", background: "var(--surface)", zIndex: 1 }}>
                            <MessageSquare size={14} />
                          </div>
                          {index !== viewingComments.length - 1 && (
                            <div style={{ width: 1, flex: 1, background: "var(--border)", marginTop: 6 }} />
                          )}
                        </div>
                        <div style={{ padding: 13, border: "1px solid var(--border)", borderRadius: 15, background: "var(--surface)", boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 7, alignItems: "center" }}>
                            <strong style={{ fontSize: 13 }}>{comment.author}</strong>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, margin: 0, lineHeight: 1.55 }}>{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="ops-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>OP {sortIcon("code")}</th>
                  <th>Ficha</th>
                  <th>Qtd {sortIcon("quantity")}</th>
                  <th>MP prevista</th>
                  <th>Prazo {sortIcon("dueDate")}</th>
                  <th>Etapa {sortIcon("stage")}</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {(groupedOrders
                  ? Array.from(groupedOrders.entries())
                  : [[null, sortedOrders] as [null, ProductionOrder[]]]
                ).map(([stage, ordersInGroup]) => (
                  <Fragment key={stage ?? "all"}>
                    {stage && (
                      <tr key={`group-${stage}`}>
                        <td colSpan={7} style={{ background: "var(--surface)", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", padding: "8px 10px" }}>
                          {stageLabels[stage]} · {ordersInGroup.length} OP(s)
                        </td>
                      </tr>
                    )}
                    {ordersInGroup.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>{order.code}</strong>
                          <span className="meta">{order.responsible}</span>
                        </td>
                        <td>{sheetLabel(order.sheetId)}</td>
                        <td>{order.quantity} un</td>
                        <td>{currency.format(orderMaterialCost(order))}</td>
                        <td>{new Date(`${order.dueDate}T00:00:00`).toLocaleDateString("pt-BR")}</td>
                        <td>
                          <span className="badge badge-blue">{stageLabels[order.stage]}</span>
                          {(order.comments?.length ?? 0) > 0 && (
                            <span
                              title={`${order.comments.length} comentário(s)`}
                              style={{ marginLeft: 6, fontSize: 11, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 2 }}
                            >
                              <MessageSquare size={12} /> {order.comments.length}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="icon-btn" type="button" onClick={() => setViewing(order)} title="Comentários da OP">
                              <MessageSquare size={16} />
                            </button>
                            {podeEditar && <button className="icon-btn" type="button" onClick={() => startEdit(order)} title="Editar OP"><Pencil size={16} /></button>}
                            {podeExcluir && <button className="icon-btn danger" type="button" onClick={() => confirmDelete(order)} title="Excluir OP"><Trash2 size={16} /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
              {filteredOrders.length > 0 && (
                <tfoot>
                  <tr style={{ fontWeight: 700, borderTop: "2px solid var(--border)" }}>
                    <td>Totais ({totals.count})</td>
                    <td>—</td>
                    <td>{totals.totalQuantity} un</td>
                    <td>{currency.format(totals.totalCost)}</td>
                    <td>—</td>
                    <td>{totals.avgProgress.toFixed(0)}% méd.</td>
                    <td>—</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {orders.length === 0 && <div className="empty-column">Nenhuma OP cadastrada ainda.</div>}
          {orders.length > 0 && filteredOrders.length === 0 && (
            <div className="empty-column">Nenhuma OP encontrada com os filtros atuais.</div>
          )}
        </div>
      </div>
    </Shell>
  );
}
"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  CheckCircle2,
  ClipboardList,
  Factory,
  Gauge,
  Layers,
  PackageCheck,
  PackagePlus,
  Search,
  SlidersHorizontal,
  X
} from "lucide-react";
import { Shell } from "./shared/shell";
import { useMvpData } from "./shared/store";
import { sheetMaterialCost } from "./shared/materials";
import type { Product, ProductionOrder, ProductionStage } from "./shared/types";

const stageLabels: Record<ProductionStage, string> = {
  recepcao: "Recepção",
  processamento: "Processamento",
  fabricacao: "Fabricação",
  qualidade: "Qualidade",
  embalagem: "Embalagem",
  concluido: "Concluído"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(`${value}T00:00:00`));
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function stageClass(stage: ProductionStage) {
  if (stage === "concluido") return "badge-green";
  if (stage === "qualidade" || stage === "embalagem") return "badge-blue";
  if (stage === "fabricacao") return "badge-orange";
  return "badge-purple";
}

export default function Home() {
  const { products, sheets, orders } = useMvpData();
  const activeOrders = orders.filter((order) => order.stage !== "concluido");
  const completedOrders = orders.filter((order) => order.stage === "concluido");
  const approvedSheets = sheets.filter((sheet) => sheet.status === "Aprovada");
  const averageProgress = activeOrders.length
    ? Math.round(activeOrders.reduce((total, order) => total + order.progress, 0) / activeOrders.length)
    : 0;
  const highPriorityOrders = activeOrders.filter((order) => order.priority === "Alta");
  const nextOrders = [...activeOrders]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const stageSummary = (Object.keys(stageLabels) as ProductionStage[]).map((stage) => ({
    stage,
    label: stageLabels[stage],
    count: orders.filter((order) => order.stage === stage).length
  }));
  const maxStageCount = Math.max(1, ...stageSummary.map((item) => item.count));

  // ---------- Relatório de OPs: filtro, pesquisa, ordenação, agrupamento, totais e gráficos ----------
  const todayIso = new Date().toISOString().slice(0, 10);

  function productNameForOrder(order: ProductionOrder) {
    const sheet = sheets.find((item) => item.id === order.sheetId);
    const product = products.find((item) => item.id === sheet?.productId);
    return product?.name || "Produto não encontrado";
  }

  function orderCost(order: ProductionOrder) {
    const sheet = sheets.find((item) => item.id === order.sheetId);
    return sheet ? sheetMaterialCost(sheet) * order.quantity : 0;
  }

  function isOverdue(order: ProductionOrder) {
    return order.stage !== "concluido" && order.dueDate < todayIso;
  }

  const [reportSearch, setReportSearch] = useState("");
  const [reportStatus, setReportStatus] = useState<"todas" | "abertas" | "concluidas" | "atrasadas">("todas");
  const [reportPriority, setReportPriority] = useState<ProductionOrder["priority"] | "todas">("todas");
  const [reportResponsible, setReportResponsible] = useState("todos");
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [reportGroup, setReportGroup] = useState(false);
  const [reportSortKey, setReportSortKey] = useState<"code" | "product" | "quantity" | "cost" | "priority" | "stage">("code");
  const [reportSortDir, setReportSortDir] = useState<"asc" | "desc">("asc");

  const reportResponsibleOptions = useMemo(
    () => Array.from(new Set(orders.map((order) => order.responsible))).sort(),
    [orders]
  );

  function applyPreset(preset: "semana" | "semana-passada" | "30dias" | "tudo") {
    const now = new Date();
    if (preset === "tudo") {
      setReportFrom("");
      setReportTo("");
      return;
    }
    if (preset === "30dias") {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      setReportFrom(start.toISOString().slice(0, 10));
      setReportTo(todayIso);
      return;
    }
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - mondayOffset);

    if (preset === "semana") {
      setReportFrom(startOfThisWeek.toISOString().slice(0, 10));
      setReportTo(todayIso);
      return;
    }
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setDate(startOfThisWeek.getDate() - 1);
    setReportFrom(startOfLastWeek.toISOString().slice(0, 10));
    setReportTo(endOfLastWeek.toISOString().slice(0, 10));
  }

  function toggleReportSort(key: typeof reportSortKey) {
    if (reportSortKey === key) {
      setReportSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setReportSortKey(key);
      setReportSortDir("asc");
    }
  }

  function clearReportFilters() {
    setReportSearch("");
    setReportStatus("todas");
    setReportPriority("todas");
    setReportResponsible("todos");
    setReportFrom("");
    setReportTo("");
  }

  const reportFiltersActive =
    reportSearch.trim() !== "" ||
    reportStatus !== "todas" ||
    reportPriority !== "todas" ||
    reportResponsible !== "todos" ||
    reportFrom !== "" ||
    reportTo !== "";

  const reportFiltered = useMemo(() => {
    const term = reportSearch.trim().toLowerCase();

    return orders.filter((order) => {
      if (reportStatus === "abertas" && order.stage === "concluido") return false;
      if (reportStatus === "concluidas" && order.stage !== "concluido") return false;
      if (reportStatus === "atrasadas" && !isOverdue(order)) return false;
      if (reportPriority !== "todas" && order.priority !== reportPriority) return false;
      if (reportResponsible !== "todos" && order.responsible !== reportResponsible) return false;
      if (reportFrom && order.dueDate < reportFrom) return false;
      if (reportTo && order.dueDate > reportTo) return false;

      if (term) {
        const haystack = `${order.code} ${productNameForOrder(order)} ${order.responsible} ${order.lot}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [orders, sheets, products, reportSearch, reportStatus, reportPriority, reportResponsible, reportFrom, reportTo, todayIso]);

  const reportSorted = useMemo(() => {
    const dir = reportSortDir === "asc" ? 1 : -1;
    return [...reportFiltered].sort((a, b) => {
      switch (reportSortKey) {
        case "product":
          return productNameForOrder(a).localeCompare(productNameForOrder(b)) * dir;
        case "quantity":
          return (a.quantity - b.quantity) * dir;
        case "cost":
          return (orderCost(a) - orderCost(b)) * dir;
        case "priority":
          return a.priority.localeCompare(b.priority) * dir;
        case "stage":
          return stageLabels[a.stage].localeCompare(stageLabels[b.stage]) * dir;
        case "code":
        default:
          return a.code.localeCompare(b.code) * dir;
      }
    });
  }, [reportFiltered, reportSortKey, reportSortDir]);

  const reportGrouped = useMemo(() => {
    if (!reportGroup) return null;
    const groups = new Map<ProductionStage, ProductionOrder[]>();
    reportSorted.forEach((order) => {
      const list = groups.get(order.stage) || [];
      list.push(order);
      groups.set(order.stage, list);
    });
    return groups;
  }, [reportGroup, reportSorted]);

  const reportTotals = useMemo(() => {
    const totalQuantity = reportFiltered.reduce((sum, order) => sum + order.quantity, 0);
    const totalCost = reportFiltered.reduce((sum, order) => sum + orderCost(order), 0);
    const avgProgress = reportFiltered.length
      ? reportFiltered.reduce((sum, order) => sum + order.progress, 0) / reportFiltered.length
      : 0;
    return { totalQuantity, totalCost, avgProgress, count: reportFiltered.length };
  }, [reportFiltered, sheets]);

  function sortIcon(key: typeof reportSortKey) {
    return (
      <button
        type="button"
        onClick={() => toggleReportSort(key)}
        style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit", padding: 0 }}
        title="Ordenar"
      >
        <ArrowUpDown size={12} style={{ opacity: reportSortKey === key ? 1 : 0.4 }} />
      </button>
    );
  }

  // Gráfico de barras: OPs por etapa (respeitando o filtro do relatório)
  const chartStageData = (Object.keys(stageLabels) as ProductionStage[])
    .map((stage) => ({ stage, label: stageLabels[stage], count: reportFiltered.filter((o) => o.stage === stage).length }))
    .filter((item) => item.count > 0);
  const maxChartStageCount = Math.max(1, ...chartStageData.map((item) => item.count));

  // Gráfico de pizza: OPs por prioridade (respeitando o filtro do relatório)
  const priorityColors: Record<ProductionOrder["priority"], string> = {
    Alta: "#ef4444",
    Média: "#f59e0b",
    Baixa: "#22c55e"
  };
  const chartPriorityData = (["Alta", "Média", "Baixa"] as ProductionOrder["priority"][])
    .map((priority) => ({ priority, count: reportFiltered.filter((o) => o.priority === priority).length }))
    .filter((item) => item.count > 0);
  const chartPriorityTotal = Math.max(1, chartPriorityData.reduce((sum, item) => sum + item.count, 0));

  function donutSegments(items: { value: number; color: string }[], radius: number) {
    const circumference = 2 * Math.PI * radius;
    const total = Math.max(1, items.reduce((sum, item) => sum + item.value, 0));
    let acc = 0;
    return items.map((item) => {
      const length = (item.value / total) * circumference;
      const segment = { color: item.color, dasharray: `${length} ${circumference - length}`, dashoffset: -acc };
      acc += length;
      return segment;
    });
  }

  const priorityDonut = donutSegments(
    chartPriorityData.map((item) => ({ value: item.count, color: priorityColors[item.priority] })),
    40
  );

  // Gráfico de linha: OPs concluídas por semana, últimas 8 semanas
  const weeklyCompletionData = useMemo(() => {
    const weeks: { label: string; start: string; end: string; count: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      weeks.push({
        label: `${start.getDate()}/${start.getMonth() + 1}`,
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        count: 0
      });
    }
    completedOrders.forEach((order) => {
      const week = weeks.find((w) => order.dueDate >= w.start && order.dueDate <= w.end);
      if (week) week.count += 1;
    });
    return weeks;
  }, [completedOrders]);
  const maxWeeklyCount = Math.max(1, ...weeklyCompletionData.map((w) => w.count));
  const weeklyPoints = weeklyCompletionData.map((w, index) => ({
    x: (index / (weeklyCompletionData.length - 1)) * 280 + 10,
    y: 78 - (w.count / maxWeeklyCount) * 62
  }));
  function smoothPath(points: { x: number; y: number }[]) {
    if (!points.length) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }
  const weeklyLinePath = smoothPath(weeklyPoints);
  const weeklyAreaPath = weeklyPoints.length
    ? `${weeklyLinePath} L ${weeklyPoints[weeklyPoints.length - 1].x} 84 L ${weeklyPoints[0].x} 84 Z`
    : "";
  const weeklyPeakIndex = weeklyCompletionData.reduce(
    (best, w, index) => (w.count > weeklyCompletionData[best].count ? index : best),
    0
  );

  // Gráfico de produtos: com ficha técnica x sem ficha técnica
  function productHasSheet(product: Product) {
    return sheets.some((sheet) => sheet.productId === product.id);
  }
  const [productChartFilter, setProductChartFilter] = useState<"todos" | "Ativo" | "Em desenvolvimento">("todos");
  const productChartBase = productChartFilter === "todos" ? products : products.filter((p) => p.status === productChartFilter);
  const productsWithSheet = productChartBase.filter(productHasSheet).length;
  const productsWithoutSheet = productChartBase.length - productsWithSheet;
  const productDonut = donutSegments(
    [
      { value: productsWithSheet, color: "#22c55e" },
      { value: productsWithoutSheet, color: "#ef4444" }
    ],
    40
  );

  return (
    <Shell active="dashboard">
      <div className="page-header">
        <div>
          <h2>Painel operacional</h2>
          <div className="subtitle">Acompanhamento consolidado da produção, cadastros técnicos e carteira de ordens.</div>
        </div>
        <Link className="btn btn-primary btn-lg" href="/ops">
          Ver OPs <ArrowRight size={18} />
        </Link>
      </div>

      <div className="kpi-hero-row">
        <div className="kpi-hero" style={{ background: "linear-gradient(135deg, #0f9b6c 0%, #34d399 100%)" }}>
          <div className="kpi-hero-label">Produtos ativos</div>
          <div className="kpi-hero-value">{products.filter((product) => product.status === "Ativo").length}</div>
          <div className="kpi-hero-icon"><PackagePlus size={20} /></div>
        </div>
        <div className="kpi-hero" style={{ background: "linear-gradient(135deg, #4338ca 0%, #3b82f6 100%)" }}>
          <div className="kpi-hero-label">Fichas aprovadas</div>
          <div className="kpi-hero-value">{approvedSheets.length}</div>
          <div className="kpi-hero-icon"><ClipboardList size={20} /></div>
        </div>
        <div className="kpi-compact">
          <div className="kpi-compact-icon" style={{ background: "#ef444422", color: "#ef4444" }}><Activity size={17} /></div>
          <div>
            <div className="kpi-compact-value">{activeOrders.length}</div>
            <div className="kpi-compact-label">OPs em aberto</div>
          </div>
        </div>
        <div className="kpi-compact">
          <div className="kpi-compact-icon" style={{ background: "#f59e0b22", color: "#f59e0b" }}><Gauge size={17} /></div>
          <div>
            <div className="kpi-compact-value">{averageProgress}%</div>
            <div className="kpi-compact-label">Avanço médio</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="card operations-panel">
          <div className="section-title">
            <div>
              <h3>Carteira de produção</h3>
              <p>Distribuição das ordens por etapa operacional.</p>
            </div>
            <Link className="btn btn-secondary compact-btn" href="/kanban">
              Kanban <ArrowRight size={14} />
            </Link>
          </div>
          <div className="stage-list">
            {stageSummary.map((item) => (
              <div className="stage-row" key={item.stage}>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.count} OP{item.count === 1 ? "" : "s"}</span>
                </div>
                <div className="stage-meter">
                  <span style={{ width: `${(item.count / maxStageCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card operations-panel">
          <div className="section-title">
            <div>
              <h3>Fila prioritária</h3>
              <p>Ordens abertas ordenadas pelo prazo de entrega.</p>
            </div>
            <span className={`badge ${highPriorityOrders.length ? "badge-red" : "badge-green"}`}>
              {highPriorityOrders.length} alta prioridade
            </span>
          </div>
          <div className="ops-list">
            {nextOrders.length ? nextOrders.map((order: ProductionOrder) => (
              <div className="ops-item" key={order.id}>
                <div>
                  <strong>{order.code}</strong>
                  <span>{order.quantity} un. • lote {order.lot}</span>
                </div>
                <div className="ops-item-status">
                  <span className={`badge ${stageClass(order.stage)}`}>{stageLabels[order.stage]}</span>
                  <small>{formatDate(order.dueDate)}</small>
                </div>
              </div>
            )) : (
              <div className="empty-state">Nenhuma ordem em aberto no momento.</div>
            )}
          </div>
        </section>
      </div>

      <section className="card table-card">
        <div className="section-title">
          <div>
            <h3>Relatório de Ordens de Produção</h3>
            <p>Filtre, pesquise, ordene e visualize os dados consolidados de todas as OPs.</p>
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
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
              style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 10px", background: "var(--surface)", color: "var(--text)", fontSize: 13 }}
            />
          </div>

          <select value={reportStatus} onChange={(e) => setReportStatus(e.target.value as typeof reportStatus)} style={{ borderRadius: 10, padding: "8px 10px", fontSize: 13 }}>
            <option value="todas">Todos os status</option>
            <option value="abertas">Em aberto</option>
            <option value="concluidas">Concluídas</option>
            <option value="atrasadas">Atrasadas</option>
          </select>

          <select value={reportPriority} onChange={(e) => setReportPriority(e.target.value as typeof reportPriority)} style={{ borderRadius: 10, padding: "8px 10px", fontSize: 13 }}>
            <option value="todas">Todas as prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>

          <select value={reportResponsible} onChange={(e) => setReportResponsible(e.target.value)} style={{ borderRadius: 10, padding: "8px 10px", fontSize: 13 }}>
            <option value="todos">Todos os usuários</option>
            {reportResponsibleOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
            <span>Período:</span>
            <input type="date" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} style={{ borderRadius: 10, padding: "7px 8px", fontSize: 12 }} />
            <span>até</span>
            <input type="date" value={reportTo} onChange={(e) => setReportTo(e.target.value)} style={{ borderRadius: 10, padding: "7px 8px", fontSize: 12 }} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}>
            <input type="checkbox" checked={reportGroup} onChange={(e) => setReportGroup(e.target.checked)} />
            <SlidersHorizontal size={13} /> Agrupar por etapa
          </label>

          {reportFiltersActive && (
            <button className="btn btn-secondary" type="button" onClick={clearReportFilters} style={{ fontSize: 12, padding: "7px 12px" }}>
              <X size={13} /> Limpar filtros
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>Atalhos de período:</span>
          <button className="btn btn-secondary" type="button" onClick={() => applyPreset("semana")} style={{ fontSize: 12, padding: "6px 10px" }}>Esta semana</button>
          <button className="btn btn-secondary" type="button" onClick={() => applyPreset("semana-passada")} style={{ fontSize: 12, padding: "6px 10px" }}>Semana passada</button>
          <button className="btn btn-secondary" type="button" onClick={() => applyPreset("30dias")} style={{ fontSize: 12, padding: "6px 10px" }}>Últimos 30 dias</button>
          <button className="btn btn-secondary" type="button" onClick={() => applyPreset("tudo")} style={{ fontSize: 12, padding: "6px 10px" }}>Tudo</button>
        </div>

        {reportFiltered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr", gap: 16, marginBottom: 20 }}>
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16, background: "var(--surface)" }}>
              <strong style={{ fontSize: 13 }}>OPs por etapa</strong>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 6, height: 120, marginTop: 16 }}>
                {chartStageData.map((item, index) => {
                  const hue = 150 + index * 25;
                  return (
                    <div key={item.stage} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{item.count}</span>
                      <div
                        style={{
                          width: "100%",
                          maxWidth: 26,
                          height: `${Math.max(6, (item.count / maxChartStageCount) * 84)}px`,
                          borderRadius: "8px 8px 3px 3px",
                          background: `linear-gradient(180deg, hsl(${hue} 80% 62%) 0%, hsl(${hue} 75% 42%) 100%)`
                        }}
                      />
                      <span style={{ fontSize: 9.5, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.2 }}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16, background: "var(--surface)" }}>
              <strong style={{ fontSize: 13 }}>OPs por prioridade</strong>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
                <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
                  <svg viewBox="0 0 100 100" width="100" height="100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="14" />
                    {priorityDonut.map((seg, index) => (
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="14"
                        strokeDasharray={seg.dasharray}
                        strokeDashoffset={seg.dashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    ))}
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <strong style={{ fontSize: 18, lineHeight: 1 }}>{chartPriorityTotal}</strong>
                    <span style={{ fontSize: 9, color: "var(--text-muted)" }}>OPs</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  {chartPriorityData.map((item) => (
                    <div key={item.priority} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 9, height: 9, borderRadius: "50%", background: priorityColors[item.priority], display: "inline-block" }} />
                        {item.priority}
                      </span>
                      <span style={{ fontWeight: 700 }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16, background: "var(--surface)", position: "relative" }}>
              <strong style={{ fontSize: 13 }}>OPs concluídas (últimas 8 semanas)</strong>
              <svg viewBox="0 0 300 90" width="100%" height="100" style={{ marginTop: 8, overflow: "visible" }}>
                <defs>
                  <linearGradient id="weeklyAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent, #3b82f6)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--accent, #3b82f6)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((line) => (
                  <line key={line} x1="10" x2="290" y1={20 + line * 18} y2={20 + line * 18} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 4" />
                ))}
                <path d={weeklyAreaPath} fill="url(#weeklyAreaFill)" stroke="none" />
                <path d={weeklyLinePath} fill="none" stroke="var(--accent, #3b82f6)" strokeWidth="2.5" />
                {weeklyPoints.map((p, index) => (
                  <circle key={weeklyCompletionData[index].start} cx={p.x} cy={p.y} r={index === weeklyPeakIndex ? 3.5 : 2.5} fill="var(--accent, #3b82f6)" />
                ))}
                {weeklyCompletionData[weeklyPeakIndex]?.count > 0 && (
                  <text
                    x={weeklyPoints[weeklyPeakIndex]?.x}
                    y={(weeklyPoints[weeklyPeakIndex]?.y ?? 0) - 8}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="var(--text)"
                  >
                    Máx: {weeklyCompletionData[weeklyPeakIndex]?.count}
                  </text>
                )}
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
                <span>{weeklyCompletionData[0]?.label}</span>
                <span>{weeklyCompletionData[weeklyCompletionData.length - 1]?.label}</span>
              </div>
            </div>
          </div>
        )}

        <div className="ops-table-wrap">
          <table>
            <thead>
              <tr>
                <th>OP {sortIcon("code")}</th>
                <th>Produto {sortIcon("product")}</th>
                <th>Qtd {sortIcon("quantity")}</th>
                <th>MP prevista {sortIcon("cost")}</th>
                <th>Prioridade {sortIcon("priority")}</th>
                <th>Status atual {sortIcon("stage")}</th>
              </tr>
            </thead>
            <tbody>
              {(reportGrouped ? Array.from(reportGrouped.entries()) : [[null, reportSorted] as [null, ProductionOrder[]]]).map(
                ([stage, group]) => (
                  <Fragment key={stage ?? "all"}>
                    {stage && (
                      <tr>
                        <td colSpan={6} style={{ background: "var(--surface)", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", padding: "8px 10px" }}>
                          {stageLabels[stage]} · {group.length} OP(s)
                        </td>
                      </tr>
                    )}
                    {group.map((order) => (
                      <tr key={order.id}>
                        <td><strong>{order.code}</strong>{isOverdue(order) && <span className="badge badge-red" style={{ marginLeft: 6 }}>Atrasada</span>}</td>
                        <td>{productNameForOrder(order)}</td>
                        <td>{order.quantity} un</td>
                        <td>{currency.format(orderCost(order))}</td>
                        <td>{order.priority}</td>
                        <td><span className={`badge ${stageClass(order.stage)}`}>{stageLabels[order.stage]}</span></td>
                      </tr>
                    ))}
                  </Fragment>
                )
              )}
            </tbody>
            {reportFiltered.length > 0 && (
              <tfoot>
                <tr style={{ fontWeight: 700, borderTop: "2px solid var(--border)" }}>
                  <td>Totais ({reportTotals.count})</td>
                  <td>—</td>
                  <td>{reportTotals.totalQuantity} un</td>
                  <td>{currency.format(reportTotals.totalCost)}</td>
                  <td>—</td>
                  <td>{reportTotals.avgProgress.toFixed(0)}% méd. progresso</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {orders.length > 0 && reportFiltered.length === 0 && (
          <div className="empty-state">Nenhuma OP encontrada com os filtros atuais.</div>
        )}
        {orders.length === 0 && <div className="empty-state">Nenhuma OP cadastrada ainda.</div>}
      </section>

      <section className="card">
        <div className="section-title">
          <div>
            <h3>Produtos: com x sem ficha técnica</h3>
            <p>Distribuição do portfólio conforme a existência de ficha técnica vinculada.</p>
          </div>
          <select value={productChartFilter} onChange={(e) => setProductChartFilter(e.target.value as typeof productChartFilter)} style={{ borderRadius: 10, padding: "7px 10px", fontSize: 12 }}>
            <option value="todos">Todos os produtos</option>
            <option value="Ativo">Somente ativos</option>
            <option value="Em desenvolvimento">Somente em desenvolvimento</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" width="100" height="100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="14" />
              {productDonut.map((seg, index) => (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="14"
                  strokeDasharray={seg.dasharray}
                  strokeDashoffset={seg.dashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              ))}
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <strong style={{ fontSize: 18, lineHeight: 1 }}>{productChartBase.length}</strong>
              <span style={{ fontSize: 9, color: "var(--text-muted)" }}>produtos</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 360, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                Com ficha técnica
              </span>
              <strong>{productsWithSheet}</strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                Sem ficha técnica
              </span>
              <strong>{productsWithoutSheet}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <div>
            <h3>Governança da operação</h3>
            <p>Indicadores de integridade para manter produto, engenharia e chão de fábrica alinhados.</p>
          </div>
        </div>
        <div className="governance-grid">
          <Link className="governance-tile" href="/produtos">
            <PackageCheck size={20} />
            <div>
              <strong>Portfólio industrial</strong>
              <span>{products.length} produtos cadastrados</span>
            </div>
          </Link>
          <Link className="governance-tile" href="/ficha-tecnica">
            <Layers size={20} />
            <div>
              <strong>Engenharia de produto</strong>
              <span>{sheets.length} fichas técnicas versionadas</span>
            </div>
          </Link>
          <Link className="governance-tile" href="/ordens">
            <Factory size={20} />
            <div>
              <strong>Planejamento de OPs</strong>
              <span>{completedOrders.length} concluídas no histórico</span>
            </div>
          </Link>
          <Link className="governance-tile" href="/ops">
            <AlertTriangle size={20} />
            <div>
              <strong>Controle de exceções</strong>
              <span>{highPriorityOrders.length} ordens exigem atenção</span>
            </div>
          </Link>
        </div>
      </section>
    </Shell>
  );
}
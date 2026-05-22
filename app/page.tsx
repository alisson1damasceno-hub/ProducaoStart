"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Factory,
  Gauge,
  Layers,
  PackageCheck,
  PackagePlus
} from "lucide-react";
import { Shell } from "./shared/shell";
import { useMvpData } from "./shared/store";
import type { ProductionOrder, ProductionStage } from "./shared/types";

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

      <div className="kpi-row compact">
        <div className="kpi">
          <div className="kpi-icon"><PackagePlus size={18} /></div>
          <div className="kpi-label">Produtos ativos</div>
          <div className="kpi-value">{products.filter((product) => product.status === "Ativo").length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><ClipboardList size={18} /></div>
          <div className="kpi-label">Fichas aprovadas</div>
          <div className="kpi-value">{approvedSheets.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><Activity size={18} /></div>
          <div className="kpi-label">OPs em aberto</div>
          <div className="kpi-value">{activeOrders.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><Gauge size={18} /></div>
          <div className="kpi-label">Avanço médio</div>
          <div className="kpi-value">{averageProgress}%</div>
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

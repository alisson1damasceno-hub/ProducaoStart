"use client";

import { ArrowLeft, ArrowRight, Boxes, CheckCircle2, Clock3, Coins, Flame, PackageCheck } from "lucide-react";
import { Shell } from "../shared/shell";
import { useMvpData } from "../shared/store";
import { sheetMaterialCost } from "../shared/materials";
import type { ProductionOrder, ProductionStage } from "../shared/types";

const stages: Array<{ key: ProductionStage; label: string; description: string }> = [
  { key: "recepcao", label: "Recepção", description: "Entrada e pesagem" },
  { key: "processamento", label: "Processamento", description: "Triagem e moagem" },
  { key: "fabricacao", label: "Fabricação", description: "Prensagem ou envase" },
  { key: "qualidade", label: "Qualidade", description: "Inspeção do lote" },
  { key: "embalagem", label: "Embalagem", description: "Rotulagem e expedição" },
  { key: "concluido", label: "Concluído", description: "Liberado ao estoque" }
];

const stageProgress: Record<ProductionStage, number> = {
  recepcao: 10,
  processamento: 30,
  fabricacao: 55,
  qualidade: 75,
  embalagem: 90,
  concluido: 100
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function priorityClass(priority: ProductionOrder["priority"]) {
  if (priority === "Alta") return "badge-red";
  if (priority === "Média") return "badge-orange";
  return "badge-green";
}

export default function KanbanPage() {
  const { products, sheets, orders, moveOrder } = useMvpData();
  const activeOrders = orders.filter((order) => order.stage !== "concluido");
  const completedOrders = orders.filter((order) => order.stage === "concluido");
  const highPriorityOrders = orders.filter((order) => order.priority === "Alta" && order.stage !== "concluido");
  const averageProgress = orders.length
    ? Math.round(orders.reduce((total, order) => total + order.progress, 0) / orders.length)
    : 0;

  function sheetInfo(sheetId: string, quantity: number) {
    const sheet = sheets.find((item) => item.id === sheetId);
    const product = products.find((item) => item.id === sheet?.productId);
    return {
      code: sheet?.code || "Sem FT",
      productName: product?.name || "Produto não encontrado",
      cycle: sheet?.cycleMinutes || 0,
      materialCost: sheet ? sheetMaterialCost(sheet) * quantity : 0
    };
  }

  function move(orderId: string, current: ProductionStage, direction: -1 | 1) {
    const index = stages.findIndex((stage) => stage.key === current);
    const nextStage = stages[index + direction]?.key;
    if (nextStage) moveOrder(orderId, nextStage);
  }

  return (
    <Shell active="kanban">
      <div className="kanban-hero">
        <div>
          <span className="eyebrow">Acompanhamento visual da produção</span>
          <h2>Kanban de produção</h2>
          <p>Movimente as ordens entre as etapas e mostre o fluxo funcionando de ponta a ponta, incluindo o impacto de MP.</p>
        </div>
        <div className="hero-progress">
          <span>Progresso médio</span>
          <strong>{averageProgress}%</strong>
          <div className="progress-mini">
            <div className="bar" style={{ width: `${averageProgress}%` }} />
          </div>
        </div>
      </div>

      <div className="kpi-row compact">
        <div className="kpi">
          <div className="kpi-icon"><Boxes size={18} /></div>
          <div className="kpi-label">OPs ativas</div>
          <div className="kpi-value">{activeOrders.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><Flame size={18} /></div>
          <div className="kpi-label">Prioridade alta</div>
          <div className="kpi-value">{highPriorityOrders.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><Clock3 size={18} /></div>
          <div className="kpi-label">Em andamento</div>
          <div className="kpi-value">{orders.filter((order) => order.stage !== "recepcao" && order.stage !== "concluido").length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><CheckCircle2 size={18} /></div>
          <div className="kpi-label">Concluídas</div>
          <div className="kpi-value">{completedOrders.length}</div>
        </div>
      </div>

      <div className="kanban-board">
        {stages.map((stage) => {
          const stageOrders = orders.filter((order) => order.stage === stage.key);
          return (
            <section className={`kanban-column ${stage.key}`} key={stage.key}>
              <div className="kanban-column-header">
                <div>
                  <strong>{stage.label}</strong>
                  <span>{stage.description}</span>
                </div>
                <div className="column-count">{stageOrders.length}</div>
              </div>

              <div className="kanban-column-body">
                {stageOrders.length === 0 ? (
                  <div className="empty-column">Sem OP nesta etapa</div>
                ) : (
                  stageOrders.map((order) => {
                    const info = sheetInfo(order.sheetId, order.quantity);
                    const progress = Math.max(order.progress, stageProgress[order.stage]);
                    return (
                      <article className={`kanban-card priority-${order.priority === "Alta" ? "high" : order.priority === "Média" ? "med" : "low"}`} key={order.id}>
                        <div className="kanban-card-top">
                          <div>
                            <span className="op-id">{order.code}</span>
                            <strong>{info.productName}</strong>
                          </div>
                          <span className={`badge ${priorityClass(order.priority)}`}>{order.priority}</span>
                        </div>

                        <div className="kanban-card-facts">
                          <span>{order.quantity} un</span>
                          <span>{order.lot}</span>
                          <span>{info.code}</span>
                          <span><Coins size={12} /> MP {currency.format(info.materialCost)}</span>
                        </div>

                        <div className="progress-block">
                          <div className="recycled-meter-top">
                            <span>Progresso da OP</span>
                            <strong>{progress}%</strong>
                          </div>
                          <div className="progress-mini">
                            <div className="bar" style={{ width: `${progress}%` }} />
                          </div>
                        </div>

                        <div className="op-meta">
                          <span>Prazo {new Date(`${order.dueDate}T00:00:00`).toLocaleDateString("pt-BR")}</span>
                          <span>{order.responsible}</span>
                        </div>

                        <div className="kanban-card-actions">
                          <button className="icon-btn" type="button" onClick={() => move(order.id, order.stage, -1)} disabled={stage.key === "recepcao"} title="Voltar etapa">
                            <ArrowLeft size={16} />
                          </button>
                          <button className="btn btn-secondary compact-btn" type="button" onClick={() => move(order.id, order.stage, 1)} disabled={stage.key === "concluido"}>
                            Avançar <ArrowRight size={16} />
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="kanban-footer">
        <PackageCheck size={18} />
        <span>Na apresentação, crie uma OP em Ordens e volte para esta tela: ela entra em Recepção, consome MP prevista e pode avançar até Concluído.</span>
      </div>
    </Shell>
  );
}

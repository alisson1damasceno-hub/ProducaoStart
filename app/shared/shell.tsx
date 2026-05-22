"use client";

import Link from "next/link";
import { BarChart3, ClipboardList, Factory, KanbanSquare, ListChecks, Package } from "lucide-react";
import { useMvpData } from "./store";

const nav = [
  { href: "/", key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/produtos", key: "produtos", label: "Produtos", icon: Package },
  { href: "/ficha-tecnica", key: "ficha", label: "Fichas Técnicas", icon: ClipboardList },
  { href: "/ordens", key: "ordens", label: "Ordens", icon: Factory },
  { href: "/ops", key: "ops", label: "Visão OPs", icon: ListChecks },
  { href: "/kanban", key: "kanban", label: "Kanban", icon: KanbanSquare }
];

export function Shell({ active, children }: { active: string; children: React.ReactNode }) {
  const { backendReady, lastError } = useMvpData();

  return (
    <div className="container">
      <header className="top">
        <div>
          <span className="eyebrow inverse">Start Solidarium</span>
          <h1>Produção integrada</h1>
          <p>Produtos, fichas técnicas, ordens e Kanban conectados para controle operacional.</p>
        </div>
      </header>

      <nav className="main" aria-label="Navegação principal">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link className={active === item.key ? "active" : ""} href={item.href} key={item.key}>
              <Icon size={16} /> {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={`system-status ${backendReady ? "online" : "offline"}`}>
        {backendReady ? "Base de dados sincronizada" : lastError || "Base de dados em modo local"}
      </div>

      {children}
    </div>
  );
}

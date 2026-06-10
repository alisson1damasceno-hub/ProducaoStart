"use client";

import Link from "next/link";
import { BarChart3, ClipboardList, Factory, KanbanSquare, ListChecks, Package } from "lucide-react";
import { useMvpData } from "./store";
import { supabase } from "../lib/supabaseClient";

const nav = [
  { href: "/", key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/produtos", key: "produtos", label: "Produtos", icon: Package },
  { href: "/ficha-tecnica", key: "ficha", label: "Fichas Técnicas", icon: ClipboardList },
  { href: "/ordens", key: "ordens", label: "Ordens", icon: Factory },
  { href: "/ops", key: "ops", label: "Visão OPs", icon: ListChecks },
  { href: "/kanban", key: "kanban", label: "Kanban", icon: KanbanSquare },
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

      <nav className="main" aria-label="Navegação principal" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link className={active === item.key ? "active" : ""} href={item.href} key={item.key}>
                <Icon size={16} /> {item.label}
              </Link>
            );
          })}
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/login";
          }}
          style={{
            background: "#dc2626",
            border: "none",
            color: "white",
            padding: "6px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 2px 6px rgba(220,38,38,0.3)"
          }}
        >
          Sair
        </button>
      </nav>

      <div className={`system-status ${backendReady ? "online" : "offline"}`}>
        {backendReady ? "Base de dados sincronizada" : lastError || "Base de dados em modo local"}
      </div>

      {children}
    </div>
  );
}

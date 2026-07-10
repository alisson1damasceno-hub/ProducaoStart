"use client";

import { useEffect, useState } from "react";
import { Shell } from "../shared/shell";
import { usePapel } from "../login/usePapel";
import type { Papel } from "../login/types";
import { PlusCircle, X } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

type Usuario = {
  id: string;
  email: string;
  nome: string;
  papel: Papel;
};

export default function GerenciarUsuariosPage() {
  const { podeGerenciar, carregando: carregandoPapel } = usePapel();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<string | null>(null);

  // Estado do formulário de criação
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [criando, setCriando] = useState(false);
  const [erroCriacao, setErroCriacao] = useState<string | null>(null);
  const [emailUsuarioLogado, setEmailUsuarioLogado] = useState<string | null>(null);

  useEffect(() => {
    const supabaseBrowser = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setEmailUsuarioLogado(data.session?.user.email ?? null);
    });
  }, []);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("/api/usuarios");
        if (!res.ok) throw new Error("Erro ao carregar usuários");
        const data = await res.json();
        setUsuarios(data);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro desconhecido");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  async function alterarPapel(id: string, papel: Papel) {
    setSalvando(id);
    try {
      const res = await fetch("/api/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, papel }),
      });
      if (!res.ok) throw new Error("Erro ao alterar papel");
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, papel } : u))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSalvando(null);
    }
  }

  async function criarUsuario() {
    setErroCriacao(null);
    if (!novoNome || !novoEmail || !novaSenha) {
      setErroCriacao("Preencha todos os campos.");
      return;
    }
    setCriando(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome, email: novoEmail, senha: novaSenha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Erro ao criar usuário");
      setUsuarios((prev) => [...prev, data]);
      setMostrarForm(false);
      setNovoNome("");
      setNovoEmail("");
      setNovaSenha("");
    } catch (e) {
      setErroCriacao(e instanceof Error ? e.message : "Erro ao criar usuário");
    } finally {
      setCriando(false);
    }
  }

  if (carregandoPapel) {
    return <Shell active="gerenciar"><div className="empty-column">Carregando...</div></Shell>;
  }

  if (!podeGerenciar) {
    return <Shell active="gerenciar"><div className="empty-column">Acesso restrito.</div></Shell>;
  }

  return (
    <Shell active="gerenciar">
      <div className="page-header">
        <div>
          <h2>Gerenciar Usuários</h2>
          <p className="subtitle">Visualize e altere o papel de cada usuário do sistema.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setMostrarForm(true); setErroCriacao(null); }}
        >
          <PlusCircle size={16} /> Novo Usuário
        </button>
      </div>

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3>Novo Usuário</h3>
            <button className="icon-btn" onClick={() => setMostrarForm(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="row">
            <div className="form-group">
              <label className="required">Nome</label>
              <input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="form-group">
              <label className="required">Email</label>
              <input
                type="email"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="form-group">
              <label className="required">Senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Senha inicial"
              />
            </div>
          </div>
          {erroCriacao && (
            <p style={{ color: "#ef4444", fontSize: 13, marginTop: 8 }}>{erroCriacao}</p>
          )}
          <div className="form-actions">
            <button className="btn btn-primary" onClick={criarUsuario} disabled={criando}>
              {criando ? "Criando..." : "Criar usuário"}
            </button>
            <button className="btn btn-secondary" onClick={() => setMostrarForm(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {erro ? (
          <div className="empty-column">{erro}</div>
        ) : carregando ? (
          <div className="empty-column">Carregando usuários...</div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Papel</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.nome || "—"}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.papel}
                      disabled={salvando === u.id || u.email === emailUsuarioLogado}
                      onChange={(e) => alterarPapel(u.id, e.target.value as Papel)}
                      style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e4e4e7" }}
                    >
                      <option value="operario">Operário</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                    {salvando === u.id && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: "#71717a" }}>Salvando...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}


"use client";

import { useEffect, useState } from "react";
import { Shell } from "../shared/shell";
import { usePapel } from "../login/usePapel";
import type { Papel } from "../login/types";

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
  const [salvando, setSalvando] = useState<string | null>(null); // id do usuário sendo salvo

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
      </div>

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
                      disabled={salvando === u.id}
                      onChange={(e) => alterarPapel(u.id, e.target.value as Papel)}
                      className="form-group"
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
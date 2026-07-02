"use client";

import { useEffect, useState } from "react";
import { Shell } from "../shared/shell";
import { sessaoAtual, atualizarPerfil } from "../login/authApi";
import { AvatarPreview } from "../login/AvatarPreview";
import type { Sessao, TomPele, CorRoupa, Papel } from "../login/types";

const TONS_PELE: TomPele[] = ["tom1", "tom2", "tom3", "tom4"];
const CORES_ROUPA: CorRoupa[] = ["azul", "rosa", "verde", "vermelho"];

const CORES_HEX: Record<TomPele | CorRoupa, string> = {
  tom1: "#F0C08A",
  tom2: "#C68642",
  tom3: "#8D5524",
  tom4: "#3F2818",
  azul: "#378ADD",
  rosa: "#D4537E",
  verde: "#639922",
  vermelho: "#E24B4A",
};

const LABEL_PAPEL: Record<Papel, string> = {
  operario: "Operário",
  admin: "Admin",
  owner: "Owner",
};

export default function PerfilPage() {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [pele, setPele] = useState<TomPele>("tom2");
  const [roupa, setRoupa] = useState<CorRoupa>("verde");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: "sucesso" | "erro" } | null>(null);

  useEffect(() => {
    sessaoAtual().then((s) => {
      setSessao(s);
      if (s) {
        setNome(s.usuario.nome);
        setPele(s.usuario.avatar.pele);
        setRoupa(s.usuario.avatar.roupa);
      }
      setCarregando(false);
    });
  }, []);

  async function salvar() {
    setSalvando(true);
    setMensagem(null);
    try {
      await atualizarPerfil({
        nome: nome.trim(),
        avatar: { pele, roupa, cabelo: "nenhum" },
      });
      setMensagem({ texto: "Perfil atualizado com sucesso.", tipo: "sucesso" });
      const atualizada = await sessaoAtual();
      setSessao(atualizada);
    } catch (e) {
      setMensagem({ texto: e instanceof Error ? e.message : "Não foi possível salvar.", tipo: "erro" });
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <Shell active="perfil">
        <div className="empty-column">Carregando perfil…</div>
      </Shell>
    );
  }

  if (!sessao) {
    return (
      <Shell active="perfil">
        <div className="empty-column">Não foi possível carregar a sessão.</div>
      </Shell>
    );
  }

  return (
    <Shell active="perfil">
      <div className="page-header">
        <div>
          <h2>Meu perfil</h2>
          <p className="subtitle">Edite seu apelido e personalize seu avatar.</p>
        </div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 480 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <AvatarPreview pele={pele} roupa={roupa} size={72} />
          <div>
            <strong style={{ fontSize: 18 }}>{sessao.usuario.nome}</strong>
            <div className="subtitle">{sessao.usuario.email}</div>
            <span className="badge badge-blue" style={{ marginTop: 6, display: "inline-block" }}>
              {LABEL_PAPEL[sessao.usuario.papel]}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>Apelido</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu apelido" />
        </div>

        <div className="form-group">
          <label>Tom de pele</label>
          <div style={{ display: "flex", gap: 8 }}>
            {TONS_PELE.map((tom) => (
              <button
                key={tom}
                type="button"
                onClick={() => setPele(tom)}
                title={`Tom ${tom.slice(3)}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: CORES_HEX[tom],
                  border: pele === tom ? "3px solid var(--brand)" : "2px solid var(--border-input)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Cor da roupa</label>
          <div style={{ display: "flex", gap: 8 }}>
            {CORES_ROUPA.map((cor) => (
              <button
                key={cor}
                type="button"
                onClick={() => setRoupa(cor)}
                title={cor}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: CORES_HEX[cor],
                  border: roupa === cor ? "3px solid var(--brand)" : "2px solid var(--border-input)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        {mensagem && (
          <div className={`badge ${mensagem.tipo === "sucesso" ? "badge-green" : "badge-orange"}`} style={{ alignSelf: "flex-start" }}>
            {mensagem.texto}
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-primary" type="button" onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar"}
          </button>
        </div>

      </div>
    </Shell>
  );
}

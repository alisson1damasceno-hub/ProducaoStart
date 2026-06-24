"use client";

import { useState } from "react";
import { Check, Copy, Link, Mail, Share2, X, Zap } from "lucide-react";

type ShareTarget = "os" | "pedidos" | "nf";
type ShareMethod = "link" | "email" | "api";

const targetLabels: Record<ShareTarget, string> = {
  os: "Ordens de Serviço",
  pedidos: "Pedidos",
  nf: "Notas Fiscais",
};

const methodLabels: Record<ShareMethod, string> = {
  link: "Link compartilhável",
  email: "E-mail",
  api: "API / Webservice",
};

const methodIcons: Record<ShareMethod, React.ReactNode> = {
  link: <Link size={15} />,
  email: <Mail size={15} />,
  api: <Zap size={15} />,
};

function generateFakeLink(target: ShareTarget) {
  const token = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `https://start.solidarium.app/share/${target}/${token}`;
}

function generateFakeApiSnippet(target: ShareTarget) {
  return `GET /api/v1/${target}
Authorization: Bearer <seu_token>
Accept: application/json

# Exemplo de resposta
{
  "data": [...],
  "total": 2,
  "exportedAt": "${new Date().toISOString()}"
}`;
}

interface ShareModalProps {
  onClose: () => void;
}

export function ShareModal({ onClose }: ShareModalProps) {
  const [target, setTarget] = useState<ShareTarget>("os");
  const [method, setMethod] = useState<ShareMethod>("link");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const fakeLink = generateFakeLink(target);
  const fakeSnippet = generateFakeApiSnippet(target);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSend() {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1800);
  }

  return (
    <div className="share-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="share-modal">
        {/* header */}
        <div className="share-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Share2 size={18} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Compartilhar dados</h3>
          </div>
          <button className="icon-btn" onClick={onClose} title="Fechar">
            <X size={16} />
          </button>
        </div>

        {/* o que compartilhar */}
        <div className="share-section">
          <label className="share-label">O que compartilhar</label>
          <div className="share-chips">
            {(["os", "pedidos", "nf"] as ShareTarget[]).map((t) => (
              <button
                key={t}
                className={`share-chip ${target === t ? "active" : ""}`}
                onClick={() => setTarget(t)}
              >
                {targetLabels[t]}
              </button>
            ))}
          </div>
        </div>

        {/* como compartilhar */}
        <div className="share-section">
          <label className="share-label">Como compartilhar</label>
          <div className="share-chips">
            {(["link", "email", "api"] as ShareMethod[]).map((m) => (
              <button
                key={m}
                className={`share-chip ${method === m ? "active" : ""}`}
                onClick={() => setMethod(m)}
              >
                {methodIcons[m]} {methodLabels[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="share-content">
          {method === "link" && (
            <div className="share-link-box">
              <span className="share-link-text">{fakeLink}</span>
              <button
                className={`btn ${copied ? "btn-success" : "btn-secondary"}`}
                onClick={() => handleCopy(fakeLink)}
                style={{ minWidth: 90, fontSize: 13 }}
              >
                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
              </button>
            </div>
          )}

          {method === "email" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Destinatário</label>
                <input
                  type="email"
                  placeholder="email@empresa.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted, #888)" }}>
                Um link com acesso temporário a <strong>{targetLabels[target]}</strong> será enviado para o destinatário.
              </p>
              <button
                className="btn btn-primary"
                onClick={handleSend}
                disabled={!email || sent}
                style={{ alignSelf: "flex-start" }}
              >
                {sent ? <><Check size={15} /> Enviado!</> : <><Mail size={15} /> Enviar</>}
              </button>
            </div>
          )}

          {method === "api" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <pre className="share-code-block">{fakeSnippet}</pre>
              <button
                className={`btn ${copied ? "btn-success" : "btn-secondary"}`}
                onClick={() => handleCopy(fakeSnippet)}
                style={{ alignSelf: "flex-start", fontSize: 13 }}
              >
                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar snippet</>}
              </button>
            </div>
          )}
        </div>

        <p className="share-disclaimer">
          Protótipo — os links e tokens gerados são ilustrativos e não estão ativos.
        </p>
      </div>
    </div>
  );
}

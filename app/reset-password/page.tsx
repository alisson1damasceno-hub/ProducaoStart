"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { atualizarSenha } from "../login/authApi";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setEnviando(true);
      await atualizarSenha(senha);
      router.replace("/login");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível atualizar a senha.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 380 }}>
        <div className="section-title">
          <div>
            <h3>Nova senha</h3>
            <p>Defina uma nova senha para sua conta.</p>
          </div>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="required">Nova senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••"
            />
          </div>

          <div className="form-group">
            <label className="required">Confirmar senha</label>
            <input
              type="password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder="••••••"
            />
          </div>

          {erro && (
            <div className="badge badge-orange" style={{ alignSelf: "flex-start" }}>
              {erro}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={enviando}>
            <KeyRound size={17} /> {enviando ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Mail } from "lucide-react";
import { entrar, esqueceuSenha, sessaoAtual } from "./authApi";
import { supabase } from "../../lib/supabase";

type Modo = "entrar" | "esqueceu";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    sessaoAtual().then((s) => {
      if (s) router.replace("/");
      else setVerificando(false);
    });
  }, [router]);

  function trocarModo(novoModo: Modo) {
    setModo(novoModo);
    setErro(null);
    setSucesso(null);
    setSenha("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSucesso(null);
    setEnviando(true);
    try {
      if (modo === "entrar") {
        await entrar({ email, senha });

        // Verifica se o usuário já aceitou os termos
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: termos } = await supabase
            .from("termos_aceitos")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();
          window.location.href = termos ? "/" : "/termos";
        } else {
          router.replace("/");
        }
      } else {
        await esqueceuSenha(email);
        setSucesso("Se esse e-mail estiver cadastrado, você receberá um link em instantes.");
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível continuar.");
    } finally {
      setEnviando(false);
    }
  }

  if (verificando) return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
      Carregando…
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "var(--bg)" }}>
      <div className="card" style={{ width: "100%", maxWidth: 400 }}>
        <div className="section-title">
          <div>
            <h3 style={{ color: "var(--heading)" }}>ProducaoStart</h3>
            <p>
              {modo === "entrar" && "Entre para acessar o sistema."}
              {modo === "esqueceu" && "Informe seu e-mail para recuperar o acesso."}
            </p>
          </div>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="required">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>

          {modo === "entrar" && (
            <div className="form-group">
              <label className="required">Senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••" />
            </div>
          )}

          {modo === "entrar" && (
            <button type="button" onClick={() => trocarModo("esqueceu")}
              style={{ background: "none", border: "none", color: "var(--heading)", fontSize: 13, cursor: "pointer", padding: 0, textAlign: "left", textDecoration: "underline" }}>
              Esqueci minha senha
            </button>
          )}

          {erro && <div className="badge badge-orange" style={{ alignSelf: "flex-start" }}>{erro}</div>}
          {sucesso && <div className="badge badge-green" style={{ alignSelf: "flex-start" }}>{sucesso}</div>}

          <button className="btn btn-primary" type="submit" disabled={enviando} style={{ background: "var(--brand)" }}>
            {modo === "entrar" && <><LogIn size={16} /> {enviando ? "Entrando…" : "Entrar"}</>}
            {modo === "esqueceu" && <><Mail size={16} /> {enviando ? "Enviando…" : "Enviar link"}</>}
          </button>
        </form>

        {modo === "esqueceu" && (
          <p style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>
            <button type="button" onClick={() => trocarModo("entrar")}
              style={{ background: "none", border: "none", color: "var(--heading)", fontWeight: 700, cursor: "pointer", padding: 0 }}>
              Voltar para o login
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

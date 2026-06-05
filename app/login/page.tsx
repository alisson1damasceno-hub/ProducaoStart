"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

type Modo = "entrar" | "criar";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("entrar");
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    try {
      setEnviando(true);

      if (modo === "entrar") {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usuario,
    password: senha,
  });
  console.log("login result:", data, error);
  if (error) throw new Error(error.message);
}

      // Aguarda a sessão ser estabelecida
      // Aguarda a sessão ser estabelecida
      await new Promise(resolve => setTimeout(resolve, 500));
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão inválida.");

      const { data: termos } = await supabase
    .from("termos_aceitos")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

window.location.href = termos ? "/" : "/termos";

    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível continuar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#f4f4f5" }}>
      <div className="card" style={{ width: "100%", maxWidth: 380 }}>
        <div className="section-title">
          <div>
            <h3>Produção Start</h3>
            <p>{modo === "entrar" ? "Entre para acessar o sistema." : "Crie sua conta para começar."}</p>
          </div>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {modo === "criar" && (
            <div className="form-group">
              <label className="required">Nome</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" required />
            </div>
          )}

          <div className="form-group">
            <label className="required">Email</label>
            <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="ex: voce@exemplo.com" required />
          </div>

          <div className="form-group">
            <label className="required">Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••" required />
          </div>

          {erro && <div className="badge badge-orange" style={{ alignSelf: "flex-start" }}>{erro}</div>}

          <button className="btn btn-primary" type="button" onClick={submit as any} disabled={enviando}>
            {modo === "entrar" ? <LogIn size={17} /> : <UserPlus size={17} />}{" "}
            {enviando ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 13, color: "#71717a" }}>
          {modo === "entrar" ? (
            <>Não tem conta?{" "}
              <button type="button" onClick={() => { setModo("criar"); setErro(null); }}
                style={{ background: "none", border: "none", color: "#14532d", fontWeight: 700, cursor: "pointer", padding: 0 }}>
                Criar conta
              </button>
            </>
          ) : (
            <>Já tem conta?{" "}
              <button type="button" onClick={() => { setModo("entrar"); setErro(null); }}
                style={{ background: "none", border: "none", color: "#14532d", fontWeight: 700, cursor: "pointer", padding: 0 }}>
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
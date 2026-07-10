"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { sair } from "./authApi";
import type { Sessao } from "./types";
import Link from "next/link";
import { AvatarPreview } from "./AvatarPreview";
import type { Papel } from "./types";
import { verificarTermosAceitos } from "../termos/termosApi";

function Carregando() {
  return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
      Carregando…
    </div>
  );
}

const LABEL_PAPEL: Record<Papel, string> = {
  operario: "Operário",
  admin: "Admin",
  owner: "Owner",
};

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [termosAceitos, setTermosAceitos] = useState<boolean | null>(null);
  const ehLogin = pathname === "/login";
  const ehTermos = pathname === "/termos";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setSessao({
          usuario: {
            id: data.session.user.id,
            nome: data.session.user.user_metadata?.nome ?? data.session.user.email ?? "Usuário",
            email: data.session.user.email ?? "",
            papel: data.session.user.user_metadata?.papel ?? "operario",
            avatar: data.session.user.user_metadata?.avatar ?? {
              pele: "tom2",
              roupa: "verde",
              cabelo: "nenhum",
            },
          },
          token: data.session.access_token,
          expiraEm: data.session.expires_at
            ? new Date(data.session.expires_at * 1000).toISOString()
            : "",
        });
      } else {
        setSessao(null);
      }
      setVerificando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSessao({
          usuario: {
            id: session.user.id,
            nome: session.user.user_metadata?.nome ?? session.user.email ?? "Usuário",
            email: session.user.email ?? "",
            papel: session.user.user_metadata?.papel ?? "operario",
            avatar: session.user.user_metadata?.avatar ?? {
              pele: "tom2",
              roupa: "verde",
              cabelo: "nenhum",
            },
          },
          token: session.access_token,
          expiraEm: session.expires_at
            ? new Date(session.expires_at * 1000).toISOString()
            : "",
        });
      } else {
        setSessao(null);
      }
      setVerificando(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessao) {
      setTermosAceitos(null);
      return;
    }
    let ativo = true;
    verificarTermosAceitos()
      .then((aceitos) => {
        if (ativo) setTermosAceitos(aceitos);
      })
      .catch(() => {
        if (ativo) setTermosAceitos(false);
      });
    return () => {
      ativo = false;
    };
    // Reexecuta a cada troca de rota para refletir o aceite assim que ele acontecer,
    // sem exigir um novo login nem pedir aceite duas vezes.
  }, [sessao, pathname]);

  useEffect(() => {
    if (verificando) return;
    if (!sessao) {
      if (!ehLogin) router.replace("/login");
      return;
    }
    if (termosAceitos === false && !ehTermos) {
      router.replace("/termos");
    }
  }, [verificando, sessao, termosAceitos, ehTermos, ehLogin, router]);

  if (ehLogin) return <>{children}</>;
  if (verificando) return <Carregando />;
  if (!sessao) return <Carregando />;
  if (termosAceitos === null) return <Carregando />;
  if (termosAceitos === false) {
    // Ainda não aceitou: na própria tela de termos, libera sem a barra superior
    // (evita o atalho de "Editar perfil" escapando da tela de aceite).
    // Em qualquer outra rota, o efeito acima já está redirecionando para /termos.
    if (ehTermos) return <>{children}</>;
    return <Carregando />;
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, padding: "6px 16px", fontSize: 13, color: "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
        <AvatarPreview pele={sessao.usuario.avatar.pele} roupa={sessao.usuario.avatar.roupa} size={28} />
      <span>
        Logado como <strong>{sessao.usuario.nome}</strong>
      </span>
      <span className="badge badge-blue" style={{ fontSize: 11 }}>
        {LABEL_PAPEL[sessao.usuario.papel]}
      </span>
      <Link href="/perfil" className="btn btn-secondary" style={{ padding: "4px 12px", fontSize: 12, textDecoration: "none" }}>
        Editar perfil
      </Link>
        <button className="btn btn-secondary" type="button"
          onClick={async () => { await sair(); router.replace("/login"); }}
          style={{ padding: "4px 12px", fontSize: 12 }}>
          <LogOut size={13} /> Sair
        </button>
      </div>
      {children}
    </>
  );
}

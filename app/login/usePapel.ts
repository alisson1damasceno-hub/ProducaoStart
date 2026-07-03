"use client";
 
// Hook de permissões — fonte única da verdade sobre o que cada cargo pode fazer.
//
// USO em qualquer componente:
//   const { podeEditar, podeExcluir, podeGerenciar } = usePapel();
//
// Regras:
//   operario → lê tudo + cria/edita ordens
//   admin    → tudo acima + CRUD de produtos e fichas + exclui ordens
//   owner    → tudo acima + gerencia usuários e cargos
 
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Papel } from "./types";
 
type RetornoUsePapel = {
  papel: Papel | null;   // null enquanto ainda está carregando
  carregando: boolean;
  podeEditar: boolean;    // criar e editar produtos e fichas
  podeExcluir: boolean;   // excluir qualquer registro
  podeGerenciar: boolean; // acessar área de usuários/cargos
};
 
export function usePapel(): RetornoUsePapel {
  const [papel, setPapel] = useState<Papel | null>(null);
  const [carregando, setCarregando] = useState(true);
 
  useEffect(() => {
    // Leitura inicial da sessão ao montar o componente
    supabase.auth.getSession().then(({ data }) => {
      const p = (data.session?.user?.user_metadata?.papel ?? "operario") as Papel;
      setPapel(p);
      setCarregando(false);
    });
 
    // Fica ouvindo mudanças de sessão (ex: logout em outra aba)
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, session) => {
      const p = (session?.user?.user_metadata?.papel ?? "operario") as Papel;
      setPapel(session ? p : null);
      setCarregando(false);
    });
 
    // Limpa o listener quando o componente sai da tela
    return () => listener.subscription.unsubscribe();
  }, []);
 
  return {
    papel,
    carregando,
    podeEditar:    papel === "admin" || papel === "owner",
    podeExcluir:   papel === "admin" || papel === "owner",
    podeGerenciar: papel === "owner",
  };
}
 
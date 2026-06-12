import { supabase } from "../../lib/supabase";
import type { Credenciais, NovoUsuario, Sessao } from "./types";

function toSessao(user: any, session: any): Sessao {
  return {
    usuario: {
      id: user.id,
      nome: user.user_metadata?.nome ?? user.email ?? "Usuário",
      email: user.email ?? "",
    },
    token: session.access_token,
    expiraEm: session.expires_at
      ? new Date(session.expires_at * 1000).toISOString()
      : "",
  };
}

export async function entrar(cred: Credenciais): Promise<Sessao> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cred.email.trim(),
    password: cred.senha,
  });
  if (error || !data.session || !data.user) {
    if (error?.message?.includes("Invalid login credentials")) {
      throw new Error("E-mail ou senha inválidos.");
    }
    throw new Error(error?.message ?? "Não foi possível fazer login.");
  }
  return toSessao(data.user, data.session);
}

export async function registrar(novo: NovoUsuario): Promise<Sessao> {
  const nome = novo.nome.trim();
  const email = novo.email.trim();
  if (!nome || !email || !novo.senha) {
    throw new Error("Preencha nome, e-mail e senha.");
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password: novo.senha,
    options: { data: { nome } },
  });
  if (error) {
    if (error.message?.includes("already registered")) {
      throw new Error("Este e-mail já está cadastrado.");
    }
    throw new Error(error.message ?? "Não foi possível criar a conta.");
  }
  if (!data.session || !data.user) {
    throw new Error("Conta criada! Verifique seu e-mail para confirmar.");
  }
  return toSessao(data.user, data.session);
}

export async function esqueceuSenha(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw new Error(error.message);
}

export async function sair(): Promise<void> {
  await supabase.auth.signOut();
}

export async function sessaoAtual(): Promise<Sessao | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;
    return toSessao(data.session.user, data.session);
  } catch {
    return null;
  }
}

export async function atualizarSenha(novaSenha: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: novaSenha,
  });
  if (error) throw new Error(error.message);
}

import { supabase } from "@/app/lib/supabaseClient";

export type Credenciais = {
  usuario: string;
  senha: string;
};

export type NovoUsuario = {
  nome: string;
  usuario: string;
  senha: string;
};

export type Sessao = {
  usuario: {
    id: string;
    nome: string;
    usuario: string;
  };
  token: string;
  criadaEm: string;
};

export async function entrar(cred: Credenciais): Promise<Sessao> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cred.usuario,
    password: cred.senha,
  });

  if (error) throw new Error(error.message);
  if (!data.user || !data.session) throw new Error("Sessão inválida.");

  return {
    usuario: {
      id: data.user.id,
      nome: data.user.user_metadata.full_name ?? "Usuário",
      usuario: data.user.email ?? "",
    },
    token: data.session.access_token,
    criadaEm: new Date().toISOString(),
  };
}

export async function registrar(novo: NovoUsuario): Promise<Sessao> {
  const { data, error } = await supabase.auth.signUp({
    email: novo.usuario,
    password: novo.senha,
    options: {
      data: { full_name: novo.nome },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user || !data.session) throw new Error("Erro ao registrar.");

  return {
    usuario: {
      id: data.user.id,
      nome: novo.nome,
      usuario: data.user.email ?? "",
    },
    token: data.session.access_token,
    criadaEm: new Date().toISOString(),
  };
}

export async function sair(): Promise<void> {
  await supabase.auth.signOut();
}

export async function sessaoAtual(): Promise<Sessao | null> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user) return null;

  return {
    usuario: {
      id: session.user.id,
      nome: session.user.user_metadata.full_name ?? "Usuário",
      usuario: session.user.email ?? "",
    },
    token: session.access_token,
    criadaEm: new Date().toISOString(),
  };
}
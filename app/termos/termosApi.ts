import { supabase } from "@/app/lib/supabaseClient";

export async function verificarTermosAceitos(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("termos_aceitos")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao verificar termos:", error.message);
    return false;
  }

  return data !== null;
}

export async function aceitarTermos(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado.");

  const { error } = await supabase
    .from("termos_aceitos")
    .insert({ user_id: user.id });

  if (error) {
    throw new Error("Não foi possível salvar a aceitação dos termos.");
  }
}
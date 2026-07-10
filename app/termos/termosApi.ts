import { supabase } from "../../lib/supabase";

export async function verificarTermosAceitos() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("termos_aceitos")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  return !!data;
}

export async function aceitarTermos() {
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  

  if (!user) throw new Error("Usuário não autenticado.");

  const { error } = await supabase
    .from("termos_aceitos")
    .upsert(
      {
        user_id: user.id,
        aceito_em: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) throw error;
}
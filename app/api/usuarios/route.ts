import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Papel } from "../../login/types";

function criarClienteAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/usuarios — lista todos os usuários
export async function GET() {
  try {
    const admin = criarClienteAdmin();
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) throw error;

    const usuarios = data.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      nome: (u.user_metadata?.nome as string) ?? "",
      papel: (u.user_metadata?.papel as Papel) ?? "operario",
    }));

    return NextResponse.json(usuarios);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

// PATCH /api/usuarios — altera o papel de um usuário
export async function PATCH(request: Request) {
  try {
    const { id, papel } = await request.json() as { id: string; papel: Papel };

    if (!id || !papel) {
      return NextResponse.json({ erro: "id e papel são obrigatórios" }, { status: 400 });
    }

    const papeis: Papel[] = ["operario", "admin", "owner"];
    if (!papeis.includes(papel)) {
      return NextResponse.json({ erro: "papel inválido" }, { status: 400 });
    }

    const admin = criarClienteAdmin();
    const { error } = await admin.auth.admin.updateUserById(id, {
      user_metadata: { papel },
    });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

// POST /api/usuarios — cria novo usuário
export async function POST(request: Request) {
  try {
    const { nome, email, senha } = await request.json() as {
      nome: string;
      email: string;
      senha: string;
    };

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { erro: "nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const admin = criarClienteAdmin();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: senha,
      user_metadata: { nome, papel: "operario" },
      email_confirm: true,
    });
    if (error) throw error;

    return NextResponse.json({
      id: data.user.id,
      email: data.user.email ?? "",
      nome,
      papel: "operario" as Papel,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
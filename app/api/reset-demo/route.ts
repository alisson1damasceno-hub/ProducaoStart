import { NextResponse } from "next/server";
import { resetMvpData } from "../shared/supabase-rest";

export async function POST() {
  try {
    return NextResponse.json(await resetMvpData());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { insertSheet } from "../shared/supabase-rest";
import type { TechnicalSheet } from "../../shared/types";

export async function POST(request: NextRequest) {
  try {
    const sheet = (await request.json()) as TechnicalSheet;
    return NextResponse.json(await insertSheet(sheet), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}

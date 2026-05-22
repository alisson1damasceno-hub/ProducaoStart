import { NextResponse } from "next/server";
import { getMvpData } from "../shared/supabase-rest";

export async function GET() {
  try {
    const data = await getMvpData();
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}
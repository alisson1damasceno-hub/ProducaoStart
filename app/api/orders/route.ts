import { NextRequest, NextResponse } from "next/server";
import { insertOrder } from "../shared/supabase-rest";
import type { ProductionOrder } from "../../shared/types";

export async function POST(request: NextRequest) {
  try {
    const order = (await request.json()) as ProductionOrder;
    return NextResponse.json(await insertOrder(order), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}

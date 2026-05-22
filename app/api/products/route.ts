import { NextRequest, NextResponse } from "next/server";
import { insertProduct } from "../shared/supabase-rest";
import type { Product } from "../../shared/types";

export async function POST(request: NextRequest) {
  try {
    const product = (await request.json()) as Product;
    return NextResponse.json(await insertProduct(product), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}

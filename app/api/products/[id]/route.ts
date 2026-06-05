import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, updateProduct } from "../../shared/supabase-rest";
import type { Product } from "../../../shared/types";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const product = (await request.json()) as Partial<Product>;
    return NextResponse.json(await updateProduct(id, product));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteProduct(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}

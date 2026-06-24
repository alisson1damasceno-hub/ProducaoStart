import { NextRequest, NextResponse } from "next/server";
import { deleteSheet, updateSheet } from "../../shared/supabase-rest";
import type { TechnicalSheet } from "../../../shared/types";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const sheet = (await request.json()) as Partial<TechnicalSheet>;
    return NextResponse.json(await updateSheet(id, sheet));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteSheet(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}

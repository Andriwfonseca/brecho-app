import { NextRequest, NextResponse } from "next/server";
import { deletarCategoria } from "@/lib/services/categoria-service";
import { getBrechoIdFromCookie } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const brechoId = await getBrechoIdFromCookie();
    if (!brechoId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }
    const params = await context.params;
    const categoriaId = params.id;
    await deletarCategoria(categoriaId, brechoId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao deletar categoria";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

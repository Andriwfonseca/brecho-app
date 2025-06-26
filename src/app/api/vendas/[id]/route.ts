import { buscarVenda, deletarVenda } from "@/lib/services/venda-service";
import { getBrechoIdFromCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brechoId = await getBrechoIdFromCookie();
    if (!brechoId)
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    const venda = await buscarVenda(params.id, brechoId);
    if (!venda)
      return NextResponse.json(
        { error: "Venda não encontrada" },
        { status: 404 }
      );
    return NextResponse.json(venda);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar venda" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brechoId = await getBrechoIdFromCookie();
    if (!brechoId)
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    await deletarVenda(params.id, brechoId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao deletar venda";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

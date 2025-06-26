import { deletarCategoriaAction } from "../../../../categorias/action";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deletarCategoriaAction(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao deletar categoria";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

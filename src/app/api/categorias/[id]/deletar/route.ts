import { NextRequest, NextResponse } from "next/server";
import { deletarCategoriaAction } from "../../../../categorias/action";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    await deletarCategoriaAction(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao deletar categoria";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

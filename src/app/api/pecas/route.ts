import { listarPecas, criarPeca } from "@/lib/services/peca-service";
import { getBrechoIdFromCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const brechoId = await getBrechoIdFromCookie();

    if (!brechoId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const pecas = await listarPecas(brechoId);
    return NextResponse.json(pecas);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar peças" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const brechoId = await getBrechoIdFromCookie();

    if (!brechoId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nome, genero, tamanho, valor, quantidade, categoriaId } = body;

    if (!nome || !genero || !tamanho || !valor || !quantidade || !categoriaId) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const peca = await criarPeca(
      nome,
      genero,
      tamanho,
      valor,
      quantidade,
      categoriaId,
      brechoId
    );

    return NextResponse.json(peca);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao criar peça";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

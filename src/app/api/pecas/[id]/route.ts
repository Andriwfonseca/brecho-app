import {
  buscarPeca,
  atualizarPeca,
  deletarPeca,
} from "@/lib/services/peca-service";
import { getBrechoIdFromCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brechoId = await getBrechoIdFromCookie();

    if (!brechoId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const peca = await buscarPeca(params.id, brechoId);

    if (!peca) {
      return NextResponse.json(
        { error: "Peça não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(peca);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar peça" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const peca = await atualizarPeca(
      params.id,
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
      error instanceof Error ? error.message : "Erro ao atualizar peça";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brechoId = await getBrechoIdFromCookie();

    if (!brechoId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    await deletarPeca(params.id, brechoId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao deletar peça";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

import { listarCategorias } from "@/lib/services/categoria-service";
import { getBrechoIdFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";
import { criarCategoria } from "@/lib/services/categoria-service";

export async function GET() {
  try {
    const brechoId = await getBrechoIdFromCookie();

    if (!brechoId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const categorias = await listarCategorias(brechoId);
    return NextResponse.json(categorias);
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar categorias" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const brechoId = await getBrechoIdFromCookie();
    if (!brechoId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { nome, valor } = await request.json();
    if (!nome || isNaN(Number(valor))) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    await criarCategoria(nome, Number(valor), brechoId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao criar categoria",
      },
      { status: 500 }
    );
  }
}

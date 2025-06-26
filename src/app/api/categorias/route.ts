import { listarCategorias } from "@/lib/services/categoria-service";
import { getBrechoIdFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

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

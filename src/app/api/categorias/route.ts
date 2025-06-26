import { listarCategorias } from "@/lib/services/categoria-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categorias = await listarCategorias();
    return NextResponse.json(categorias);
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar categorias" },
      { status: 500 }
    );
  }
}

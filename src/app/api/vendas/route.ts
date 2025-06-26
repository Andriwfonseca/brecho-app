import { listarVendas, criarVenda } from "@/lib/services/venda-service";
import { getBrechoIdFromCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const brechoId = await getBrechoIdFromCookie();
    if (!brechoId)
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    const vendas = await listarVendas(brechoId);
    return NextResponse.json(vendas);
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar vendas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const brechoId = await getBrechoIdFromCookie();
    if (!brechoId)
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    const body = await request.json();
    const { metodoPagamento, itens } = body;
    if (!metodoPagamento || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { error: "Preencha todos os campos" },
        { status: 400 }
      );
    }
    const venda = await criarVenda(metodoPagamento, itens, brechoId);
    return NextResponse.json(venda);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao criar venda";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

"use server";

import { db } from "@/lib/prisma";

export async function listarVendas(brechoId: string) {
  return db.venda.findMany({
    where: { brechoId },
    include: {
      itens: {
        include: {
          peca: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function criarVenda(
  metodoPagamento: string,
  itens: { pecaId: string; quantidade: number }[],
  brechoId: string
) {
  // Verifica se todas as peças pertencem ao brechó e têm estoque suficiente
  for (const item of itens) {
    const peca = await db.peca.findFirst({
      where: { id: item.pecaId, brechoId },
    });
    if (!peca)
      throw new Error("Peça não encontrada ou não pertence ao brechó.");
    if (peca.quantidade < item.quantidade)
      throw new Error(`Estoque insuficiente para a peça ${peca.nome}`);
  }
  // Cria a venda e atualiza o estoque das peças
  const venda = await db.venda.create({
    data: {
      metodoPagamento,
      brechoId,
      itens: {
        create: itens.map((item) => ({
          pecaId: item.pecaId,
          quantidade: item.quantidade,
        })),
      },
    },
    include: {
      itens: { include: { peca: true } },
    },
  });
  // Atualiza o estoque das peças
  for (const item of itens) {
    await db.peca.update({
      where: { id: item.pecaId },
      data: { quantidade: { decrement: item.quantidade } },
    });
  }
  return venda;
}

export async function deletarVenda(id: string, brechoId: string) {
  // Só permite deletar vendas do próprio brechó
  const venda = await db.venda.findFirst({
    where: { id, brechoId },
    include: { itens: true },
  });
  if (!venda)
    throw new Error("Venda não encontrada ou não pertence ao seu brechó.");
  // Devolve o estoque das peças
  for (const item of venda.itens) {
    await db.peca.update({
      where: { id: item.pecaId },
      data: { quantidade: { increment: item.quantidade } },
    });
  }
  // Deleta os itens da venda
  await db.itemVenda.deleteMany({ where: { vendaId: id } });
  // Agora deleta a venda
  await db.venda.delete({ where: { id } });
}

export async function buscarVenda(id: string, brechoId: string) {
  return db.venda.findFirst({
    where: { id, brechoId },
    include: {
      itens: { include: { peca: true } },
    },
  });
}

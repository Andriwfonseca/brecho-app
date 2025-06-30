"use server";

import { db } from "@/lib/prisma";

export async function listarCategorias(brechoId: string) {
  return db.categoria.findMany({
    where: {
      brechoId: brechoId,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function criarCategoria(
  nome: string,
  valor: number,
  brechoId: string
) {
  // Verifica se já existe uma categoria com o mesmo nome no brechó
  const categoriaExistente = await db.categoria.findFirst({
    where: {
      nome: nome.trim(),
      brechoId: brechoId,
    },
  });

  if (categoriaExistente) {
    throw new Error(
      "Já existe uma categoria com este nome. Escolha outro nome."
    );
  }

  return db.categoria.create({
    data: {
      nome: nome.trim(),
      brechoId,
      valor,
    },
  });
}

export async function deletarCategoria(categoriaId: string, brechoId: string) {
  // Verifica se existem peças associadas à categoria
  const pecasAssociadas = await db.peca.findFirst({
    where: {
      categoriaId: categoriaId,
      brechoId: brechoId,
    },
  });

  if (pecasAssociadas) {
    throw new Error(
      "Não é possível deletar uma categoria que possui peças associadas. Remova todas as peças da categoria primeiro."
    );
  }

  return db.categoria.deleteMany({
    where: {
      id: categoriaId,
      brechoId, // Garante que só deleta categorias do próprio brechó
    },
  });
}

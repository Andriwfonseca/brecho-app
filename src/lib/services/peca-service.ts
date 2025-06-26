import { db } from "@/lib/prisma";
import { Tamanho } from "../../generated/prisma";

export interface Peca {
  id: string;
  nome: string;
  genero: string;
  tamanho: Tamanho;
  valor: number;
  quantidade: number;
  createdAt: Date;
  categoriaId: string;
  brechoId: string;
  categoria: {
    id: string;
    nome: string;
  };
}

export async function listarPecas(brechoId: string): Promise<Peca[]> {
  return db.peca.findMany({
    where: {
      brechoId,
    },
    include: {
      categoria: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function criarPeca(
  nome: string,
  genero: string,
  tamanho: Tamanho,
  valor: number,
  quantidade: number,
  categoriaId: string,
  brechoId: string
): Promise<Peca> {
  // Verifica se a categoria pertence ao brechó
  const categoria = await db.categoria.findFirst({
    where: {
      id: categoriaId,
      brechoId,
    },
  });

  if (!categoria) {
    throw new Error("Categoria não encontrada ou não pertence ao seu brechó.");
  }

  return db.peca.create({
    data: {
      nome,
      genero,
      tamanho,
      valor,
      quantidade,
      categoriaId,
      brechoId,
    },
    include: {
      categoria: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });
}

export async function atualizarPeca(
  id: string,
  nome: string,
  genero: string,
  tamanho: Tamanho,
  valor: number,
  quantidade: number,
  categoriaId: string,
  brechoId: string
): Promise<Peca> {
  // Verifica se a peça pertence ao brechó
  const pecaExistente = await db.peca.findFirst({
    where: {
      id,
      brechoId,
    },
  });

  if (!pecaExistente) {
    throw new Error("Peça não encontrada ou não pertence ao seu brechó.");
  }

  // Verifica se a categoria pertence ao brechó
  const categoria = await db.categoria.findFirst({
    where: {
      id: categoriaId,
      brechoId,
    },
  });

  if (!categoria) {
    throw new Error("Categoria não encontrada ou não pertence ao seu brechó.");
  }

  return db.peca.update({
    where: { id },
    data: {
      nome,
      genero,
      tamanho,
      valor,
      quantidade,
      categoriaId,
    },
    include: {
      categoria: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });
}

export async function deletarPeca(id: string, brechoId: string): Promise<void> {
  // Verifica se a peça pertence ao brechó
  const peca = await db.peca.findFirst({
    where: {
      id,
      brechoId,
    },
  });

  if (!peca) {
    throw new Error("Peça não encontrada ou não pertence ao seu brechó.");
  }

  // Verifica se a peça está sendo usada em vendas
  const pecaEmVendas = await db.itemVenda.findFirst({
    where: {
      pecaId: id,
    },
  });

  if (pecaEmVendas) {
    throw new Error(
      "Não é possível deletar uma peça que está sendo usada em vendas. Remova as vendas primeiro."
    );
  }

  await db.peca.delete({
    where: { id },
  });
}

export async function buscarPeca(
  id: string,
  brechoId: string
): Promise<Peca | null> {
  return db.peca.findFirst({
    where: {
      id,
      brechoId,
    },
    include: {
      categoria: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });
}

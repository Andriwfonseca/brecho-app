"use server";

import {
  criarCategoria,
  deletarCategoria,
} from "@/lib/services/categoria-service";
import { revalidatePath } from "next/cache";
import { getBrechoIdFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function criarCategoriaAction(formData: FormData) {
  const brechoId = await getBrechoIdFromCookie();

  if (!brechoId) {
    throw new Error("Usuário não autenticado");
  }

  const nome = formData.get("nome") as string;
  const valor = parseFloat(formData.get("valor") as string);

  if (!nome || isNaN(valor)) {
    throw new Error("Dados inválidos");
  }

  try {
    await criarCategoria(nome, valor, brechoId);
    revalidatePath("/categorias");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Erro ao criar categoria");
  }
}

export async function deletarCategoriaAction(categoriaId: string) {
  const brechoId = await getBrechoIdFromCookie();

  if (!brechoId) {
    redirect("/login");
  }

  try {
    await deletarCategoria(categoriaId, brechoId);
    revalidatePath("/categorias");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Erro ao deletar categoria");
  }
}

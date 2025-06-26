"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { criarCategoriaAction } from "./action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Categoria {
  id: string;
  nome: string;
  valor: number;
  createdAt: Date;
  brechoId: string;
}

export default function PecasPageContent() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const carregarCategorias = async () => {
    try {
      const response = await fetch("/api/categorias");
      if (!response.ok) {
        throw new Error("Erro ao carregar categorias");
      }
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const successParam = searchParams.get("success");

    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
      // Remove o parâmetro de erro da URL
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      router.replace(url.pathname);
    }

    if (successParam) {
      toast.success(decodeURIComponent(successParam));
      // Remove o parâmetro de sucesso da URL
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      router.replace(url.pathname);
    }
  }, [searchParams, router]);

  const handleSubmit = async (formData: FormData) => {
    setCreating(true);
    try {
      await criarCategoriaAction(formData);
      toast.success("Categoria cadastrada com sucesso!");
      // Recarrega as categorias
      await carregarCategorias();
      // Limpa o formulário
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) form.reset();
    } catch (error) {
      // Captura a mensagem específica do erro
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao cadastrar categoria";
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (categoria: Categoria) => {
    setCategoriaToDelete(categoria);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoriaToDelete) return;

    setDeleting(categoriaToDelete.id);
    try {
      const response = await fetch(
        `/api/categorias/${categoriaToDelete.id}/deletar`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast.success("Categoria deletada com sucesso!");
        await carregarCategorias();
      } else {
        const data = await response.json();
        toast.error(data.error || "Erro ao deletar categoria");
      }
    } catch {
      toast.error("Erro ao deletar categoria");
    } finally {
      setDeleting(null);
      setCategoriaToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Suspense fallback={<div>Carregando categorias...</div>}>
        <div className="max-w-2xl mx-auto py-10 px-4">
          <div className="text-center">Carregando categorias...</div>
        </div>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Carregando categorias...</div>}>
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              ← Voltar para Home
            </Button>
          </Link>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Nova Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" name="nome" required disabled={creating} />
              </div>
              <div>
                <Label htmlFor="valor">Valor base (R$)</Label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  required
                  disabled={creating}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700"
                disabled={creating}
              >
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {creating ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4 text-rose-700">
          Categorias Cadastradas
        </h2>

        <ul className="space-y-3">
          {categorias.map((categoria) => (
            <li
              key={categoria.id}
              className="border rounded-md p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <span className="font-medium">{categoria.nome}</span>
                  <span className="text-muted-foreground ml-4">
                    R$ {Number(categoria.valor).toFixed(2)}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(categoria)}
                  disabled={deleting === categoria.id}
                >
                  {deleting === categoria.id && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {deleting === categoria.id ? "Deletando..." : "Deletar"}
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja deletar a categoria &quot;
                {categoriaToDelete?.nome}&quot;? Esta ação não pode ser
                desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleting === categoriaToDelete?.id}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting === categoriaToDelete?.id}
              >
                {deleting === categoriaToDelete?.id && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {deleting === categoriaToDelete?.id
                  ? "Deletando..."
                  : "Deletar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Categoria {
  id: string;
  nome: string;
  valor: number;
}

interface Peca {
  id: string;
  nome: string;
  genero: string;
  tamanho: "ADULTO" | "INFANTIL";
  valor: number;
  quantidade: number;
  createdAt: string;
  categoria: {
    id: string;
    nome: string;
  };
}

export default function PecasPageContent() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pecaToEdit, setPecaToEdit] = useState<Peca | null>(null);
  const [pecaToDelete, setPecaToDelete] = useState<Peca | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string | null>(
    null
  );
  const [valorInput, setValorInput] = useState<string>("");
  const [editSelectedCategoriaId, setEditSelectedCategoriaId] = useState<
    string | null
  >(null);
  const [editValorInput, setEditValorInput] = useState<string>("");
  const [filtroEstoque, setFiltroEstoque] = useState<
    "ALL" | "EM_ESTOQUE" | "ESGOTADO"
  >("ALL");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("ALL");
  const [filtroGenero, setFiltroGenero] = useState<string>("ALL");
  const [filtroTamanho, setFiltroTamanho] = useState<string>("ALL");
  const [ordenacao, setOrdenacao] = useState<"RECENTE" | "ANTIGO">("RECENTE");
  const [buscaNome, setBuscaNome] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const carregarDados = async () => {
    try {
      const [pecasResponse, categoriasResponse] = await Promise.all([
        fetch("/api/pecas"),
        fetch("/api/categorias"),
      ]);

      if (!pecasResponse.ok || !categoriasResponse.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const [pecasData, categoriasData] = await Promise.all([
        pecasResponse.json(),
        categoriasResponse.json(),
      ]);

      setPecas(pecasData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const successParam = searchParams.get("success");

    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      router.replace(url.pathname);
    }

    if (successParam) {
      toast.success(decodeURIComponent(successParam));
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      router.replace(url.pathname);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (selectedCategoriaId) {
      const cat = categorias.find((c) => c.id === selectedCategoriaId);
      if (cat) setValorInput(cat.valor.toString());
    }
  }, [selectedCategoriaId, categorias]);

  useEffect(() => {
    if (editSelectedCategoriaId) {
      const cat = categorias.find((c) => c.id === editSelectedCategoriaId);
      if (cat) setEditValorInput(cat.valor.toString());
    }
  }, [editSelectedCategoriaId, categorias]);

  const handleSubmit = async (formData: FormData) => {
    setCreating(true);
    try {
      const response = await fetch("/api/pecas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.get("nome"),
          genero: formData.get("genero"),
          tamanho: formData.get("tamanho"),
          valor: parseFloat(valorInput),
          quantidade: parseInt(formData.get("quantidade") as string),
          categoriaId: selectedCategoriaId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar peça");
      }

      toast.success("Peça cadastrada com sucesso!");
      await carregarDados();
      setSelectedCategoriaId("");
      setValorInput("");
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) {
        form.reset();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao cadastrar peça";
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (peca: Peca) => {
    setPecaToEdit(peca);
    setEditSelectedCategoriaId(peca.categoria.id);
    setEditValorInput(peca.valor.toString());
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (formData: FormData) => {
    if (!pecaToEdit) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/pecas/${pecaToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.get("nome"),
          genero: formData.get("genero"),
          tamanho: formData.get("tamanho"),
          valor: parseFloat(editValorInput),
          quantidade: parseInt(formData.get("quantidade") as string),
          categoriaId: editSelectedCategoriaId,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar peça");
      }
      toast.success("Peça atualizada com sucesso!");
      await carregarDados();
      setIsEditDialogOpen(false);
      setPecaToEdit(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar peça";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = (peca: Peca) => {
    setPecaToDelete(peca);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pecaToDelete) return;

    setDeleting(pecaToDelete.id);
    try {
      const response = await fetch(`/api/pecas/${pecaToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao deletar peça");
      }

      toast.success("Peça deletada com sucesso!");
      await carregarDados();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao deletar peça";
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
      setPecaToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const pecasFiltradas = pecas
    .filter((peca) =>
      filtroEstoque === "EM_ESTOQUE"
        ? peca.quantidade > 0
        : filtroEstoque === "ESGOTADO"
        ? peca.quantidade === 0
        : true
    )
    .filter((peca) =>
      filtroCategoria !== "ALL" ? peca.categoria.id === filtroCategoria : true
    )
    .filter((peca) =>
      filtroGenero !== "ALL" ? peca.genero === filtroGenero : true
    )
    .filter((peca) =>
      filtroTamanho !== "ALL" ? peca.tamanho === filtroTamanho : true
    )
    .filter((peca) =>
      buscaNome.trim()
        ? peca.nome.toLowerCase().includes(buscaNome.trim().toLowerCase())
        : true
    )
    .sort((a, b) =>
      ordenacao === "RECENTE"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="text-center">Carregando peças...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" className="mb-4">
            ← Voltar para Home
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Nova Peça</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome da Peça</Label>
                <Input id="nome" name="nome" required disabled={creating} />
              </div>
              <div>
                <Label htmlFor="genero">Gênero</Label>
                <Select
                  name="genero"
                  required
                  disabled={creating}
                  defaultValue="FEMININO"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tamanho">Tamanho</Label>
                <Select name="tamanho" required disabled={creating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADULTO">Adulto</SelectItem>
                    <SelectItem value="INFANTIL">Infantil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="categoriaId">Categoria</Label>
                <Select
                  name="categoriaId"
                  required
                  disabled={creating}
                  value={selectedCategoriaId ?? ""}
                  onValueChange={setSelectedCategoriaId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  required
                  disabled={creating}
                  value={valorInput}
                  onChange={(e) => setValorInput(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  name="quantidade"
                  type="number"
                  min="1"
                  required
                  disabled={creating}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700"
              disabled={creating}
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {creating ? "Cadastrando..." : "Cadastrar Peça"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4 text-rose-700">
        Peças Cadastradas
      </h2>

      <div className="flex flex-wrap gap-4 mb-6 items-end bg-white border rounded-lg shadow p-4">
        <div>
          <Label>Ordenar por</Label>
          <Select
            value={ordenacao}
            onValueChange={(v) => setOrdenacao(v as "RECENTE" | "ANTIGO")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RECENTE">Mais recente</SelectItem>
              <SelectItem value="ANTIGO">Mais antigo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Estoque</Label>
          <Select
            value={filtroEstoque}
            onValueChange={(v) =>
              setFiltroEstoque(v as "ALL" | "EM_ESTOQUE" | "ESGOTADO")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="EM_ESTOQUE">Apenas em estoque</SelectItem>
              <SelectItem value="ESGOTADO">Esgotado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Categoria</Label>
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Gênero</Label>
          <Select value={filtroGenero} onValueChange={setFiltroGenero}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="FEMININO">Feminino</SelectItem>
              <SelectItem value="MASCULINO">Masculino</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Tamanho</Label>
          <Select value={filtroTamanho} onValueChange={setFiltroTamanho}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="ADULTO">Adulto</SelectItem>
              <SelectItem value="INFANTIL">Infantil</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Buscar por nome</Label>
          <Input
            type="text"
            placeholder="Digite o nome da peça"
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
            className="min-w-[180px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pecasFiltradas.map((peca) => (
          <Card key={peca.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{peca.nome}</h3>
                  <p className="text-sm text-muted-foreground">{peca.genero}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(peca)}
                    disabled={deleting === peca.id}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(peca)}
                    disabled={deleting === peca.id}
                  >
                    {deleting === peca.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Categoria:</span>{" "}
                  {peca.categoria.nome}
                </p>
                <p>
                  <span className="font-medium">Tamanho:</span> {peca.tamanho}
                </p>
                <p>
                  <span className="font-medium">Valor:</span> R${" "}
                  {peca.valor.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Quantidade:</span>{" "}
                  {peca.quantidade}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Peça</DialogTitle>
            <DialogDescription>
              Atualize as informações da peça.
            </DialogDescription>
          </DialogHeader>
          <form action={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nome">Nome da Peça</Label>
                <Input
                  id="edit-nome"
                  name="nome"
                  defaultValue={pecaToEdit?.nome}
                  required
                  disabled={updating}
                />
              </div>
              <div>
                <Label htmlFor="edit-genero">Gênero</Label>
                <Select
                  name="genero"
                  defaultValue={pecaToEdit?.genero}
                  required
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-tamanho">Tamanho</Label>
                <Select
                  name="tamanho"
                  defaultValue={pecaToEdit?.tamanho}
                  required
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADULTO">Adulto</SelectItem>
                    <SelectItem value="INFANTIL">Infantil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-categoriaId">Categoria</Label>
                <Select
                  name="categoriaId"
                  required
                  disabled={updating}
                  value={editSelectedCategoriaId ?? undefined}
                  onValueChange={setEditSelectedCategoriaId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-valor">Valor (R$)</Label>
                <Input
                  id="edit-valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  required
                  disabled={updating}
                  value={editValorInput}
                  onChange={(e) => setEditValorInput(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-quantidade">Quantidade</Label>
                <Input
                  id="edit-quantidade"
                  name="quantidade"
                  type="number"
                  min="1"
                  defaultValue={pecaToEdit?.quantidade}
                  required
                  disabled={updating}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {updating ? "Atualizando..." : "Atualizar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar a peça &quot;{pecaToDelete?.nome}
              &quot;? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleting === pecaToDelete?.id}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting === pecaToDelete?.id}
            >
              {deleting === pecaToDelete?.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {deleting === pecaToDelete?.id ? "Deletando..." : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

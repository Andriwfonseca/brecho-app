"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import React from "react";

interface Peca {
  id: string;
  nome: string;
  valor: number;
  quantidade: number;
}

interface ItemVenda {
  id: string;
  quantidade: number;
  peca: Peca;
}

interface Venda {
  id: string;
  metodoPagamento: string;
  createdAt: string;
  itens: ItemVenda[];
}

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [vendaToDelete, setVendaToDelete] = useState<Venda | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itens, setItens] = useState<{ pecaId: string; quantidade: number }[]>(
    []
  );
  const [metodoPagamento, setMetodoPagamento] = useState<string>("");

  const carregarDados = async () => {
    try {
      const [vendasRes, pecasRes] = await Promise.all([
        fetch("/api/vendas"),
        fetch("/api/pecas"),
      ]);
      if (!vendasRes.ok || !pecasRes.ok) throw new Error();
      setVendas(await vendasRes.json());
      setPecas(await pecasRes.json());
    } catch {
      toast.error("Erro ao carregar vendas ou peças");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const pecasDisponiveis = pecas.filter(
    (p) => p.quantidade > 0 && !itens.some((item) => item.pecaId === p.id)
  );

  const handleAddItem = () => {
    if (pecasDisponiveis.length > 0) {
      setItens([...itens, { pecaId: "", quantidade: 1 }]);
    }
  };
  const handleRemoveItem = (idx: number) => {
    setItens(itens.filter((_, i) => i !== idx));
  };
  const handleItemChange = (idx: number, field: string, value: string) => {
    setItens(
      itens.map((item, i) =>
        i === idx
          ? { ...item, [field]: field === "quantidade" ? Number(value) : value }
          : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodoPagamento, itens }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar venda");
      }
      toast.success("Venda registrada!");
      setMetodoPagamento("");
      setItens([]);
      await carregarDados();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar venda"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (venda: Venda) => {
    setVendaToDelete(venda);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!vendaToDelete) return;
    setDeleting(vendaToDelete.id);
    try {
      const response = await fetch(`/api/vendas/${vendaToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao deletar venda");
      }
      toast.success("Venda excluída!");
      await carregarDados();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao deletar venda"
      );
    } finally {
      setDeleting(null);
      setVendaToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
          <span className="ml-2 text-lg">Carregando vendas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" className="mb-4">
            ← Voltar para Home
          </Button>
        </Link>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Nova Venda</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              {itens.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <Separator className="my-2" />}
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                    <div className="flex-1 min-w-0">
                      <Label>Peça</Label>
                      <Select
                        value={item.pecaId}
                        required
                        onValueChange={(v) =>
                          handleItemChange(idx, "pecaId", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a peça" />
                        </SelectTrigger>
                        <SelectContent>
                          {pecas
                            .filter(
                              (p) => p.quantidade > 0 || p.id === item.pecaId
                            )
                            .filter(
                              (p) =>
                                !itens.some(
                                  (i, iidx) => i.pecaId === p.id && iidx !== idx
                                )
                            )
                            .map((peca) => (
                              <SelectItem
                                key={peca.id}
                                value={peca.id}
                                disabled={peca.quantidade === 0}
                              >
                                <span
                                  className="block max-w-[160px] truncate"
                                  title={peca.nome}
                                >
                                  {peca.nome}
                                </span>{" "}
                                (R$ {peca.valor.toFixed(2)})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <div className="flex-1">
                        <Label>Qtd</Label>
                        <Input
                          type="number"
                          min={1}
                          max={
                            pecas.find((p) => p.id === item.pecaId)
                              ?.quantidade ?? 1
                          }
                          value={item.quantidade}
                          required
                          onChange={(e) =>
                            handleItemChange(idx, "quantidade", e.target.value)
                          }
                          disabled={!item.pecaId}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={creating}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddItem}
                disabled={creating || pecasDisponiveis.length === 0}
              >
                Adicionar Peça
              </Button>
            </div>
            <div>
              <Label>Método de Pagamento</Label>
              <Select
                value={metodoPagamento}
                required
                onValueChange={setMetodoPagamento}
                disabled={creating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  <SelectItem value="PIX">Pix</SelectItem>
                  <SelectItem value="CREDITO">Crédito</SelectItem>
                  <SelectItem value="DEBITO">Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700"
              disabled={creating}
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Registrar Venda
            </Button>
          </form>
        </CardContent>
      </Card>
      <h2 className="text-xl font-semibold mb-4 text-rose-700">
        Vendas Realizadas
      </h2>
      <div className="space-y-4">
        {vendas.map((venda, idx) => (
          <React.Fragment key={venda.id}>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium">
                      {new Date(venda.createdAt).toLocaleString()}
                    </span>{" "}
                    — {venda.metodoPagamento}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(venda)}
                    disabled={deleting === venda.id}
                  >
                    {deleting === venda.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}{" "}
                    {deleting === venda.id ? "Excluindo..." : "Excluir"}
                  </Button>
                </div>
                <ul className="text-sm mb-2">
                  {venda.itens.map((item) => (
                    <li key={item.id}>
                      {item.peca.nome} — Qtd: {item.quantidade} — R${" "}
                      {(item.peca.valor * item.quantidade).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <div className="font-semibold text-rose-700">
                  Total: R${" "}
                  {venda.itens
                    .reduce(
                      (acc, item) => acc + item.peca.valor * item.quantidade,
                      0
                    )
                    .toFixed(2)}
                </div>
              </CardContent>
            </Card>
            {idx < vendas.length - 1 && <Separator className="my-2" />}
          </React.Fragment>
        ))}
      </div>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta venda? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleting !== null}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting === vendaToDelete?.id}
            >
              {deleting === vendaToDelete?.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}{" "}
              {deleting === vendaToDelete?.id ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

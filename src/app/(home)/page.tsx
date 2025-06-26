import { getBrechoIdFromCookie } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buscarBrechoPorId } from "@/lib/services/brecho-service";

export default async function HomePage() {
  const brechoId = await getBrechoIdFromCookie();

  if (!brechoId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Você não está autenticado.</p>
      </div>
    );
  }

  const brecho = await buscarBrechoPorId(brechoId);

  if (!brecho) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Brechó não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 px-4">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-rose-700">
          Bem-vindo, {brecho.nome} 👋
        </h1>

        <p className="text-muted-foreground">
          Gerencie suas peças, categorias e vendas com facilidade.
        </p>

        <div className="flex flex-col gap-3 items-center">
          <Link href="/pecas">
            <Button variant="default" className="w-48">
              Peças
            </Button>
          </Link>
          <Link href="/categorias">
            <Button variant="outline" className="w-48">
              Categorias
            </Button>
          </Link>
          <Link href="/vendas">
            <Button variant="outline" className="w-48">
              Vendas
            </Button>
          </Link>
          <form action="/api/logout" method="POST" className="mt-4">
            <Button type="submit" variant="destructive" className="w-48">
              Sair
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

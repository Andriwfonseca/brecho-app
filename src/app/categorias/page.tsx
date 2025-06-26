import { Suspense } from "react";
import CategoriasPageContent from "./CategoriasPageContent";
import { Loader2 } from "lucide-react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto py-10 px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
            <span className="ml-2 text-lg">Carregando categorias...</span>
          </div>
        </div>
      }
    >
      <CategoriasPageContent />
    </Suspense>
  );
}

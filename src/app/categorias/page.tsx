import { Suspense } from "react";
import CategoriasPageContent from "./CategoriasPageContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando categorias...</div>}>
      <CategoriasPageContent />
    </Suspense>
  );
}

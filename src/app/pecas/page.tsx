import { Suspense } from "react";
import PecasPageContent from "./PecasPageContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando peças...</div>}>
      <PecasPageContent />
    </Suspense>
  );
}

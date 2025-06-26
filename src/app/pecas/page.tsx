import { Suspense } from "react";
import PecasPageContent from "./PecasPageContent";
import { Loader2 } from "lucide-react";

export default function Page() {
  return (
    <Suspense 
      fallback={
        <div className="max-w-6xl mx-auto py-10 px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
            <span className="ml-2 text-lg">Carregando peças...</span>
          </div>
        </div>
      }
    >
      <PecasPageContent />
    </Suspense>
  );
}

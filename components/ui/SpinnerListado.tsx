import { Loader2 } from "lucide-react";

// Se usa dentro de un <Suspense> como fallback solo para el hueco
// donde va un listado (tabla, tarjetas...) — el título, botones y
// filtros de la página ya se renderizaron antes de esto, así que no
// deben desaparecer mientras carga.
export function SpinnerListado() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-borde bg-superficie p-12 shadow-tarjeta">
      <Loader2 size={24} className="animate-spin text-secundario" />
    </div>
  );
}

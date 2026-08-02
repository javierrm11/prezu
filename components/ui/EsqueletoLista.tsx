// Se usa dentro de un <Suspense> como fallback solo para el hueco
// donde va un listado (tabla, tarjetas...) — el título, botones y
// filtros de la página ya se renderizaron antes de esto, así que no
// deben desaparecer mientras carga. Imita la forma de las filas reales
// para que dé sensación de "casi está" en vez de "está cargando".
export function EsqueletoLista({ filas = 5 }: { filas?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
      {Array.from({ length: filas }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b border-[#EEF0F6] px-4 py-3.5 last:border-b-0"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-[#EEF0F6]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#EEF0F6]" />
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
            <div className="h-3.5 w-16 animate-pulse rounded bg-[#EEF0F6]" />
            <div className="h-4 w-14 animate-pulse rounded-full bg-[#EEF0F6]" />
          </div>
        </div>
      ))}
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { obtenerIniciales } from "@/lib/texto";
import { EsqueletoLista } from "@/components/ui/EsqueletoLista";
import { BotonNuevoCliente } from "./_componentes/boton-nuevo-cliente";

export default function ClientesPage() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primario">
          Clientes
        </h1>
        <BotonNuevoCliente />
      </div>

      <Suspense fallback={<EsqueletoLista />}>
        <ListaClientesDatos />
      </Suspense>
    </div>
  );
}

async function ListaClientesDatos() {
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  const documentosPorCliente = new Map<string, number>();
  let clientes: { id: string; nombre: string; nif: string | null; telefono: string | null }[] = [];

  if (empresaId) {
    const [{ data: clientesDB }, { data: presupuestos }, { data: facturas }] = await Promise.all([
      supabase
        .from("clientes")
        .select("id, nombre, nif, telefono")
        .eq("empresa_id", empresaId)
        .order("nombre"),
      supabase.from("presupuestos").select("cliente_id").eq("empresa_id", empresaId),
      supabase.from("facturas").select("cliente_id").eq("empresa_id", empresaId),
    ]);

    for (const fila of [...(presupuestos ?? []), ...(facturas ?? [])]) {
      if (!fila.cliente_id) continue;
      documentosPorCliente.set(
        fila.cliente_id,
        (documentosPorCliente.get(fila.cliente_id) ?? 0) + 1,
      );
    }

    clientes = clientesDB ?? [];
  }

  return (
    <>
      {clientes.length === 0 ? (
        <p className="text-sm text-texto-secundario">
          Todavía no tienes clientes. Añade el primero.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
          {clientes.map((cliente) => {
            const numDocumentos = documentosPorCliente.get(cliente.id) ?? 0;
            const subtitulo = [cliente.nif, cliente.telefono]
              .filter(Boolean)
              .join(" · ");

            return (
              <Link
                key={cliente.id}
                href={`/clientes/${cliente.id}`}
                className="flex items-center gap-3.5 border-b border-[#EEF0F6] px-4 py-3.5 last:border-b-0 hover:bg-fondo"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#E8EDFB] text-[15px] font-semibold text-secundario">
                  {obtenerIniciales(cliente.nombre)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold text-texto">
                    {cliente.nombre}
                  </div>
                  <div className="text-[13px] text-texto-secundario">
                    {subtitulo || "Sin datos fiscales"}
                  </div>
                </div>
                <div className="flex-shrink-0 text-[13px] text-texto-secundario">
                  {numDocumentos} documento{numDocumentos === 1 ? "" : "s"}
                </div>
                <ChevronRight
                  size={18}
                  className="flex-shrink-0 text-[#8A8FA3]"
                />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import type { IdPlantillaPDF } from "@/lib/pdf/plantillas";
import { SelectorPlantillaPresupuesto } from "./selector";

export default async function ElegirPlantillaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  if (!empresaId) {
    return (
      <p className="text-sm text-texto-secundario">
        No se ha encontrado tu negocio.
      </p>
    );
  }

  const [{ data: presupuesto }, { data: empresa }] = await Promise.all([
    supabase.from("presupuestos").select("id").eq("id", id).eq("empresa_id", empresaId).single(),
    supabase.from("empresas").select("pdf_plantilla").eq("id", empresaId).single(),
  ]);

  if (!presupuesto) {
    notFound();
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={`/presupuestos/${id}`}
          aria-label="Volver"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-borde bg-superficie text-primario hover:bg-fondo"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-heading text-[22px] font-bold text-primario">
            Elige el diseño del PDF
          </h1>
          <p className="text-sm text-texto-secundario">
            Se guardará como el diseño de tu negocio; podrás cambiarlo luego desde Ajustes.
          </p>
        </div>
      </div>

      <SelectorPlantillaPresupuesto
        empresaId={empresaId}
        presupuestoId={id}
        plantillaActual={(empresa?.pdf_plantilla as IdPlantillaPDF | null) ?? null}
      />
    </div>
  );
}

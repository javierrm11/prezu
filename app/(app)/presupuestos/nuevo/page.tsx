import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { FormularioPresupuesto } from "../_componentes/formulario-presupuesto";

export default async function NuevoPresupuestoPage() {
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  if (!empresaId) {
    return (
      <p className="text-sm text-texto-secundario">
        No se ha encontrado tu negocio.
      </p>
    );
  }

  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre")
    .eq("empresa_id", empresaId)
    .order("nombre");

  const { data: empresa } = await supabase
    .from("empresas")
    .select("iva_defecto")
    .eq("id", empresaId)
    .single();

  const { data: catalogoDB } = await supabase
    .from("catalogo")
    .select("concepto, unidad, precio_unitario, tipo_iva")
    .eq("empresa_id", empresaId)
    .order("veces_usado", { ascending: false })
    .order("concepto");

  const catalogo = (catalogoDB ?? []).map((item) => ({
    concepto: item.concepto,
    unidad: item.unidad,
    precioUnitario: Number(item.precio_unitario),
    tipoIva: Number(item.tipo_iva),
  }));

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/presupuestos"
          aria-label="Volver"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-borde bg-superficie text-primario hover:bg-fondo"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading text-[22px] font-bold text-primario">
          Nuevo presupuesto
        </h1>
      </div>

      {!clientes || clientes.length === 0 ? (
        <p className="text-sm text-texto-secundario">
          Necesitas al menos un cliente antes de crear un presupuesto.{" "}
          <Link href="/clientes" className="font-medium text-secundario">
            Añade uno
          </Link>
          .
        </p>
      ) : (
        <FormularioPresupuesto
          empresaId={empresaId}
          clientes={clientes}
          ivaDefecto={Number(empresa?.iva_defecto ?? 21)}
          catalogo={catalogo}
        />
      )}
    </div>
  );
}

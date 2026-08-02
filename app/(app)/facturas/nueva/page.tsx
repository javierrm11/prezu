import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { FormularioFactura, type ClienteOpcion } from "../_componentes/formulario-factura";
import type { Plan } from "@/lib/limitesPlan";

export default async function NuevaFacturaPage() {
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  let clientes: ClienteOpcion[] = [];
  let plan: Plan = "gratis";
  let ivaDefecto = 21;
  let serieFactura = "F";
  let catalogo: { concepto: string; unidad: string; precioUnitario: number; tipoIva: number }[] = [];

  if (empresaId) {
    const [{ data: clientesDB }, { data: empresa }, { data: catalogoDB }] = await Promise.all([
      supabase.from("clientes").select("id, nombre").eq("empresa_id", empresaId).order("nombre"),
      supabase
        .from("empresas")
        .select("iva_defecto, serie_factura, plan")
        .eq("id", empresaId)
        .single(),
      supabase
        .from("catalogo")
        .select("concepto, unidad, precio_unitario, tipo_iva")
        .eq("empresa_id", empresaId)
        .order("veces_usado", { ascending: false })
        .order("concepto"),
    ]);

    clientes = clientesDB ?? [];
    plan = (empresa?.plan as Plan) ?? "gratis";
    ivaDefecto = Number(empresa?.iva_defecto ?? 21);
    serieFactura = empresa?.serie_factura ?? "F";
    catalogo = (catalogoDB ?? []).map((item) => ({
      concepto: item.concepto,
      unidad: item.unidad,
      precioUnitario: Number(item.precio_unitario),
      tipoIva: Number(item.tipo_iva),
    }));
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/facturas"
          aria-label="Volver"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-borde bg-superficie text-primario hover:bg-fondo"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading text-[22px] font-bold text-primario">
          Nueva factura
        </h1>
      </div>

      <FormularioFactura
        empresaId={empresaId ?? ""}
        plan={plan}
        clientes={clientes}
        ivaDefecto={ivaDefecto}
        serieFactura={serieFactura}
        catalogo={catalogo}
      />
    </div>
  );
}

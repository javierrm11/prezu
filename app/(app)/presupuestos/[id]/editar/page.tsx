import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import {
  FormularioPresupuesto,
  type PresupuestoExistente,
} from "../../_componentes/formulario-presupuesto";
import type { Plan } from "@/lib/limitesPlan";

const VALIDEZ_DIAS_VALIDAS = [15, 30, 60];

function calcularValidezDias(fechaEmision: string, validoHasta: string | null) {
  if (!validoHasta) return 30;

  const dias = Math.round(
    (new Date(validoHasta).getTime() - new Date(fechaEmision).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return VALIDEZ_DIAS_VALIDAS.includes(dias) ? dias : 30;
}

export default async function EditarPresupuestoPage({
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

  // Todas dependen solo de id/empresaId (ya conocidos), así que se
  // piden a la vez; los redirect/notFound de abajo se comprueban
  // después de tenerlas todas.
  const [{ data: presupuesto }, { data: lineas }, { data: clientes }, { data: empresa }, { data: catalogoDB }] =
    await Promise.all([
      supabase
        .from("presupuestos")
        .select("id, cliente_id, estado, fecha_emision, valido_hasta")
        .eq("id", id)
        .eq("empresa_id", empresaId)
        .single(),
      supabase
        .from("presupuesto_lineas")
        .select("concepto, cantidad, unidad, precio_unitario, tipo_iva")
        .eq("presupuesto_id", id)
        .order("orden"),
      supabase.from("clientes").select("id, nombre").eq("empresa_id", empresaId).order("nombre"),
      supabase.from("empresas").select("iva_defecto, plan").eq("id", empresaId).single(),
      supabase
        .from("catalogo")
        .select("concepto, unidad, precio_unitario, tipo_iva")
        .eq("empresa_id", empresaId)
        .order("veces_usado", { ascending: false })
        .order("concepto"),
    ]);

  if (!presupuesto) {
    notFound();
  }

  if (presupuesto.estado !== "borrador") {
    redirect(`/presupuestos/${id}`);
  }

  const catalogo = (catalogoDB ?? []).map((item) => ({
    concepto: item.concepto,
    unidad: item.unidad,
    precioUnitario: Number(item.precio_unitario),
    tipoIva: Number(item.tipo_iva),
  }));

  const fechaEmision = presupuesto.fecha_emision ?? new Date().toISOString().slice(0, 10);

  const presupuestoExistente: PresupuestoExistente = {
    id: presupuesto.id,
    clienteId: presupuesto.cliente_id ?? "",
    fechaEmision,
    validezDias: calcularValidezDias(fechaEmision, presupuesto.valido_hasta),
    lineas: (lineas ?? []).map((linea) => ({
      concepto: linea.concepto,
      cantidad: Number(linea.cantidad),
      unidad: linea.unidad,
      precioUnitario: Number(linea.precio_unitario),
      tipoIva: Number(linea.tipo_iva),
    })),
  };

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
        <h1 className="font-heading text-[22px] font-bold text-primario">
          Editar presupuesto
        </h1>
      </div>

      <FormularioPresupuesto
        empresaId={empresaId}
        plan={(empresa?.plan as Plan) ?? "gratis"}
        clientes={clientes ?? []}
        ivaDefecto={Number(empresa?.iva_defecto ?? 21)}
        catalogo={catalogo}
        presupuestoExistente={presupuestoExistente}
      />
    </div>
  );
}

import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { ListaPresupuestos, type PresupuestoFila } from "./_componentes/lista-presupuestos";

type FilaPresupuestoDB = {
  id: string;
  numero: number | null;
  anio: number | null;
  estado: string;
  total: number;
  fecha_emision: string | null;
  created_at: string;
  clientes: { nombre: string } | null;
  presupuesto_lineas: { concepto: string }[];
};

export default async function PresupuestosPage() {
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  if (!empresaId) {
    return (
      <p className="text-sm text-texto-secundario">
        No se ha encontrado tu negocio.
      </p>
    );
  }

  const { data } = await supabase
    .from("presupuestos")
    .select(
      "id, numero, anio, estado, total, fecha_emision, created_at, clientes(nombre), presupuesto_lineas(concepto)",
    )
    .eq("empresa_id", empresaId)
    .order("orden", { foreignTable: "presupuesto_lineas" })
    .limit(1, { foreignTable: "presupuesto_lineas" })
    .order("created_at", { ascending: false });

  const { data: empresa } = await supabase
    .from("empresas")
    .select("serie_presupuesto")
    .eq("id", empresaId)
    .single();

  const filas = (data as unknown as FilaPresupuestoDB[] | null) ?? [];

  const presupuestos: PresupuestoFila[] = filas.map((fila) => ({
    id: fila.id,
    numero: fila.numero,
    anio: fila.anio,
    estado: fila.estado,
    total: Number(fila.total),
    fecha: fila.fecha_emision ?? fila.created_at,
    cliente: fila.clientes?.nombre ?? "Sin cliente",
    concepto: fila.presupuesto_lineas[0]?.concepto ?? "",
  }));

  return (
    <ListaPresupuestos
      presupuestos={presupuestos}
      seriePresupuesto={empresa?.serie_presupuesto ?? "P"}
    />
  );
}

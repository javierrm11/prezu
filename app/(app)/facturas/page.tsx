import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { ListaFacturas, type FacturaFila } from "./_componentes/lista-facturas";

type FilaFacturaDB = {
  id: string;
  numero: number;
  anio: number;
  cliente_nombre: string;
  fecha_emision: string;
  vencimiento: string | null;
  total: number;
  estado_cobro: string;
  factura_lineas: { concepto: string }[];
};

export default async function FacturasPage() {
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
    .from("facturas")
    .select(
      "id, numero, anio, cliente_nombre, fecha_emision, vencimiento, total, estado_cobro, factura_lineas(concepto)",
    )
    .eq("empresa_id", empresaId)
    .order("orden", { foreignTable: "factura_lineas" })
    .limit(1, { foreignTable: "factura_lineas" })
    .order("fecha_emision", { ascending: false });

  const filas = (data as unknown as FilaFacturaDB[] | null) ?? [];

  const facturas: FacturaFila[] = filas.map((fila) => ({
    id: fila.id,
    numero: fila.numero,
    anio: fila.anio,
    cliente: fila.cliente_nombre,
    concepto: fila.factura_lineas[0]?.concepto ?? "",
    fechaEmision: fila.fecha_emision,
    vencimiento: fila.vencimiento,
    total: Number(fila.total),
    estadoCobro: fila.estado_cobro,
  }));

  return <ListaFacturas facturas={facturas} />;
}

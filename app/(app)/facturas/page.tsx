import { Suspense } from "react";
import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { Boton } from "@/components/ui/Boton";
import { SpinnerListado } from "@/components/ui/SpinnerListado";
import { ListaFacturas, type FacturaFila } from "./_componentes/lista-facturas";

type FilaFacturaDB = {
  id: string;
  numero: number;
  anio: number;
  serie: string;
  cliente_nombre: string;
  fecha_emision: string;
  vencimiento: string | null;
  total: number;
  estado_cobro: string;
  factura_lineas: { concepto: string }[];
};

export default function FacturasPage() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primario">Facturas</h1>
        <Link href="/facturas/nueva">
          <Boton>Nueva factura</Boton>
        </Link>
      </div>

      <Suspense fallback={<SpinnerListado />}>
        <ListaFacturasDatos />
      </Suspense>
    </div>
  );
}

async function ListaFacturasDatos() {
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  let filas: FilaFacturaDB[] = [];

  if (empresaId) {
    const { data } = await supabase
      .from("facturas")
      .select(
        "id, numero, anio, serie, cliente_nombre, fecha_emision, vencimiento, total, estado_cobro, factura_lineas(concepto)",
      )
      .eq("empresa_id", empresaId)
      .order("orden", { foreignTable: "factura_lineas" })
      .limit(1, { foreignTable: "factura_lineas" })
      .order("fecha_emision", { ascending: false });

    filas = (data as unknown as FilaFacturaDB[] | null) ?? [];
  }

  const facturas: FacturaFila[] = filas.map((fila) => ({
    id: fila.id,
    numero: fila.numero,
    anio: fila.anio,
    serie: fila.serie,
    cliente: fila.cliente_nombre,
    concepto: fila.factura_lineas[0]?.concepto ?? "",
    fechaEmision: fila.fecha_emision,
    vencimiento: fila.vencimiento,
    total: Number(fila.total),
    estadoCobro: fila.estado_cobro,
  }));

  return <ListaFacturas facturas={facturas} />;
}

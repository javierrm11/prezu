import { renderToBuffer } from "@react-pdf/renderer";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { formatearNumeroDocumento } from "@/lib/formato";
import { PresupuestoPDF, type LineaPDF } from "@/lib/pdf/PresupuestoPDF";

type FilaPresupuestoDB = {
  id: string;
  numero: number | null;
  anio: number | null;
  fecha_emision: string | null;
  valido_hasta: string | null;
  base_imponible: number;
  total_iva: number;
  total: number;
  condiciones: string | null;
  clientes: { nombre: string; nif: string | null; ciudad: string | null } | null;
  empresas: {
    nombre: string;
    nif: string | null;
    direccion: string | null;
    ciudad: string | null;
    telefono: string | null;
    email: string | null;
    condiciones_defecto: string | null;
  } | null;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  if (!empresaId) {
    return new Response("No autorizado", { status: 401 });
  }

  const { data } = await supabase
    .from("presupuestos")
    .select(
      "id, numero, anio, fecha_emision, valido_hasta, base_imponible, total_iva, total, condiciones, clientes(nombre, nif, ciudad), empresas(nombre, nif, direccion, ciudad, telefono, email, condiciones_defecto)",
    )
    .eq("id", id)
    .eq("empresa_id", empresaId)
    .single();

  const presupuesto = data as unknown as FilaPresupuestoDB | null;

  if (!presupuesto) {
    return new Response("No encontrado", { status: 404 });
  }

  const { data: lineasDB } = await supabase
    .from("presupuesto_lineas")
    .select("concepto, cantidad, unidad, precio_unitario, tipo_iva, importe")
    .eq("presupuesto_id", id)
    .order("orden");

  const lineas: LineaPDF[] = (lineasDB ?? []).map((linea) => ({
    concepto: linea.concepto,
    cantidad: Number(linea.cantidad),
    unidad: linea.unidad,
    precioUnitario: Number(linea.precio_unitario),
    importe: Number(linea.importe),
  }));

  const tiposIvaUsados = new Set((lineasDB ?? []).map((linea) => linea.tipo_iva));
  const etiquetaIva =
    tiposIvaUsados.size === 1 ? `IVA ${[...tiposIvaUsados][0]} %` : "IVA";

  const numeroDocumento = formatearNumeroDocumento("P", presupuesto.numero, presupuesto.anio);

  const buffer = await renderToBuffer(
    <PresupuestoPDF
      empresa={{
        nombre: presupuesto.empresas?.nombre ?? "",
        nif: presupuesto.empresas?.nif ?? null,
        direccion: presupuesto.empresas?.direccion ?? null,
        ciudad: presupuesto.empresas?.ciudad ?? null,
        telefono: presupuesto.empresas?.telefono ?? null,
        email: presupuesto.empresas?.email ?? null,
      }}
      cliente={{
        nombre: presupuesto.clientes?.nombre ?? "Sin cliente",
        nif: presupuesto.clientes?.nif ?? null,
        ciudad: presupuesto.clientes?.ciudad ?? null,
      }}
      numeroDocumento={numeroDocumento}
      fecha={presupuesto.fecha_emision}
      validoHasta={presupuesto.valido_hasta}
      lineas={lineas}
      baseImponible={Number(presupuesto.base_imponible)}
      totalIva={Number(presupuesto.total_iva)}
      total={Number(presupuesto.total)}
      etiquetaIva={etiquetaIva}
      condiciones={presupuesto.condiciones ?? presupuesto.empresas?.condiciones_defecto ?? null}
    />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${numeroDocumento}.pdf"`,
    },
  });
}

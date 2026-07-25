import { renderToBuffer } from "@react-pdf/renderer";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { crearUrlFirmadaLogo } from "@/lib/supabase/storage";
import { formatearNumeroDocumento } from "@/lib/formato";
import { FacturaPDF, type LineaPDF } from "@/lib/pdf/FacturaPDF";

type FilaFacturaDB = {
  id: string;
  numero: number;
  anio: number;
  serie: string;
  fecha_emision: string;
  vencimiento: string | null;
  forma_pago: string | null;
  base_imponible: number;
  total_iva: number;
  total: number;
  cliente_nombre: string;
  cliente_nif: string | null;
  cliente_direccion: string | null;
  empresas: {
    nombre: string;
    nif: string | null;
    direccion: string | null;
    ciudad: string | null;
    telefono: string | null;
    email: string | null;
    condiciones_defecto: string | null;
    logo_url: string | null;
  } | null;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  if (!empresaId) {
    return new Response("No autorizado", { status: 401 });
  }

  const { data } = await supabase
    .from("facturas")
    .select(
      "id, numero, anio, serie, fecha_emision, vencimiento, forma_pago, base_imponible, total_iva, total, cliente_nombre, cliente_nif, cliente_direccion, empresas(nombre, nif, direccion, ciudad, telefono, email, condiciones_defecto, logo_url)",
    )
    .eq("id", id)
    .eq("empresa_id", empresaId)
    .single();

  const factura = data as unknown as FilaFacturaDB | null;

  if (!factura) {
    return new Response("No encontrado", { status: 404 });
  }

  const { data: lineasDB } = await supabase
    .from("factura_lineas")
    .select("concepto, cantidad, unidad, precio_unitario, tipo_iva, importe")
    .eq("factura_id", id)
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

  const numeroDocumento = formatearNumeroDocumento(factura.serie, factura.numero, factura.anio);
  const urlLogo = await crearUrlFirmadaLogo(supabase, factura.empresas?.logo_url ?? null);

  const buffer = await renderToBuffer(
    <FacturaPDF
      empresa={{
        nombre: factura.empresas?.nombre ?? "",
        nif: factura.empresas?.nif ?? null,
        direccion: factura.empresas?.direccion ?? null,
        ciudad: factura.empresas?.ciudad ?? null,
        telefono: factura.empresas?.telefono ?? null,
        email: factura.empresas?.email ?? null,
        logoUrl: urlLogo,
      }}
      cliente={{
        nombre: factura.cliente_nombre,
        nif: factura.cliente_nif,
        direccion: factura.cliente_direccion,
      }}
      numeroDocumento={numeroDocumento}
      fecha={factura.fecha_emision}
      vencimiento={factura.vencimiento}
      lineas={lineas}
      baseImponible={Number(factura.base_imponible)}
      totalIva={Number(factura.total_iva)}
      total={Number(factura.total)}
      etiquetaIva={etiquetaIva}
      condiciones={factura.empresas?.condiciones_defecto ?? null}
      formaPago={factura.forma_pago}
    />,
  );

  const descarga = new URL(request.url).searchParams.get("descarga") === "1";

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${descarga ? "attachment" : "inline"}; filename="${numeroDocumento}.pdf"`,
    },
  });
}

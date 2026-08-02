import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { formatearNumeroDocumento } from "@/lib/formato";
import { FormularioRectificativa } from "./formulario-rectificativa";
import type { Plan } from "@/lib/limitesPlan";

export default async function RectificarFacturaPage({
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

  const [{ data: original }, { data: lineasDB }, { data: empresa }, { data: catalogoDB }, { data: yaRectificadaPor }] =
    await Promise.all([
      supabase
        .from("facturas")
        .select(
          "id, numero, anio, serie, cliente_id, cliente_nombre, cliente_nif, cliente_direccion, forma_pago, vencimiento",
        )
        .eq("id", id)
        .eq("empresa_id", empresaId)
        .single(),
      supabase
        .from("factura_lineas")
        .select("concepto, cantidad, unidad, precio_unitario, tipo_iva")
        .eq("factura_id", id)
        .order("orden"),
      supabase
        .from("empresas")
        .select("iva_defecto, serie_rectificativa, plan")
        .eq("id", empresaId)
        .single(),
      supabase
        .from("catalogo")
        .select("concepto, unidad, precio_unitario, tipo_iva")
        .eq("empresa_id", empresaId)
        .order("veces_usado", { ascending: false })
        .order("concepto"),
      supabase
        .from("facturas")
        .select("serie, numero, anio")
        .eq("rectifica_a", id)
        .limit(1)
        .maybeSingle(),
    ]);

  if (!original) {
    notFound();
  }

  const catalogo = (catalogoDB ?? []).map((item) => ({
    concepto: item.concepto,
    unidad: item.unidad,
    precioUnitario: Number(item.precio_unitario),
    tipoIva: Number(item.tipo_iva),
  }));

  const etiquetaOriginal = formatearNumeroDocumento(original.serie, original.numero, original.anio);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={`/facturas/${id}`}
          aria-label="Volver"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-borde bg-superficie text-primario hover:bg-fondo"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-heading text-[22px] font-bold text-primario">
            Rectificar {etiquetaOriginal}
          </h1>
          <p className="text-sm text-texto-secundario">
            Se crea una factura rectificativa nueva; {etiquetaOriginal} no se toca, sigue
            existiendo tal cual se emitió.
          </p>
        </div>
      </div>

      {yaRectificadaPor && (
        <p className="mb-4 rounded-lg border border-aviso/40 bg-[#FDF3DF] px-4 py-3 text-sm text-[#B87A0E]">
          Esta factura ya tiene una rectificativa (
          {formatearNumeroDocumento(
            yaRectificadaPor.serie,
            yaRectificadaPor.numero,
            yaRectificadaPor.anio,
          )}
          ). Puedes seguir si de verdad hace falta otra más.
        </p>
      )}

      <FormularioRectificativa
        empresaId={empresaId}
        plan={(empresa?.plan as Plan) ?? "gratis"}
        facturaOriginalId={original.id}
        etiquetaOriginal={etiquetaOriginal}
        cliente={{
          id: original.cliente_id,
          nombre: original.cliente_nombre,
          nif: original.cliente_nif,
          direccion: original.cliente_direccion,
        }}
        formaPagoInicial={original.forma_pago ?? ""}
        vencimientoInicial={original.vencimiento}
        lineasIniciales={(lineasDB ?? []).map((linea) => ({
          concepto: linea.concepto,
          cantidad: Number(linea.cantidad),
          unidad: linea.unidad,
          precioUnitario: Number(linea.precio_unitario),
          tipoIva: Number(linea.tipo_iva),
        }))}
        ivaDefecto={Number(empresa?.iva_defecto ?? 21)}
        serieRectificativa={empresa?.serie_rectificativa ?? "R"}
        catalogo={catalogo}
      />
    </div>
  );
}

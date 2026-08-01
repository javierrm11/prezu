import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Download, Eye, FileWarning, Lock } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import {
  formatearEuros,
  formatearFecha,
  formatearFechaHora,
  formatearNumeroDocumento,
} from "@/lib/formato";
import { estadoCobroEfectivo, tonoFactura } from "@/lib/estados";
import { etiquetaEvento } from "@/lib/eventos";
import { Badge } from "@/components/ui/Badge";
import { Boton } from "@/components/ui/Boton";
import { BotonMarcarCobrada } from "../_componentes/boton-marcar-cobrada";

export default async function FacturaDetallePage({
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

  const { data } = await supabase
    .from("facturas")
    .select(
      "id, numero, anio, serie, tipo, rectifica_a, fecha_emision, vencimiento, estado_cobro, cliente_nombre, cliente_nif, cliente_direccion, base_imponible, total_iva, total",
    )
    .eq("id", id)
    .eq("empresa_id", empresaId)
    .single();

  const factura = data as unknown as
    | {
        id: string;
        numero: number;
        anio: number;
        serie: string;
        tipo: string;
        rectifica_a: string | null;
        fecha_emision: string;
        vencimiento: string | null;
        estado_cobro: string;
        cliente_nombre: string;
        cliente_nif: string | null;
        cliente_direccion: string | null;
        base_imponible: number;
        total_iva: number;
        total: number;
      }
    | null;

  if (!factura) {
    notFound();
  }

  const [{ data: original }, { data: rectificadaPor }] = await Promise.all([
    factura.rectifica_a
      ? supabase
          .from("facturas")
          .select("id, serie, numero, anio")
          .eq("id", factura.rectifica_a)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from("facturas")
      .select("id, serie, numero, anio")
      .eq("rectifica_a", id)
      .limit(1)
      .maybeSingle(),
  ]);

  // Las facturas no tienen paso de "elegir plantilla" (usan la que
  // ya se eligió en un presupuesto o en Ajustes, "clásico" si aún
  // no se ha elegido ninguna), así que el PDF es siempre accesible
  // directamente.
  const enlaceVerPdf = `/api/facturas/${factura.id}/pdf`;
  const enlaceDescargarPdf = `/api/facturas/${factura.id}/pdf?descarga=1`;

  const { data: lineas } = await supabase
    .from("factura_lineas")
    .select("id, concepto, cantidad, unidad, precio_unitario, tipo_iva, importe")
    .eq("factura_id", id)
    .order("orden");

  const { data: eventos } = await supabase
    .from("eventos")
    .select("id, tipo, created_at")
    .eq("entidad", "factura")
    .eq("entidad_id", id)
    .order("created_at", { ascending: true });

  const etiquetaNumero = formatearNumeroDocumento(factura.serie, factura.numero, factura.anio);
  const estadoEfectivo = estadoCobroEfectivo(factura.estado_cobro, factura.vencimiento);

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
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-heading text-[22px] font-bold text-primario">
              {etiquetaNumero}
            </span>
            <span
              title="Las facturas emitidas no se pueden modificar"
              className="text-[#8A8FA3]"
            >
              <Lock size={16} />
            </span>
            <Badge tono={tonoFactura(estadoEfectivo)}>{estadoEfectivo}</Badge>
          </div>
          <div className="mt-0.5 text-sm text-texto-secundario">
            {factura.cliente_nombre}
            {factura.fecha_emision && ` · Emitida ${formatearFecha(factura.fecha_emision)}`}
            {factura.vencimiento && ` · Vence ${formatearFecha(factura.vencimiento)}`}
          </div>
          {original && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-aviso">
              <FileWarning size={13} />
              Rectifica a{" "}
              <Link href={`/facturas/${original.id}`} className="font-medium underline">
                {formatearNumeroDocumento(original.serie, original.numero, original.anio)}
              </Link>
            </div>
          )}
          {rectificadaPor && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-aviso">
              <FileWarning size={13} />
              Rectificada por{" "}
              <Link href={`/facturas/${rectificadaPor.id}`} className="font-medium underline">
                {formatearNumeroDocumento(
                  rectificadaPor.serie,
                  rectificadaPor.numero,
                  rectificadaPor.anio,
                )}
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
            <div className="hidden grid-cols-[minmax(0,3fr)_90px_100px_110px] gap-2 border-b border-borde px-4 py-2.5 text-xs font-semibold tracking-wider text-texto-secundario md:grid">
              <div>CONCEPTO</div>
              <div className="text-right">CANT.</div>
              <div className="text-right">PRECIO</div>
              <div className="text-right">IMPORTE</div>
            </div>
            {(lineas ?? []).map((linea) => (
              <div
                key={linea.id}
                className="flex flex-col gap-1 border-b border-[#EEF0F6] px-4 py-3 last:border-b-0 md:grid md:h-11 md:grid-cols-[minmax(0,3fr)_90px_100px_110px] md:items-center md:gap-2 md:py-0"
              >
                <div className="truncate text-sm text-texto">{linea.concepto}</div>
                <div className="text-[13px] text-texto-secundario md:text-right md:text-sm md:tabular-nums">
                  {linea.cantidad} {linea.unidad}
                </div>
                <div className="text-[13px] text-texto-secundario md:text-right md:text-sm md:tabular-nums">
                  {formatearEuros(Number(linea.precio_unitario))}
                </div>
                <div className="text-right text-sm font-semibold tabular-nums text-texto">
                  {formatearEuros(Number(linea.importe))}
                </div>
              </div>
            ))}
            <div className="flex justify-end bg-fondo p-4">
              <div className="flex w-full max-w-[260px] flex-col gap-2">
                <div className="flex justify-between text-sm text-texto-secundario">
                  <span>Base imponible</span>
                  <span className="tabular-nums text-texto">
                    {formatearEuros(Number(factura.base_imponible))}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-texto-secundario">
                  <span>IVA</span>
                  <span className="tabular-nums text-texto">
                    {formatearEuros(Number(factura.total_iva))}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-borde pt-2">
                  <span className="text-sm font-semibold text-texto">Total</span>
                  <span className="font-heading text-2xl font-bold tabular-nums text-primario">
                    {formatearEuros(Number(factura.total))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-start justify-end gap-2.5">
              <a href={enlaceVerPdf} target="_blank" rel="noopener noreferrer">
                <Boton variante="secundario" className="inline-flex items-center gap-2">
                  <Eye size={16} />
                  Ver PDF
                </Boton>
              </a>
              <a href={enlaceDescargarPdf}>
                <Boton variante="secundario" className="inline-flex items-center gap-2">
                  <Download size={16} />
                  Descargar PDF
                </Boton>
              </a>
              <Link href={`/facturas/${factura.id}/rectificar`}>
                <Boton variante="secundario" className="inline-flex items-center gap-2">
                  <FileWarning size={16} />
                  Rectificar
                </Boton>
              </Link>
            </div>

            {factura.estado_cobro !== "cobrada" && (
              <BotonMarcarCobrada empresaId={empresaId} facturaId={factura.id} />
            )}
          </div>

          {(factura.cliente_nif || factura.cliente_direccion) && (
            <div className="mt-4 text-xs text-texto-secundario">
              {factura.cliente_nif && <span>NIF {factura.cliente_nif}</span>}
              {factura.cliente_nif && factura.cliente_direccion && " · "}
              {factura.cliente_direccion}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta">
          <div className="mb-3.5 text-[15px] font-semibold text-texto">Actividad</div>
          {!eventos || eventos.length === 0 ? (
            <p className="text-sm text-texto-secundario">Todavía no hay actividad.</p>
          ) : (
            <div>
              {eventos.map((evento, indice) => (
                <div key={evento.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-secundario">
                      <Check size={9} strokeWidth={3.5} className="text-white" />
                    </div>
                    {indice < eventos.length - 1 && (
                      <div className="w-0.5 flex-1 min-h-[20px] bg-[#EEF0F6]" />
                    )}
                  </div>
                  <div className="pb-3.5">
                    <div className="text-sm font-medium text-texto">
                      {etiquetaEvento(evento.tipo)}
                    </div>
                    <div className="tabular-nums text-xs text-[#8A8FA3]">
                      {formatearFechaHora(evento.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

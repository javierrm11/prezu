import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Download } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import {
  formatearEuros,
  formatearFecha,
  formatearFechaHora,
  formatearNumeroDocumento,
} from "@/lib/formato";
import { tonoPresupuesto } from "@/lib/estados";
import { etiquetaEvento } from "@/lib/eventos";
import { calcularEnlacePdf } from "@/lib/pdf/enlace";
import { Badge } from "@/components/ui/Badge";
import { Boton } from "@/components/ui/Boton";
import { BotonConvertirFactura } from "../_componentes/boton-convertir-factura";
import { AccionesEstadoPresupuesto } from "../_componentes/acciones-estado-presupuesto";
import { AccionesEnviarPresupuesto } from "../_componentes/acciones-enviar-presupuesto";

const ESTADOS_TERMINALES = ["aceptado", "rechazado", "facturado", "caducado"];

export default async function PresupuestoDetallePage({
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
    .from("presupuestos")
    .select(
      "id, numero, anio, serie, estado, cliente_id, factura_id, token_publico, fecha_emision, valido_hasta, base_imponible, total_iva, total, clientes(nombre, telefono)",
    )
    .eq("id", id)
    .eq("empresa_id", empresaId)
    .single();

  const presupuesto = data as unknown as
    | {
        id: string;
        numero: number | null;
        anio: number | null;
        serie: string | null;
        estado: string;
        cliente_id: string | null;
        factura_id: string | null;
        token_publico: string;
        fecha_emision: string | null;
        valido_hasta: string | null;
        base_imponible: number;
        total_iva: number;
        total: number;
        clientes: { nombre: string; telefono: string | null } | null;
      }
    | null;

  if (!presupuesto) {
    notFound();
  }

  const fechaEmision = presupuesto.fecha_emision ?? new Date().toISOString().slice(0, 10);

  const { data: empresa } = await supabase
    .from("empresas")
    .select("nombre, serie_presupuesto, serie_factura, pdf_plantilla, estado_suscripcion")
    .eq("id", empresaId)
    .single();

  const enlacePdf = calcularEnlacePdf({
    estadoSuscripcion: empresa?.estado_suscripcion,
    pdfPlantilla: empresa?.pdf_plantilla,
    rutaDetalle: `/presupuestos/${presupuesto.id}`,
    rutaApiPdf: `/api/presupuestos/${presupuesto.id}/pdf`,
    rutaElegirPlantilla: `/presupuestos/${presupuesto.id}/elegir-plantilla`,
  });

  const { data: lineas } = await supabase
    .from("presupuesto_lineas")
    .select(
      "id, concepto, cantidad, unidad, precio_unitario, descuento_pct, tipo_iva, importe",
    )
    .eq("presupuesto_id", id)
    .order("orden");

  const { data: eventos } = await supabase
    .from("eventos")
    .select("id, tipo, created_at")
    .eq("entidad", "presupuesto")
    .eq("entidad_id", id)
    .order("created_at", { ascending: true });

  const etiquetaNumero = formatearNumeroDocumento(
    empresa?.serie_presupuesto ?? "P",
    presupuesto.numero,
    presupuesto.anio,
  );

  const enlacePublico = `${process.env.NEXT_PUBLIC_APP_URL}/p/${presupuesto.token_publico}`;

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
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-heading text-[22px] font-bold text-primario">
              {etiquetaNumero}
            </span>
            <Badge tono={tonoPresupuesto(presupuesto.estado)}>
              {presupuesto.estado}
            </Badge>
          </div>
          <div className="mt-0.5 text-sm text-texto-secundario">
            {presupuesto.clientes?.nombre ?? "Sin cliente"}
            {presupuesto.fecha_emision &&
              ` · Emitido ${formatearFecha(presupuesto.fecha_emision)}`}
            {presupuesto.valido_hasta &&
              ` · Válido hasta ${formatearFecha(presupuesto.valido_hasta)}`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
            <div className="hidden grid-cols-[minmax(0,3fr)_90px_100px_70px_110px] gap-2 border-b border-borde px-4 py-2.5 text-xs font-semibold tracking-wider text-texto-secundario md:grid">
              <div>CONCEPTO</div>
              <div className="text-right">CANT.</div>
              <div className="text-right">PRECIO</div>
              <div className="text-right">IVA</div>
              <div className="text-right">IMPORTE</div>
            </div>
            {(lineas ?? []).map((linea) => (
              <div
                key={linea.id}
                className="flex flex-col gap-1 border-b border-[#EEF0F6] px-4 py-3 last:border-b-0 md:grid md:h-11 md:grid-cols-[minmax(0,3fr)_90px_100px_70px_110px] md:items-center md:gap-2 md:py-0"
              >
                <div className="truncate text-sm text-texto">{linea.concepto}</div>
                <div className="text-[13px] text-texto-secundario md:text-right md:text-sm md:tabular-nums">
                  {linea.cantidad} {linea.unidad}
                </div>
                <div className="text-[13px] text-texto-secundario md:text-right md:text-sm md:tabular-nums">
                  {formatearEuros(Number(linea.precio_unitario))}
                </div>
                <div className="text-[13px] text-texto-secundario md:text-right md:text-sm">
                  {linea.tipo_iva} %
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
                    {formatearEuros(Number(presupuesto.base_imponible))}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-texto-secundario">
                  <span>IVA</span>
                  <span className="tabular-nums text-texto">
                    {formatearEuros(Number(presupuesto.total_iva))}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-borde pt-2">
                  <span className="text-sm font-semibold text-texto">Total</span>
                  <span className="font-heading text-2xl font-bold tabular-nums text-primario">
                    {formatearEuros(Number(presupuesto.total))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {!ESTADOS_TERMINALES.includes(presupuesto.estado) && (
            <div className="mt-4 flex justify-end">
              <AccionesEstadoPresupuesto
                empresaId={empresaId}
                presupuesto={{
                  id: presupuesto.id,
                  estado: presupuesto.estado,
                  fechaEmision,
                  numero: presupuesto.numero,
                  anio: presupuesto.anio,
                  serie: presupuesto.serie,
                }}
                seriePresupuesto={empresa?.serie_presupuesto ?? "P"}
              />
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-start justify-end gap-2.5">
            <AccionesEnviarPresupuesto
              empresaId={empresaId}
              presupuesto={{
                id: presupuesto.id,
                estado: presupuesto.estado,
                fechaEmision,
                numero: presupuesto.numero,
                anio: presupuesto.anio,
                serie: presupuesto.serie,
              }}
              seriePresupuesto={empresa?.serie_presupuesto ?? "P"}
              enlacePublico={enlacePublico}
              telefonoCliente={presupuesto.clientes?.telefono ?? null}
              clienteNombre={presupuesto.clientes?.nombre ?? "cliente"}
              negocioNombre={empresa?.nombre ?? "mi negocio"}
              total={Number(presupuesto.total)}
            />
            <a href={enlacePdf}>
              <Boton variante="secundario" className="inline-flex items-center gap-2">
                <Download size={16} />
                Descargar PDF
              </Boton>
            </a>
            {presupuesto.estado === "borrador" && (
              <Link href={`/presupuestos/${presupuesto.id}/editar`}>
                <Boton variante="secundario">Editar</Boton>
              </Link>
            )}
            {presupuesto.estado === "facturado" && presupuesto.factura_id ? (
              <Link href={`/facturas/${presupuesto.factura_id}`}>
                <Boton variante="secundario">Ver factura</Boton>
              </Link>
            ) : (
              <BotonConvertirFactura
                empresaId={empresaId}
                presupuesto={{
                  id: presupuesto.id,
                  estado: presupuesto.estado,
                  fechaEmision,
                  numero: presupuesto.numero,
                  anio: presupuesto.anio,
                  serie: presupuesto.serie,
                }}
                seriePresupuesto={empresa?.serie_presupuesto ?? "P"}
                clienteId={presupuesto.cliente_id}
                lineas={(lineas ?? []).map((linea) => ({
                  concepto: linea.concepto,
                  cantidad: Number(linea.cantidad),
                  unidad: linea.unidad,
                  precioUnitario: Number(linea.precio_unitario),
                  descuentoPct: Number(linea.descuento_pct),
                  tipoIva: Number(linea.tipo_iva),
                  importe: Number(linea.importe),
                }))}
                baseImponible={Number(presupuesto.base_imponible)}
                totalIva={Number(presupuesto.total_iva)}
                total={Number(presupuesto.total)}
                serieFactura={empresa?.serie_factura ?? "F"}
              />
            )}
          </div>
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

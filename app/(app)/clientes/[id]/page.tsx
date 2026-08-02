import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { obtenerIniciales } from "@/lib/texto";
import {
  formatearEuros,
  formatearFecha,
  formatearNumeroDocumento,
} from "@/lib/formato";
import { tonoFactura, tonoPresupuesto } from "@/lib/estados";
import { Badge } from "@/components/ui/Badge";
import { BotonEditarCliente } from "../_componentes/boton-editar-cliente";

export default async function ClienteDetallePage({
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

  const [{ data: cliente }, { data: presupuestos }, { data: facturas }] = await Promise.all([
    supabase
      .from("clientes")
      .select("id, nombre, nif, telefono, direccion")
      .eq("id", id)
      .eq("empresa_id", empresaId)
      .single(),
    supabase
      .from("presupuestos")
      .select("id, numero, anio, estado, total, fecha_emision, created_at")
      .eq("empresa_id", empresaId)
      .eq("cliente_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("facturas")
      .select("id, numero, anio, estado_cobro, total, fecha_emision, created_at")
      .eq("empresa_id", empresaId)
      .eq("cliente_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!cliente) {
    notFound();
  }

  const historial = [
    ...(presupuestos ?? []).map((p) => ({
      id: `presupuesto-${p.id}`,
      etiqueta: formatearNumeroDocumento("Presupuesto", p.numero, p.anio),
      fecha: p.fecha_emision ?? p.created_at,
      total: Number(p.total),
      estado: p.estado,
      tono: tonoPresupuesto(p.estado),
      orden: p.created_at,
    })),
    ...(facturas ?? []).map((f) => ({
      id: `factura-${f.id}`,
      etiqueta: formatearNumeroDocumento("Factura", f.numero, f.anio),
      fecha: f.fecha_emision ?? f.created_at,
      total: Number(f.total),
      estado: f.estado_cobro,
      tono: tonoFactura(f.estado_cobro),
      orden: f.created_at,
    })),
  ].sort((a, b) => (a.orden < b.orden ? 1 : -1));

  const totalFacturado = (facturas ?? []).reduce(
    (acumulado, f) => acumulado + Number(f.total),
    0,
  );

  const infoContacto = [
    cliente.nif ? `NIF ${cliente.nif}` : null,
    cliente.telefono,
    cliente.direccion,
  ].filter(Boolean);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/clientes"
          aria-label="Volver"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-borde bg-superficie text-primario hover:bg-fondo"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading text-[22px] font-bold text-primario">
          Cliente
        </h1>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-wrap items-start gap-4 rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#E8EDFB] text-lg font-semibold text-secundario">
              {obtenerIniciales(cliente.nombre)}
            </div>
            <div className="min-w-[200px] flex-1">
              <div className="text-[17px] font-semibold text-texto">
                {cliente.nombre}
              </div>
              <div className="mt-1 text-[13px] leading-relaxed text-texto-secundario">
                {infoContacto.length > 0
                  ? infoContacto.map((linea, indice) => (
                      <span key={indice}>
                        {linea}
                        <br />
                      </span>
                    ))
                  : "Sin datos de contacto"}
              </div>
            </div>
            <BotonEditarCliente empresaId={empresaId} cliente={cliente} />
          </div>

          <div>
            <h2 className="mb-2.5 font-heading text-[17px] font-bold text-primario">
              Historial de documentos
            </h2>
            {historial.length === 0 ? (
              <p className="text-sm text-texto-secundario">
                Todavía no hay presupuestos ni facturas de este cliente.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
                {historial.map((documento) => (
                  <div
                    key={documento.id}
                    className="flex items-center gap-3 border-b border-[#EEF0F6] px-4 py-3.5 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-texto">
                        {documento.etiqueta}
                      </div>
                      <div className="text-[13px] text-texto-secundario">
                        {formatearFecha(documento.fecha)}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      <div className="tabular-nums text-sm font-semibold text-texto">
                        {formatearEuros(documento.total)}
                      </div>
                      <Badge tono={documento.tono}>{documento.estado}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta">
          <div className="text-[13px] text-texto-secundario">
            Total facturado
          </div>
          <div className="font-heading tabular-nums text-[28px] font-bold text-primario">
            {formatearEuros(totalFacturado)}
          </div>
          <div className="mt-2 text-[13px] text-texto-secundario">
            {presupuestos?.length ?? 0} presupuesto
            {(presupuestos?.length ?? 0) === 1 ? "" : "s"} ·{" "}
            {facturas?.length ?? 0} factura
            {(facturas?.length ?? 0) === 1 ? "" : "s"}
          </div>
        </div>
      </div>
    </div>
  );
}

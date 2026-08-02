import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import {
  formatearEuros,
  formatearFecha,
  formatearNumeroDocumento,
  formatearTiempoRelativo,
} from "@/lib/formato";
import { estadoCobroEfectivo, tonoFactura, tonoPresupuesto } from "@/lib/estados";
import { Badge } from "@/components/ui/Badge";
import { SaludoHorario } from "./_componentes/saludo-horario";

const ESTADOS_PRESUPUESTO_RESUELTOS = ["aceptado", "rechazado", "caducado", "facturado"];
const ESTADOS_PRESUPUESTO_ACEPTADOS = ["aceptado", "facturado"];

const formateadorFechaLarga = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

type FilaUltimoPresupuesto = {
  id: string;
  numero: number | null;
  anio: number | null;
  estado: string;
  total: number;
  created_at: string;
  clientes: { nombre: string } | null;
  cliente_nombre: string | null;
  presupuesto_lineas: { concepto: string }[];
};

type FilaFacturaPendiente = {
  id: string;
  numero: number | null;
  anio: number | null;
  serie: string;
  cliente_nombre: string;
  vencimiento: string | null;
  total: number;
  estado_cobro: string;
  estadoEfectivo: string;
};

export default async function DashboardPage() {
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  let negocio = "tu negocio";
  let presupuestosEsteMes = 0;
  let facturasEmitidas = 0;
  let tasaAceptacion: number | null = null;
  let facturasPendientes: FilaFacturaPendiente[] = [];
  let pendienteCobro = 0;
  let ultimosPresupuestos: FilaUltimoPresupuesto[] = [];

  if (empresaId) {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    // Las seis consultas son independientes entre sí (todas solo
    // necesitan empresaId), así que se lanzan a la vez en vez de
    // esperarlas una detrás de otra — eso es lo que se notaba al
    // cambiar de pestaña.
    const [
      { data: empresa },
      { count: countPresupuestosEsteMes },
      { count: countFacturasEmitidas },
      { data: estadosPresupuestos },
      { data: facturasPendientesDB },
      { data: ultimosPresupuestosDB },
    ] = await Promise.all([
      supabase.from("empresas").select("nombre").eq("id", empresaId).single(),
      supabase
        .from("presupuestos")
        .select("id", { count: "exact", head: true })
        .eq("empresa_id", empresaId)
        .gte("created_at", inicioMes.toISOString()),
      supabase
        .from("facturas")
        .select("id", { count: "exact", head: true })
        .eq("empresa_id", empresaId),
      supabase.from("presupuestos").select("estado").eq("empresa_id", empresaId),
      supabase
        .from("facturas")
        .select("id, numero, anio, serie, cliente_nombre, vencimiento, total, estado_cobro")
        .eq("empresa_id", empresaId)
        .neq("estado_cobro", "cobrada")
        .order("vencimiento", { ascending: true, nullsFirst: false }),
      supabase
        .from("presupuestos")
        .select(
          "id, numero, anio, estado, total, created_at, clientes(nombre), cliente_nombre, presupuesto_lineas(concepto)",
        )
        .eq("empresa_id", empresaId)
        .order("orden", { foreignTable: "presupuesto_lineas" })
        .limit(1, { foreignTable: "presupuesto_lineas" })
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const resueltos = (estadosPresupuestos ?? []).filter((p) =>
      ESTADOS_PRESUPUESTO_RESUELTOS.includes(p.estado),
    );
    const aceptados = resueltos.filter((p) =>
      ESTADOS_PRESUPUESTO_ACEPTADOS.includes(p.estado),
    );

    negocio = empresa?.nombre ?? "tu negocio";
    presupuestosEsteMes = countPresupuestosEsteMes ?? 0;
    facturasEmitidas = countFacturasEmitidas ?? 0;
    tasaAceptacion =
      resueltos.length > 0 ? Math.round((aceptados.length / resueltos.length) * 100) : null;
    facturasPendientes = (facturasPendientesDB ?? []).map((f) => ({
      ...f,
      total: Number(f.total),
      estadoEfectivo: estadoCobroEfectivo(f.estado_cobro, f.vencimiento),
    }));
    pendienteCobro = facturasPendientes.reduce((acumulado, f) => acumulado + f.total, 0);
    ultimosPresupuestos = (ultimosPresupuestosDB as unknown as FilaUltimoPresupuesto[]) ?? [];
  }

  const fechaHoy = capitalizar(formateadorFechaLarga.format(new Date()));

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-texto-secundario">
            <SaludoHorario />,
          </div>
          <div className="font-heading text-2xl font-bold text-primario">{negocio}</div>
        </div>
        <div className="hidden pt-1.5 text-[13px] text-texto-secundario md:block">{fechaHoy}</div>
      </div>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:grid-rows-2 lg:gap-6">
        <div className="grid grid-cols-2 gap-3 lg:col-start-2 lg:row-start-1">
          <TarjetaMetrica etiqueta="Presupuestos este mes" valor={String(presupuestosEsteMes ?? 0)} />
          <TarjetaMetrica
            etiqueta="Pendiente de cobro"
            valor={formatearEuros(pendienteCobro)}
            color="text-aviso"
          />
          <TarjetaMetrica etiqueta="Facturas emitidas" valor={String(facturasEmitidas ?? 0)} />
          <TarjetaMetrica
            etiqueta="Tasa de aceptación"
            valor={tasaAceptacion == null ? "—" : `${tasaAceptacion} %`}
            color="text-exito"
          />
        </div>

        <div className="lg:col-start-1 lg:row-start-1 lg:row-span-2">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="font-heading text-[17px] font-bold text-primario">
              Últimos presupuestos
            </h2>
            <Link href="/presupuestos" className="text-[13px] font-medium text-secundario">
              Ver todos
            </Link>
          </div>
          {ultimosPresupuestos.length === 0 ? (
            <div className="rounded-xl border border-borde bg-superficie p-8 text-center shadow-tarjeta">
              <p className="text-sm text-texto-secundario">Todavía no tienes presupuestos.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
              {ultimosPresupuestos.map((presupuesto) => (
                <Link
                  key={presupuesto.id}
                  href={`/presupuestos/${presupuesto.id}`}
                  className="flex items-center gap-3 border-b border-[#EEF0F6] px-4 py-3.5 last:border-b-0 hover:bg-fondo"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-texto">
                      {presupuesto.clientes?.nombre ?? presupuesto.cliente_nombre ?? "Sin cliente"}
                    </div>
                    <div className="truncate text-[13px] text-texto-secundario">
                      {presupuesto.presupuesto_lineas[0]?.concepto || "—"}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-[15px] font-semibold tabular-nums text-texto">
                      {formatearEuros(Number(presupuesto.total))}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge tono={tonoPresupuesto(presupuesto.estado)}>
                        {presupuesto.estado}
                      </Badge>
                      <span className="text-xs text-texto-secundario">
                        {formatearTiempoRelativo(presupuesto.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-start-2 lg:row-start-2">
          <h2 className="mb-2.5 font-heading text-[17px] font-bold text-primario">
            Facturas pendientes de cobro
          </h2>
          {facturasPendientes.length === 0 ? (
            <div className="rounded-xl border border-borde bg-superficie p-8 text-center shadow-tarjeta">
              <p className="text-sm text-texto-secundario">No hay facturas pendientes.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
              {facturasPendientes.slice(0, 3).map((factura) => (
                <Link
                  key={factura.id}
                  href={`/facturas/${factura.id}`}
                  className="flex items-center gap-3 border-b border-[#EEF0F6] px-4 py-3.5 last:border-b-0 hover:bg-fondo"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-texto">
                      {factura.cliente_nombre}
                    </div>
                    <div className="text-[13px] text-texto-secundario">
                      {formatearNumeroDocumento(factura.serie, factura.numero, factura.anio)}
                      {factura.vencimiento && ` · vence ${formatearFecha(factura.vencimiento)}`}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-[15px] font-semibold tabular-nums text-texto">
                      {formatearEuros(factura.total)}
                    </span>
                    <Badge tono={tonoFactura(factura.estadoEfectivo)}>
                      {factura.estadoEfectivo}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TarjetaMetrica({
  etiqueta,
  valor,
  color = "text-texto",
}: {
  etiqueta: string;
  valor: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-borde bg-superficie p-4 shadow-tarjeta">
      <div className="mb-1.5 text-[13px] text-texto-secundario">{etiqueta}</div>
      <div className={`font-heading tabular-nums text-[26px] font-bold ${color}`}>{valor}</div>
    </div>
  );
}

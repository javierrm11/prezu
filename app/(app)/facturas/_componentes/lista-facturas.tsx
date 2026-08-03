"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatearEuros, formatearFecha, formatearNumeroDocumento } from "@/lib/formato";
import { estadoCobroEfectivo, tonoFactura } from "@/lib/estados";
import { Badge } from "@/components/ui/Badge";

export type FacturaFila = {
  id: string;
  numero: number;
  anio: number;
  serie: string;
  cliente: string;
  concepto: string;
  fechaEmision: string;
  vencimiento: string | null;
  total: number;
  estadoCobro: string;
};

type Filtro = { id: string; etiqueta: string; coincide: (estado: string) => boolean };

const FILTROS: Filtro[] = [
  { id: "todas", etiqueta: "Todas", coincide: () => true },
  { id: "pendiente", etiqueta: "Pendientes", coincide: (e) => e === "pendiente" },
  { id: "cobrada", etiqueta: "Cobradas", coincide: (e) => e === "cobrada" },
  { id: "vencida", etiqueta: "Vencidas", coincide: (e) => e === "vencida" },
];

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const formateadorMes = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });

function generarOpcionesMes() {
  const ahora = new Date();
  const opciones: { valor: string; etiqueta: string }[] = [];

  for (let i = 0; i < 3; i++) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const valor = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    opciones.push({ valor, etiqueta: capitalizar(formateadorMes.format(fecha)) });
  }

  opciones.push({ valor: `todo-${ahora.getFullYear()}`, etiqueta: `Todo ${ahora.getFullYear()}` });
  return opciones;
}

function coincideMes(fechaEmision: string, valorMes: string) {
  const clave = fechaEmision.slice(0, 7);

  if (valorMes.startsWith("todo-")) {
    return clave.startsWith(valorMes.replace("todo-", ""));
  }
  return clave === valorMes;
}

export function ListaFacturas({ facturas }: { facturas: FacturaFila[] }) {
  const opcionesMes = useMemo(() => generarOpcionesMes(), []);
  const [mes, setMes] = useState(opcionesMes[0].valor);
  const [filtroActivo, setFiltroActivo] = useState("todas");

  const delMes = useMemo(
    () => facturas.filter((factura) => coincideMes(factura.fechaEmision, mes)),
    [facturas, mes],
  );

  const conEstadoEfectivo = useMemo(
    () =>
      delMes.map((factura) => ({
        ...factura,
        estadoEfectivo: estadoCobroEfectivo(factura.estadoCobro, factura.vencimiento),
      })),
    [delMes],
  );

  const totales = useMemo(() => {
    let facturado = 0;
    let cobrado = 0;
    let pendiente = 0;

    for (const factura of conEstadoEfectivo) {
      facturado += factura.total;
      if (factura.estadoEfectivo === "cobrada") cobrado += factura.total;
      else pendiente += factura.total;
    }

    return { facturado, cobrado, pendiente };
  }, [conEstadoEfectivo]);

  const filtradas = useMemo(() => {
    const filtro = FILTROS.find((f) => f.id === filtroActivo) ?? FILTROS[0];
    return conEstadoEfectivo.filter((factura) => filtro.coincide(factura.estadoEfectivo));
  }, [conEstadoEfectivo, filtroActivo]);

  return (
    <div>
      <div className="mb-4 flex justify-start">
        <select
          value={mes}
          onChange={(evento) => setMes(evento.target.value)}
          className="h-11 w-44 rounded-lg border border-borde bg-superficie px-2.5 text-[13px] text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
        >
          {opcionesMes.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-borde bg-superficie p-3.5 shadow-tarjeta">
          <div className="mb-1 text-xs text-texto-secundario">Facturado</div>
          <div className="font-heading tabular-nums text-[19px] font-bold text-texto">
            {formatearEuros(totales.facturado)}
          </div>
        </div>
        <div className="rounded-xl border border-borde bg-superficie p-3.5 shadow-tarjeta">
          <div className="mb-1 text-xs text-texto-secundario">Cobrado</div>
          <div className="font-heading tabular-nums text-[19px] font-bold text-exito">
            {formatearEuros(totales.cobrado)}
          </div>
        </div>
        <div className="rounded-xl border border-borde bg-superficie p-3.5 shadow-tarjeta">
          <div className="mb-1 text-xs text-texto-secundario">Pendiente</div>
          <div className="font-heading tabular-nums text-[19px] font-bold text-aviso">
            {formatearEuros(totales.pendiente)}
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {FILTROS.map((filtro) => (
          <button
            key={filtro.id}
            onClick={() => setFiltroActivo(filtro.id)}
            className={`flex-shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
              filtroActivo === filtro.id
                ? "bg-primario text-white"
                : "bg-superficie text-texto-secundario hover:bg-fondo"
            }`}
          >
            {filtro.etiqueta}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-borde bg-superficie p-12 text-center shadow-tarjeta">
          <p className="text-[15px] text-texto-secundario">No hay facturas con este filtro.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
          <div className="hidden grid-cols-[90px_minmax(0,2fr)_minmax(0,3fr)_90px_90px_110px_110px] gap-2 border-b border-borde px-4 py-2.5 text-xs font-semibold tracking-wider text-texto-secundario md:grid">
            <div>Nº</div>
            <div>CLIENTE</div>
            <div>CONCEPTO</div>
            <div>EMITIDA</div>
            <div>VENCE</div>
            <div className="text-right">IMPORTE</div>
            <div>COBRO</div>
          </div>
          {filtradas.map((factura) => {
            const etiquetaNumero = formatearNumeroDocumento(
              factura.serie,
              factura.numero,
              factura.anio,
            );
            const badge = (
              <Badge tono={tonoFactura(factura.estadoEfectivo)}>{factura.estadoEfectivo}</Badge>
            );

            return (
              <Link
                key={factura.id}
                href={`/facturas/${factura.id}`}
                className="block border-b border-[#EEF0F6] last:border-b-0 hover:bg-fondo"
              >
                <div className="hidden md:grid md:h-[52px] md:grid-cols-[90px_minmax(0,2fr)_minmax(0,3fr)_90px_90px_110px_110px] md:items-center md:gap-2 md:px-4">
                  <div className="tabular-nums text-[13px] text-texto-secundario">
                    {etiquetaNumero}
                  </div>
                  <div className="truncate text-sm font-semibold text-texto">
                    {factura.cliente}
                  </div>
                  <div className="truncate text-[13px] text-texto-secundario">
                    {factura.concepto || "—"}
                  </div>
                  <div className="tabular-nums text-[13px] text-texto-secundario">
                    {formatearFecha(factura.fechaEmision)}
                  </div>
                  <div className="tabular-nums text-[13px] text-texto-secundario">
                    {factura.vencimiento ? formatearFecha(factura.vencimiento) : "—"}
                  </div>
                  <div className="text-right text-[14px] font-semibold tabular-nums text-texto">
                    {formatearEuros(factura.total)}
                  </div>
                  <div>{badge}</div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3.5 md:hidden">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-texto">
                      {factura.cliente}
                    </div>
                    <div className="truncate text-[13px] text-texto-secundario">
                      {factura.concepto || "—"}
                    </div>
                    <div className="mt-0.5 text-xs text-[#8A8FA3]">
                      {etiquetaNumero} · vence{" "}
                      {factura.vencimiento ? formatearFecha(factura.vencimiento) : "—"}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-[15px] font-semibold tabular-nums text-texto">
                      {formatearEuros(factura.total)}
                    </span>
                    {badge}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

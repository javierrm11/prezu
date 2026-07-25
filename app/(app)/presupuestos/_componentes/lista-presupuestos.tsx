"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatearEuros, formatearFecha, formatearNumeroDocumento } from "@/lib/formato";
import { tonoPresupuesto } from "@/lib/estados";
import { Badge } from "@/components/ui/Badge";
import { Boton } from "@/components/ui/Boton";

export type PresupuestoFila = {
  id: string;
  numero: number | null;
  anio: number | null;
  estado: string;
  total: number;
  fecha: string;
  cliente: string;
  concepto: string;
};

type Filtro = {
  id: string;
  etiqueta: string;
  coincide: (estado: string) => boolean;
};

const FILTROS: Filtro[] = [
  { id: "todos", etiqueta: "Todos", coincide: () => true },
  { id: "borrador", etiqueta: "Borradores", coincide: (e) => e === "borrador" },
  { id: "enviado", etiqueta: "Enviados", coincide: (e) => e === "enviado" },
  { id: "visto", etiqueta: "Vistos", coincide: (e) => e === "visto" },
  {
    id: "aceptado",
    etiqueta: "Aceptados",
    coincide: (e) => e === "aceptado" || e === "facturado",
  },
  {
    id: "rechazado",
    etiqueta: "Rechazados",
    coincide: (e) => e === "rechazado" || e === "caducado",
  },
];

export function ListaPresupuestos({
  presupuestos,
  seriePresupuesto,
}: {
  presupuestos: PresupuestoFila[];
  seriePresupuesto: string;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");

  const filtrados = useMemo(() => {
    const filtro = FILTROS.find((f) => f.id === filtroActivo) ?? FILTROS[0];
    const texto = busqueda.trim().toLowerCase();

    return presupuestos.filter((presupuesto) => {
      if (!filtro.coincide(presupuesto.estado)) return false;
      if (!texto) return true;

      const etiqueta = formatearNumeroDocumento(
        seriePresupuesto,
        presupuesto.numero,
        presupuesto.anio,
      );
      return (
        presupuesto.cliente.toLowerCase().includes(texto) ||
        presupuesto.concepto.toLowerCase().includes(texto) ||
        etiqueta.toLowerCase().includes(texto)
      );
    });
  }, [presupuestos, busqueda, filtroActivo, seriePresupuesto]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primario">Presupuestos</h1>
        <Link href="/presupuestos/nuevo">
          <Boton>Nuevo presupuesto</Boton>
        </Link>
      </div>

      <div className="relative mb-3 max-w-[420px]">
        <Search
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-texto-secundario"
        />
        <input
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar por cliente, concepto o número…"
          className="h-12 w-full rounded-lg border border-borde bg-superficie py-0 pl-[42px] pr-3.5 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
        />
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
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

      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-borde bg-superficie p-12 text-center shadow-tarjeta">
          <p className="max-w-xs text-[15px] text-texto-secundario">
            No hay presupuestos con este filtro. Crea el primero en 30 segundos.
          </p>
          <Link href="/presupuestos/nuevo">
            <Boton>Nuevo presupuesto</Boton>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
          <div className="hidden grid-cols-[90px_minmax(0,2fr)_minmax(0,3fr)_90px_110px_120px] gap-2 border-b border-borde px-4 py-2.5 text-xs font-semibold tracking-wider text-texto-secundario md:grid">
            <div>Nº</div>
            <div>CLIENTE</div>
            <div>CONCEPTO</div>
            <div>FECHA</div>
            <div className="text-right">IMPORTE</div>
            <div>ESTADO</div>
          </div>
          {filtrados.map((presupuesto) => {
            const etiquetaNumero = formatearNumeroDocumento(
              seriePresupuesto,
              presupuesto.numero,
              presupuesto.anio,
            );
            const badge = <Badge tono={tonoPresupuesto(presupuesto.estado)}>{presupuesto.estado}</Badge>;

            return (
              <Link
                key={presupuesto.id}
                href={`/presupuestos/${presupuesto.id}`}
                className="block border-b border-[#EEF0F6] last:border-b-0 hover:bg-fondo"
              >
                <div className="hidden md:grid md:h-[52px] md:grid-cols-[90px_minmax(0,2fr)_minmax(0,3fr)_90px_110px_120px] md:items-center md:gap-2 md:px-4">
                  <div className="tabular-nums text-[13px] text-texto-secundario">
                    {etiquetaNumero}
                  </div>
                  <div className="truncate text-sm font-semibold text-texto">
                    {presupuesto.cliente}
                  </div>
                  <div className="truncate text-[13px] text-texto-secundario">
                    {presupuesto.concepto || "—"}
                  </div>
                  <div className="tabular-nums text-[13px] text-texto-secundario">
                    {formatearFecha(presupuesto.fecha)}
                  </div>
                  <div className="text-right text-[14px] font-semibold tabular-nums text-texto">
                    {formatearEuros(presupuesto.total)}
                  </div>
                  <div>{badge}</div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3.5 md:hidden">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-texto">
                      {presupuesto.cliente}
                    </div>
                    <div className="truncate text-[13px] text-texto-secundario">
                      {presupuesto.concepto || "—"}
                    </div>
                    <div className="mt-0.5 text-xs text-[#8A8FA3]">
                      {etiquetaNumero} · {formatearFecha(presupuesto.fecha)}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-[15px] font-semibold tabular-nums text-texto">
                      {formatearEuros(presupuesto.total)}
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

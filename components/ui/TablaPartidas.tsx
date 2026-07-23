"use client";

import { Plus, Trash2 } from "lucide-react";
import { calcularLinea, calcularTotales } from "@/lib/importes";
import { formatearEuros } from "@/lib/formato";

export const UNIDADES = [
  { valor: "ud", etiqueta: "ud" },
  { valor: "h", etiqueta: "h" },
  { valor: "m", etiqueta: "m" },
  { valor: "m2", etiqueta: "m²" },
  { valor: "m3", etiqueta: "m³" },
  { valor: "kg", etiqueta: "kg" },
  { valor: "pa", etiqueta: "partida alzada" },
];

export const TIPOS_IVA = [21, 10, 4, 0];

export type CamposLinea = {
  concepto: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  tipoIva: number;
};

export type LineaConId = CamposLinea & { idLocal: string };

export function lineaVacia(ivaDefecto: number): CamposLinea {
  return { concepto: "", cantidad: 1, unidad: "ud", precioUnitario: 0, tipoIva: ivaDefecto };
}

type TablaPartidasProps = {
  lineas: LineaConId[];
  onActualizarLinea: (idLocal: string, cambios: Partial<CamposLinea>) => void;
  onEliminarLinea: (idLocal: string) => void;
  onAnadirLinea: () => void;
};

export function TablaPartidas({
  lineas,
  onActualizarLinea,
  onEliminarLinea,
  onAnadirLinea,
}: TablaPartidasProps) {
  const totales = calcularTotales(lineas);
  const tiposIvaUsados = new Set(lineas.map((linea) => linea.tipoIva));
  const etiquetaIva =
    tiposIvaUsados.size === 1 ? `IVA (${[...tiposIvaUsados][0]} %)` : "IVA";

  return (
    <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
      <div className="hidden grid-cols-[minmax(0,3fr)_90px_90px_110px_90px_110px_40px] gap-2 border-b border-borde px-4 py-2.5 text-xs font-semibold tracking-wider text-texto-secundario md:grid">
        <div>CONCEPTO</div>
        <div className="text-right">CANTIDAD</div>
        <div>UNIDAD</div>
        <div className="text-right">PRECIO</div>
        <div className="text-right">IVA</div>
        <div className="text-right">IMPORTE</div>
        <div />
      </div>
      {lineas.map((linea) => {
        const { importe } = calcularLinea(linea);
        return (
          <div
            key={linea.idLocal}
            className="grid grid-cols-1 gap-2 border-b border-[#EEF0F6] p-3 last:border-b-0 md:grid-cols-[minmax(0,3fr)_90px_90px_110px_90px_110px_40px] md:items-center md:gap-2 md:px-4 md:py-2"
          >
            <input
              value={linea.concepto}
              onChange={(evento) =>
                onActualizarLinea(linea.idLocal, { concepto: evento.target.value })
              }
              placeholder="Concepto"
              className="h-10 rounded-lg border border-borde px-2.5 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario md:border-transparent md:hover:border-borde"
            />
            <div className="flex items-center gap-2 md:contents">
              <input
                type="number"
                min={0}
                step="0.01"
                value={linea.cantidad}
                onChange={(evento) =>
                  onActualizarLinea(linea.idLocal, {
                    cantidad: parseFloat(evento.target.value) || 0,
                  })
                }
                className="h-10 w-20 rounded-lg border border-borde px-2 text-right text-sm tabular-nums text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario md:w-full"
              />
              <select
                value={linea.unidad}
                onChange={(evento) =>
                  onActualizarLinea(linea.idLocal, { unidad: evento.target.value })
                }
                className="h-10 rounded-lg border border-borde px-2 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
              >
                {UNIDADES.map((unidad) => (
                  <option key={unidad.valor} value={unidad.valor}>
                    {unidad.etiqueta}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 md:contents">
              <input
                type="number"
                min={0}
                step="0.01"
                value={linea.precioUnitario}
                onChange={(evento) =>
                  onActualizarLinea(linea.idLocal, {
                    precioUnitario: parseFloat(evento.target.value) || 0,
                  })
                }
                className="h-10 flex-1 rounded-lg border border-borde px-2 text-right text-sm tabular-nums text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
              />
              <select
                value={linea.tipoIva}
                onChange={(evento) =>
                  onActualizarLinea(linea.idLocal, { tipoIva: Number(evento.target.value) })
                }
                className="h-10 rounded-lg border border-borde px-2 text-right text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
              >
                {TIPOS_IVA.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo} %
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between md:contents">
              <span className="text-sm font-semibold tabular-nums text-texto">
                {formatearEuros(importe)}
              </span>
              <button
                type="button"
                onClick={() => onEliminarLinea(linea.idLocal)}
                aria-label="Eliminar partida"
                disabled={lineas.length === 1}
                className="flex h-10 w-10 items-center justify-center justify-self-end rounded-lg text-texto-secundario hover:bg-fondo disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
      <div className="p-3">
        <button
          type="button"
          onClick={onAnadirLinea}
          className="flex items-center gap-1.5 text-sm font-medium text-secundario hover:text-primario"
        >
          <Plus size={16} />
          Añadir partida
        </button>
      </div>
      <div className="flex justify-end border-t border-borde bg-fondo p-4">
        <div className="flex w-full max-w-[260px] flex-col gap-2">
          <div className="flex justify-between text-sm text-texto-secundario">
            <span>Base imponible</span>
            <span className="tabular-nums text-texto">
              {formatearEuros(totales.baseImponible)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-texto-secundario">
            <span>{etiquetaIva}</span>
            <span className="tabular-nums text-texto">{formatearEuros(totales.totalIva)}</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-borde pt-2">
            <span className="text-sm font-semibold text-texto">Total</span>
            <span className="font-heading text-2xl font-bold tabular-nums text-primario">
              {formatearEuros(totales.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

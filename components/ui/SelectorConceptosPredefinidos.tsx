"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { formatearEuros } from "@/lib/formato";
import { CONCEPTOS_PREDEFINIDOS } from "@/lib/conceptosPredefinidos";

export type ConceptoSeleccionado = {
  concepto: string;
  unidad: string;
  precioUnitario?: number;
  tipoIva?: number;
};

export type ItemCatalogoSelector = {
  concepto: string;
  unidad: string;
  precioUnitario: number;
  tipoIva: number;
};

type SelectorConceptosPredefinidosProps = {
  catalogo?: ItemCatalogoSelector[];
  onSeleccionar: (concepto: ConceptoSeleccionado) => void;
  onCerrar: () => void;
};

export function SelectorConceptosPredefinidos({
  catalogo,
  onSeleccionar,
  onCerrar,
}: SelectorConceptosPredefinidosProps) {
  const [busqueda, setBusqueda] = useState("");
  const texto = busqueda.trim().toLowerCase();

  const tuyos = (catalogo ?? []).filter((item) =>
    item.concepto.toLowerCase().includes(texto),
  );

  const categorias = CONCEPTOS_PREDEFINIDOS.map((categoria) => ({
    ...categoria,
    conceptos: categoria.conceptos.filter((concepto) =>
      concepto.concepto.toLowerCase().includes(texto),
    ),
  })).filter((categoria) => categoria.conceptos.length > 0);

  const sinResultados = tuyos.length === 0 && categorias.length === 0;

  return (
    <Modal titulo="Elegir concepto" onCerrar={onCerrar}>
      <input
        autoFocus
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
        placeholder="Buscar…"
        className="h-11 w-full rounded-lg border border-borde px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
      />
      <div className="-mx-2 max-h-[360px] overflow-y-auto px-2">
        {sinResultados ? (
          <p className="py-4 text-center text-sm text-texto-secundario">Sin resultados</p>
        ) : (
          <>
            {tuyos.length > 0 && (
              <div className="mb-3">
                <div className="mb-1 text-xs font-semibold tracking-wider text-texto-secundario">
                  TUYOS
                </div>
                {tuyos.map((item) => (
                  <button
                    key={item.concepto}
                    type="button"
                    onClick={() =>
                      onSeleccionar({
                        concepto: item.concepto,
                        unidad: item.unidad,
                        precioUnitario: item.precioUnitario,
                        tipoIva: item.tipoIva,
                      })
                    }
                    className="flex h-11 w-full items-center justify-between rounded-lg px-2.5 text-left text-sm text-texto hover:bg-fondo"
                  >
                    <span className="truncate">{item.concepto}</span>
                    <span className="flex-shrink-0 text-xs tabular-nums text-texto-secundario">
                      {formatearEuros(item.precioUnitario)} / {item.unidad}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {categorias.map((categoria) => (
              <div key={categoria.categoria} className="mb-3">
                <div className="mb-1 text-xs font-semibold tracking-wider text-texto-secundario">
                  {categoria.categoria.toUpperCase()}
                </div>
                {categoria.conceptos.map((concepto) => (
                  <button
                    key={concepto.concepto}
                    type="button"
                    onClick={() => onSeleccionar(concepto)}
                    className="flex h-11 w-full items-center justify-between rounded-lg px-2.5 text-left text-sm text-texto hover:bg-fondo"
                  >
                    <span>{concepto.concepto}</span>
                    <span className="text-xs text-texto-secundario">{concepto.unidad}</span>
                  </button>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </Modal>
  );
}

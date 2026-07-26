"use client";

import { Check } from "lucide-react";
import { PLANTILLAS_PDF, type IdPlantillaPDF } from "@/lib/pdf/plantillas";
import { Boton } from "./Boton";
import { MiniaturaPlantillaPDF } from "./MiniaturaPlantillaPDF";

type SelectorPlantillaPDFProps = {
  actual: IdPlantillaPDF | null;
  cargando: IdPlantillaPDF | null;
  onElegir: (id: IdPlantillaPDF) => void;
  etiquetaBoton?: (esActual: boolean) => string;
};

export function SelectorPlantillaPDF({
  actual,
  cargando,
  onElegir,
  etiquetaBoton,
}: SelectorPlantillaPDFProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {PLANTILLAS_PDF.map((plantilla) => {
        const esActual = actual === plantilla.id;
        const seEstaGuardando = cargando === plantilla.id;
        return (
          <div
            key={plantilla.id}
            className={`flex flex-col gap-3 rounded-xl border-2 bg-superficie p-3.5 shadow-tarjeta ${
              esActual ? "border-acento" : "border-transparent"
            }`}
          >
            <MiniaturaPlantillaPDF plantilla={plantilla.id} />
            <div>
              <div className="flex items-center gap-1.5 text-[15px] font-semibold text-texto">
                {plantilla.nombre}
                {esActual && <Check size={15} className="text-exito" strokeWidth={2.6} />}
              </div>
              <p className="mt-0.5 text-[13px] text-texto-secundario">{plantilla.descripcion}</p>
            </div>
            <Boton
              variante={esActual ? "secundario" : "primario"}
              disabled={cargando !== null}
              onClick={() => onElegir(plantilla.id)}
              className="w-full"
            >
              {seEstaGuardando
                ? "Guardando…"
                : (etiquetaBoton?.(esActual) ?? (esActual ? "Elegido" : "Elegir este"))}
            </Boton>
          </div>
        );
      })}
    </div>
  );
}

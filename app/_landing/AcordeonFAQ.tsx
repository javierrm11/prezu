"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type PreguntaFrecuente = { pregunta: string; respuesta: string };

export function AcordeonFAQ({ preguntas }: { preguntas: PreguntaFrecuente[] }) {
  const [abierta, setAbierta] = useState(0);

  return (
    <div className="flex flex-col gap-2.5">
      {preguntas.map((item, indice) => {
        const abiertaAhora = abierta === indice;
        return (
          <div key={item.pregunta} className="overflow-hidden rounded-xl border border-borde bg-fondo">
            <button
              type="button"
              onClick={() => setAbierta((actual) => (actual === indice ? -1 : indice))}
              className="flex min-h-[60px] w-full items-center gap-3.5 px-[18px] py-4 text-left text-texto hover:bg-[#EEF0F6]"
            >
              <span className="flex-1 text-[16px] font-semibold text-balance">{item.pregunta}</span>
              <ChevronDown
                size={20}
                className={`flex-shrink-0 text-secundario transition-transform ${abiertaAhora ? "rotate-180" : ""}`}
              />
            </button>
            {abiertaAhora && (
              <div className="px-[18px] pb-[18px] text-[15px] leading-relaxed text-texto-secundario text-balance">
                {item.respuesta}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

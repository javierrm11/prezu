import type { IdPlantillaPDF } from "@/lib/pdf/plantillas";

const LINEAS_EJEMPLO = [
  { concepto: "Tubería multicapa 20 mm", importe: "174,00 €" },
  { concepto: "Plato de ducha instalado", importe: "280,00 €" },
  { concepto: "Mano de obra", importe: "280,00 €" },
];

export function MiniaturaPlantillaPDF({ plantilla }: { plantilla: IdPlantillaPDF }) {
  return (
    <div className="aspect-[210/297] w-full overflow-hidden rounded-lg border border-borde bg-white">
      {plantilla === "clasico" && <MiniaturaClasico />}
      {plantilla === "moderno" && <MiniaturaModerno />}
      {plantilla === "minimalista" && <MiniaturaMinimalista />}
      {plantilla === "acento" && <MiniaturaConAcento />}
    </div>
  );
}

function MiniaturaClasico() {
  return (
    <div className="flex h-full flex-col p-[6%] text-[5px] text-[#0D1B4B]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="h-[14px] w-[14px] rounded-[2px] bg-primario" />
          <div className="font-bold text-primario" style={{ fontSize: 7 }}>
            Fontanería Paco
          </div>
        </div>
        <div className="text-right text-[#5A6A9A]">
          <div>NIF 12345678A</div>
          <div>Córdoba</div>
        </div>
      </div>
      <div className="my-2 h-[1.5px] bg-primario" />
      <div className="flex justify-between">
        <div>
          <div className="text-[#5A6A9A]">PRESUPUESTO PARA</div>
          <div style={{ fontSize: 6 }} className="font-bold">
            María Dolores
          </div>
        </div>
        <div className="w-[35%] rounded-[3px] bg-fondo p-1 text-[#5A6A9A]">
          <div className="flex justify-between">
            <span>Nº</span>
            <span className="font-bold text-[#0D1B4B]">P-2026-014</span>
          </div>
        </div>
      </div>
      <div className="mt-2 rounded-[2px] bg-primario px-1 py-[3px] text-white">CONCEPTO</div>
      {LINEAS_EJEMPLO.map((linea) => (
        <div key={linea.concepto} className="flex justify-between border-b border-[#EEF0F6] px-1 py-[3px]">
          <span className="truncate">{linea.concepto}</span>
          <span className="font-semibold">{linea.importe}</span>
        </div>
      ))}
      <div className="mt-auto flex justify-end">
        <div className="w-[45%] rounded-[3px] bg-fondo p-1">
          <div className="flex justify-between border-t border-borde pt-[2px] font-bold text-primario" style={{ fontSize: 7 }}>
            <span>Total</span>
            <span>960,74 €</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniaturaModerno() {
  return (
    <div className="flex h-full flex-col text-[5px] text-[#0D1B4B]">
      <div className="flex items-center justify-between bg-primario px-[6%] py-2.5">
        <div className="flex items-center gap-1">
          <div className="h-[14px] w-[14px] rounded-[2px] bg-acento" />
          <div className="font-bold text-white" style={{ fontSize: 6.5 }}>
            Fontanería Paco
          </div>
        </div>
        <div className="text-right font-bold text-acento" style={{ fontSize: 7 }}>
          PRESUPUESTO
        </div>
      </div>
      <div className="flex flex-1 flex-col p-[6%] pt-2">
        <div className="flex justify-between">
          <div>
            <div className="text-[#5A6A9A]">PRESUPUESTO PARA</div>
            <div style={{ fontSize: 6 }} className="font-bold">
              María Dolores
            </div>
          </div>
          <div className="text-right text-[#5A6A9A]">
            <div>Fecha</div>
            <div className="font-bold text-[#0D1B4B]">14/07/2026</div>
          </div>
        </div>
        <div className="mt-2 border-b-[1.5px] border-acento px-1 py-[3px] font-bold text-primario">
          CONCEPTO
        </div>
        {LINEAS_EJEMPLO.map((linea, indice) => (
          <div
            key={linea.concepto}
            className={`flex justify-between px-1 py-[3px] ${indice % 2 === 1 ? "bg-fondo" : ""}`}
          >
            <span className="truncate">{linea.concepto}</span>
            <span className="font-semibold">{linea.importe}</span>
          </div>
        ))}
        <div className="mt-auto flex justify-end">
          <div className="w-[45%] border-l-2 border-acento pl-1">
            <div className="flex justify-between font-bold text-primario" style={{ fontSize: 7 }}>
              <span>Total</span>
              <span>960,74 €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniaturaMinimalista() {
  return (
    <div className="flex h-full flex-col p-[7%] text-[5px] text-[#0D1B4B]">
      <div className="flex items-center justify-between">
        <div className="font-bold" style={{ fontSize: 6.5 }}>
          Fontanería Paco
        </div>
        <div className="text-right text-[#5A6A9A]">
          <div>NIF 12345678A</div>
        </div>
      </div>
      <div className="mt-3 tracking-widest text-[#5A6A9A]">PRESUPUESTO ·</div>
      <div className="font-bold" style={{ fontSize: 11 }}>
        P-2026-014
      </div>
      <div className="mt-2 h-px bg-[#E4E7F2]" />
      <div className="mt-2 flex justify-between">
        <div>
          <div className="text-[#5A6A9A]">PRESUPUESTO PARA</div>
          <div style={{ fontSize: 6 }} className="font-bold">
            María Dolores
          </div>
        </div>
      </div>
      <div className="mt-2 border-b border-[#0D1B4B] px-0 py-[3px] tracking-wide text-[#5A6A9A]">
        CONCEPTO
      </div>
      {LINEAS_EJEMPLO.map((linea) => (
        <div key={linea.concepto} className="flex justify-between border-b border-[#E4E7F2] px-0 py-[3px]">
          <span className="truncate">{linea.concepto}</span>
          <span>{linea.importe}</span>
        </div>
      ))}
      <div className="mt-auto flex justify-end">
        <div className="w-[45%] border-t border-[#0D1B4B] pt-[2px]">
          <div className="flex justify-between font-bold" style={{ fontSize: 8 }}>
            <span>Total</span>
            <span>960,74 €</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniaturaConAcento() {
  return (
    <div className="flex h-full text-[5px] text-[#0D1B4B]">
      <div className="w-[4%] bg-acento" />
      <div className="flex flex-1 flex-col p-[6%]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="h-[14px] w-[14px] rounded-[2px] bg-primario" />
            <div className="font-bold text-primario" style={{ fontSize: 6.5 }}>
              Fontanería Paco
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <div className="text-[#5A6A9A]">PRESUPUESTO PARA</div>
            <div style={{ fontSize: 6 }} className="font-bold">
              María Dolores
            </div>
          </div>
          <div className="rounded-full bg-[#FCEEDA] px-1.5 py-[2px] font-bold text-[#B87A0E]">
            P-2026-014
          </div>
        </div>
        <div className="mt-2 rounded-[2px] bg-[#0D1B4B] px-1 py-[3px] text-white">CONCEPTO</div>
        {LINEAS_EJEMPLO.map((linea) => (
          <div
            key={linea.concepto}
            className="flex items-center justify-between border-b border-[#EEF0F6] px-1 py-[3px]"
          >
            <span className="flex min-w-0 items-center gap-1">
              <span className="h-[3px] w-[3px] flex-shrink-0 rounded-full bg-acento" />
              <span className="truncate">{linea.concepto}</span>
            </span>
            <span className="font-semibold">{linea.importe}</span>
          </div>
        ))}
        <div className="mt-auto flex justify-end">
          <div className="w-[45%] rounded-[3px] bg-fondo p-1">
            <div className="flex justify-between border-t border-borde pt-[2px] font-bold text-primario" style={{ fontSize: 7 }}>
              <span>Total</span>
              <span>960,74 €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

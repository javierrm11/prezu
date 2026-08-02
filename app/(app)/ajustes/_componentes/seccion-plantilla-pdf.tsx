"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { useExigirSesion } from "@/lib/hooks/useExigirSesion";
import { SelectorPlantillaPDF } from "@/components/ui/SelectorPlantillaPDF";
import type { IdPlantillaPDF } from "@/lib/pdf/plantillas";

export function SeccionPlantillaPDF({
  empresaId,
  plantillaActual,
}: {
  empresaId: string;
  plantillaActual: IdPlantillaPDF | null;
}) {
  const router = useRouter();
  const exigirSesion = useExigirSesion();
  const [actual, setActual] = useState(plantillaActual);
  const [cargando, setCargando] = useState<IdPlantillaPDF | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function elegir(id: IdPlantillaPDF) {
    setError(null);

    if (!(await exigirSesion())) return;

    setCargando(id);

    const supabase = crearClienteNavegador();
    const { error: errorGuardado } = await supabase
      .from("empresas")
      .update({ pdf_plantilla: id })
      .eq("id", empresaId);

    setCargando(null);

    if (errorGuardado) {
      setError("No se ha podido guardar el diseño elegido");
      return;
    }

    setActual(id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta">
      <div>
        <div className="text-[15px] font-semibold text-texto">Diseño del PDF</div>
        <p className="text-sm text-texto-secundario">
          Se usa tanto en presupuestos como en facturas.
        </p>
      </div>
      {error && <p className="text-sm text-peligro">{error}</p>}
      <SelectorPlantillaPDF actual={actual} cargando={cargando} onElegir={elegir} />
    </div>
  );
}

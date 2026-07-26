"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { SelectorPlantillaPDF } from "@/components/ui/SelectorPlantillaPDF";
import type { IdPlantillaPDF } from "@/lib/pdf/plantillas";

type SelectorPlantillaPresupuestoProps = {
  empresaId: string;
  presupuestoId: string;
  plantillaActual: IdPlantillaPDF | null;
};

export function SelectorPlantillaPresupuesto({
  empresaId,
  presupuestoId,
  plantillaActual,
}: SelectorPlantillaPresupuestoProps) {
  const router = useRouter();
  const [cargando, setCargando] = useState<IdPlantillaPDF | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function elegir(id: IdPlantillaPDF) {
    setError(null);
    setCargando(id);

    const supabase = crearClienteNavegador();
    const { error: errorGuardado } = await supabase
      .from("empresas")
      .update({ pdf_plantilla: id })
      .eq("id", empresaId);

    if (errorGuardado) {
      setError("No se ha podido guardar el diseño elegido");
      setCargando(null);
      return;
    }

    window.location.href = `/api/presupuestos/${presupuestoId}/pdf`;
    router.push(`/presupuestos/${presupuestoId}`);
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-peligro">{error}</p>}
      <SelectorPlantillaPDF
        actual={plantillaActual}
        cargando={cargando}
        onElegir={elegir}
        etiquetaBoton={() => "Elegir y descargar"}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/Boton";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { asegurarPresupuestoEnviado } from "@/lib/enviarPresupuesto";
import { useExigirSesion } from "@/lib/hooks/useExigirSesion";

type Estado = "aceptado" | "rechazado";

type PresupuestoActual = {
  id: string;
  estado: string;
  fechaEmision: string;
  numero: number | null;
  anio: number | null;
  serie: string | null;
};

type AccionesEstadoPresupuestoProps = {
  empresaId: string;
  presupuesto: PresupuestoActual;
  seriePresupuesto: string;
};

export function AccionesEstadoPresupuesto({
  empresaId,
  presupuesto,
  seriePresupuesto,
}: AccionesEstadoPresupuestoProps) {
  const router = useRouter();
  const exigirSesion = useExigirSesion();
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<Estado | null>(null);

  async function cambiarEstado(estado: Estado) {
    setError(null);

    if (!(await exigirSesion())) return;

    setProcesando(estado);
    const supabase = crearClienteNavegador();

    // Marcar aceptado/rechazado a mano también cuenta como haber
    // entregado el presupuesto: si seguía en borrador, se numera
    // antes de resolverlo (nunca debe quedar un presupuesto
    // resuelto sin su P-2026-XXX).
    const resultadoEnvio = await asegurarPresupuestoEnviado(
      supabase,
      { ...presupuesto, empresaId },
      seriePresupuesto,
    );
    if ("error" in resultadoEnvio) {
      setError(resultadoEnvio.error);
      setProcesando(null);
      return;
    }

    const { error: errorUpdate } = await supabase
      .from("presupuestos")
      .update({ estado })
      .eq("id", presupuesto.id);

    if (errorUpdate) {
      setError("No se ha podido actualizar el presupuesto");
      setProcesando(null);
      return;
    }

    await supabase.from("eventos").insert({
      empresa_id: empresaId,
      entidad: "presupuesto",
      entidad_id: presupuesto.id,
      tipo: estado,
    });

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2.5">
        <Boton
          variante="peligro"
          onClick={() => cambiarEstado("rechazado")}
          disabled={procesando !== null}
        >
          {procesando === "rechazado" ? "Rechazando…" : "Rechazar"}
        </Boton>
        <Boton
          variante="secundario"
          onClick={() => cambiarEstado("aceptado")}
          disabled={procesando !== null}
        >
          {procesando === "aceptado" ? "Marcando…" : "Marcar como aceptado"}
        </Boton>
      </div>
      {error && <p className="text-sm text-peligro">{error}</p>}
    </div>
  );
}

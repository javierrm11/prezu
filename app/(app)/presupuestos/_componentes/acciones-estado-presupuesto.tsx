"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/Boton";
import { crearClienteNavegador } from "@/lib/supabase/browser";

type Estado = "aceptado" | "rechazado";

type AccionesEstadoPresupuestoProps = {
  empresaId: string;
  presupuestoId: string;
};

export function AccionesEstadoPresupuesto({
  empresaId,
  presupuestoId,
}: AccionesEstadoPresupuestoProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<Estado | null>(null);

  async function cambiarEstado(estado: Estado) {
    setError(null);
    setProcesando(estado);
    const supabase = crearClienteNavegador();

    const { error: errorUpdate } = await supabase
      .from("presupuestos")
      .update({ estado })
      .eq("id", presupuestoId);

    if (errorUpdate) {
      setError("No se ha podido actualizar el presupuesto");
      setProcesando(null);
      return;
    }

    await supabase.from("eventos").insert({
      empresa_id: empresaId,
      entidad: "presupuesto",
      entidad_id: presupuestoId,
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

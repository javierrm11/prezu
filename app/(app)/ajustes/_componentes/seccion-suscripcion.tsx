"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatearFecha } from "@/lib/formato";
import { Boton } from "@/components/ui/Boton";
import { Badge } from "@/components/ui/Badge";
import { cancelarSuscripcion, reanudarSuscripcion } from "@/app/suscripcion/acciones";

const ETIQUETAS_ESTADO: Record<string, string> = {
  trialing: "En prueba",
  active: "Activa",
};

export type SuscripcionAjustes = {
  estado: string;
  periodoFin: string | null;
  cancelaAlFinal: boolean;
};

export function SeccionSuscripcion({ estado, periodoFin, cancelaAlFinal }: SuscripcionAjustes) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function cancelar() {
    if (!window.confirm("¿Cancelar la suscripción? Mantendrás el acceso hasta el final del periodo ya pagado.")) {
      return;
    }
    setError(null);
    setCargando(true);
    const resultado = await cancelarSuscripcion();
    setCargando(false);
    if ("error" in resultado) {
      setError(resultado.error);
      return;
    }
    router.refresh();
  }

  async function reanudar() {
    setError(null);
    setCargando(true);
    const resultado = await reanudarSuscripcion();
    setCargando(false);
    if ("error" in resultado) {
      setError(resultado.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta">
      <div className="text-[15px] font-semibold text-texto">Suscripción</div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-texto-secundario">Estado</span>
        <Badge tono={cancelaAlFinal ? "aviso" : "exito"}>
          {cancelaAlFinal ? "Se cancelará" : (ETIQUETAS_ESTADO[estado] ?? estado)}
        </Badge>
      </div>

      {periodoFin && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-texto-secundario">
            {cancelaAlFinal ? "Acceso hasta" : "Próxima renovación"}
          </span>
          <span className="text-texto">{formatearFecha(periodoFin)}</span>
        </div>
      )}

      {error && <p className="text-sm text-peligro">{error}</p>}

      <div>
        {cancelaAlFinal ? (
          <Boton type="button" variante="secundario" onClick={reanudar} disabled={cargando}>
            {cargando ? "Reanudando…" : "Reanudar suscripción"}
          </Boton>
        ) : (
          <Boton type="button" variante="peligro" onClick={cancelar} disabled={cargando}>
            {cargando ? "Cancelando…" : "Cancelar suscripción"}
          </Boton>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatearFecha } from "@/lib/formato";
import { LIMITE_GRATIS } from "@/lib/limitesPlan";
import { Boton } from "@/components/ui/Boton";
import { Badge } from "@/components/ui/Badge";
import { cancelarSuscripcion, reanudarSuscripcion } from "@/app/suscripcion/acciones";

const ETIQUETAS_ESTADO: Record<string, string> = {
  trialing: "En prueba",
  active: "Activa",
};

const NOMBRES_PLAN: Record<string, string> = {
  gratis: "Gratis",
  basico: "Básico",
  pro: "Pro",
};

export type SuscripcionAjustes = {
  plan: "gratis" | "basico" | "pro";
  documentosUsadosEsteMes: number;
  estado: string;
  periodoFin: string | null;
  cancelaAlFinal: boolean;
};

export function SeccionSuscripcion({
  plan,
  documentosUsadosEsteMes,
  estado,
  periodoFin,
  cancelaAlFinal,
}: SuscripcionAjustes) {
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
      <div className="text-[15px] font-semibold text-texto">Plan</div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-texto-secundario">Plan actual</span>
        <Badge tono="exito">{NOMBRES_PLAN[plan] ?? plan}</Badge>
      </div>

      {plan === "gratis" ? (
        <>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-texto-secundario">Este mes</span>
            <span className="text-texto">
              {documentosUsadosEsteMes} de {LIMITE_GRATIS} documentos usados
            </span>
          </div>
          <div>
            <Link href="/suscripcion">
              <Boton type="button">Mejorar plan</Boton>
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-texto-secundario">Estado del cobro</span>
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
        </>
      )}
    </div>
  );
}

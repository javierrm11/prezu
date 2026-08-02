"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { asegurarPresupuestoEnviado } from "@/lib/enviarPresupuesto";
import { useExigirSesion } from "@/lib/hooks/useExigirSesion";
import { Boton } from "@/components/ui/Boton";

type PresupuestoActual = {
  id: string;
  estado: string;
  fechaEmision: string;
  numero: number | null;
  anio: number | null;
  serie: string | null;
};

type AccionesEnviarPresupuestoProps = {
  empresaId: string;
  presupuesto: PresupuestoActual;
  seriePresupuesto: string;
  enlacePublico: string;
};

export function AccionesEnviarPresupuesto({
  empresaId,
  presupuesto,
  seriePresupuesto,
  enlacePublico,
}: AccionesEnviarPresupuestoProps) {
  const router = useRouter();
  const exigirSesion = useExigirSesion();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function copiarEnlace() {
    setError(null);

    if (!(await exigirSesion())) return;

    setCargando(true);

    // Copiar el enlace también entrega el presupuesto: si seguía en
    // borrador, se numera antes de compartirlo (nunca debe quedar un
    // presupuesto compartido sin su P-2026-XXX).
    const resultado = await asegurarPresupuestoEnviado(
      crearClienteNavegador(),
      { ...presupuesto, empresaId },
      seriePresupuesto,
    );
    setCargando(false);
    if ("error" in resultado) {
      setError(resultado.error);
      return;
    }

    await navigator.clipboard.writeText(enlacePublico);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Boton
        variante="secundario"
        onClick={copiarEnlace}
        disabled={cargando}
        className="inline-flex items-center gap-2"
      >
        {copiado ? <Check size={16} /> : <Copy size={16} />}
        {cargando ? "Enviando…" : copiado ? "¡Copiado!" : "Copiar enlace"}
      </Boton>
      {error && <p className="text-sm text-peligro">{error}</p>}
    </div>
  );
}

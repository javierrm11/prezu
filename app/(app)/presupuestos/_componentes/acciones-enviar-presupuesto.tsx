"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, MessageCircle } from "lucide-react";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { asegurarPresupuestoEnviado } from "@/lib/enviarPresupuesto";
import { construirEnlaceWhatsApp } from "@/lib/whatsapp";
import { formatearEuros, formatearNumeroDocumento } from "@/lib/formato";
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
  telefonoCliente: string | null;
  clienteNombre: string;
  negocioNombre: string;
  total: number;
};

export function AccionesEnviarPresupuesto({
  empresaId,
  presupuesto,
  seriePresupuesto,
  enlacePublico,
  telefonoCliente,
  clienteNombre,
  negocioNombre,
  total,
}: AccionesEnviarPresupuestoProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<"whatsapp" | "copiar" | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function enviar(): Promise<{ numero: number; anio: number; serie: string } | null> {
    setError(null);
    const resultado = await asegurarPresupuestoEnviado(
      crearClienteNavegador(),
      { ...presupuesto, empresaId },
      seriePresupuesto,
    );
    if ("error" in resultado) {
      setError(resultado.error);
      return null;
    }
    return resultado;
  }

  async function enviarPorWhatsApp() {
    setCargando("whatsapp");
    const resultado = await enviar();
    setCargando(null);
    if (!resultado || !telefonoCliente) return;

    const etiqueta = formatearNumeroDocumento(resultado.serie, resultado.numero, resultado.anio);
    const mensaje = `Hola ${clienteNombre}, te paso el presupuesto ${etiqueta} de ${negocioNombre} por un importe de ${formatearEuros(total)}. Puedes verlo y aceptarlo aquí: ${enlacePublico}`;
    window.open(construirEnlaceWhatsApp(telefonoCliente, mensaje), "_blank", "noopener,noreferrer");
    router.refresh();
  }

  async function copiarEnlace() {
    setCargando("copiar");
    const resultado = await enviar();
    setCargando(null);
    if (!resultado) return;

    await navigator.clipboard.writeText(enlacePublico);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-start justify-end gap-2.5">
        <Boton
          variante="secundario"
          onClick={copiarEnlace}
          disabled={cargando !== null}
          className="inline-flex items-center gap-2"
        >
          {copiado ? <Check size={16} /> : <Copy size={16} />}
          {cargando === "copiar" ? "Enviando…" : copiado ? "¡Copiado!" : "Copiar enlace"}
        </Boton>
        {telefonoCliente && (
          <Boton
            variante="secundario"
            onClick={enviarPorWhatsApp}
            disabled={cargando !== null}
            className="inline-flex items-center gap-2"
          >
            <MessageCircle size={16} />
            {cargando === "whatsapp" ? "Enviando…" : "Enviar por WhatsApp"}
          </Boton>
        )}
      </div>
      {error && <p className="text-sm text-peligro">{error}</p>}
    </div>
  );
}

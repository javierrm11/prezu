"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { crearSesionCheckout } from "./acciones";

type BotonCompletarPagoProps = {
  plan: "basico" | "pro";
  etiqueta: string;
  volver?: string;
};

export function BotonCompletarPago({ plan, etiqueta, volver }: BotonCompletarPagoProps) {
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function iniciarPago() {
    setError(null);
    setCargando(true);

    const resultado = await crearSesionCheckout(plan, volver);

    if (resultado.error || !resultado.url) {
      setError(resultado.error ?? "No se ha podido iniciar el pago.");
      setCargando(false);
      return;
    }

    window.location.href = resultado.url;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Boton onClick={iniciarPago} disabled={cargando} className="w-full">
        {cargando ? "Redirigiendo…" : etiqueta}
      </Boton>
      {error && <p className="text-center text-sm text-peligro">{error}</p>}
    </div>
  );
}

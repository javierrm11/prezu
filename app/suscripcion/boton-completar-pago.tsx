"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { crearSesionCheckout } from "./acciones";

export function BotonCompletarPago() {
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function iniciarPago() {
    setError(null);
    setCargando(true);

    const resultado = await crearSesionCheckout();

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
        {cargando ? "Redirigiendo…" : "Completar pago"}
      </Boton>
      {error && <p className="text-sm text-peligro">{error}</p>}
    </div>
  );
}

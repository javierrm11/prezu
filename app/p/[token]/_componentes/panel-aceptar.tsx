"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { aceptarPresupuesto } from "../acciones";

export function PanelAceptar({ token }: { token: string }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmar() {
    if (!nombre.trim()) {
      setError("Escribe tu nombre para confirmar");
      return;
    }

    setError(null);
    setEnviando(true);
    const resultado = await aceptarPresupuesto(token, nombre.trim());

    if (resultado.error) {
      setError(resultado.error);
      setEnviando(false);
      return;
    }

    router.refresh();
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="h-[52px] rounded-lg bg-exito text-[16px] font-semibold text-white transition-colors hover:bg-[#128A3E] active:scale-[0.99]"
      >
        Aceptar presupuesto
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
        placeholder="Tu nombre y apellidos"
        className="h-12 rounded-lg border border-borde px-3.5 text-[15px] text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
      />
      {error && <p className="text-sm text-peligro">{error}</p>}
      <button
        type="button"
        onClick={confirmar}
        disabled={enviando}
        className="h-[52px] rounded-lg bg-exito text-[16px] font-semibold text-white transition-colors hover:bg-[#128A3E] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Confirmando…" : "Confirmar aceptación"}
      </button>
    </div>
  );
}

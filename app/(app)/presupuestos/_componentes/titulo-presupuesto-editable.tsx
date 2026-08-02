"use client";

import { useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { useExigirSesion } from "@/lib/hooks/useExigirSesion";

type TituloPresupuestoEditableProps = {
  presupuestoId: string;
  nombreInicial: string;
};

export function TituloPresupuestoEditable({
  presupuestoId,
  nombreInicial,
}: TituloPresupuestoEditableProps) {
  const exigirSesion = useExigirSesion();
  const [valor, setValor] = useState(nombreInicial);
  const [guardado, setGuardado] = useState(nombreInicial);

  async function guardar() {
    const limpio = valor.trim();

    if (!limpio) {
      setValor(guardado);
      return;
    }
    if (limpio === guardado) {
      setValor(limpio);
      return;
    }

    if (!(await exigirSesion())) return;

    setValor(limpio);
    setGuardado(limpio);

    const supabase = crearClienteNavegador();
    await supabase.from("presupuestos").update({ nombre: limpio }).eq("id", presupuestoId);
  }

  return (
    <input
      value={valor}
      onChange={(evento) => setValor(evento.target.value)}
      onBlur={guardar}
      onKeyDown={(evento) => {
        if (evento.key === "Enter") evento.currentTarget.blur();
        if (evento.key === "Escape") setValor(guardado);
      }}
      aria-label="Nombre del presupuesto"
      style={{ width: `${Math.min(Math.max(valor.length + 1, 6), 40)}ch` }}
      className="max-w-full rounded-md border border-transparent bg-transparent px-1 -mx-1 font-heading text-[22px] font-bold text-primario outline-none hover:border-borde focus:border-secundario focus:ring-1 focus:ring-secundario"
    />
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/Boton";
import { crearClienteNavegador } from "@/lib/supabase/browser";

type BotonMarcarCobradaProps = {
  empresaId: string;
  facturaId: string;
};

export function BotonMarcarCobrada({ empresaId, facturaId }: BotonMarcarCobradaProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function marcarCobrada() {
    setError(null);
    setGuardando(true);
    const supabase = crearClienteNavegador();

    const { error: errorUpdate } = await supabase
      .from("facturas")
      .update({ estado_cobro: "cobrada" })
      .eq("id", facturaId);

    if (errorUpdate) {
      setError("No se ha podido marcar como cobrada");
      setGuardando(false);
      return;
    }

    await supabase.from("eventos").insert({
      empresa_id: empresaId,
      entidad: "factura",
      entidad_id: facturaId,
      tipo: "cobrada",
    });

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Boton onClick={marcarCobrada} disabled={guardando}>
        {guardando ? "Guardando…" : "Marcar como cobrada"}
      </Boton>
      {error && <p className="text-sm text-peligro">{error}</p>}
    </div>
  );
}

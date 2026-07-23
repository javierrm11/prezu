"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Boton } from "./Boton";

export function BotonCopiarEnlace({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <Boton variante="secundario" onClick={copiar} className="inline-flex items-center gap-2">
      {copiado ? <Check size={16} /> : <Copy size={16} />}
      {copiado ? "¡Copiado!" : "Copiar enlace"}
    </Boton>
  );
}

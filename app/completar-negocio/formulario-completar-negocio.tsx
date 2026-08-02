"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { completarNegocio } from "./acciones";

export function FormularioCompletarNegocio({ nombreSugerido }: { nombreSugerido: string }) {
  const router = useRouter();
  const [nombreNegocio, setNombreNegocio] = useState(nombreSugerido);
  const [nif, setNif] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setCargando(true);

    const resultado = await completarNegocio({ nombreNegocio, nif });

    if (resultado.error) {
      setError(resultado.error);
      setCargando(false);
      return;
    }

    router.refresh();
    router.push("/dashboard");
  }

  return (
    <form onSubmit={enviar} className="flex w-full flex-col gap-5">
      <Campo
        id="nombre-negocio"
        label="Nombre del negocio"
        value={nombreNegocio}
        onChange={(evento) => setNombreNegocio(evento.target.value)}
        placeholder="Fontanería Paco"
        required
      />
      <Campo
        id="nif"
        label="NIF"
        value={nif}
        onChange={(evento) => setNif(evento.target.value)}
        placeholder="30XXXXXXX"
        required
      />
      {error && <p className="text-sm text-peligro">{error}</p>}
      <Boton type="submit" disabled={cargando}>
        {cargando ? "Guardando…" : "Empezar"}
      </Boton>
    </form>
  );
}

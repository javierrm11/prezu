"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { useExigirSesion } from "@/lib/hooks/useExigirSesion";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";

export type Cliente = {
  id: string;
  nombre: string;
  nif: string | null;
  telefono: string | null;
  direccion: string | null;
};

type FormularioClienteProps = {
  empresaId: string | null;
  cliente?: Cliente;
  onGuardado: () => void;
  onCancelar: () => void;
};

export function FormularioCliente({
  empresaId,
  cliente,
  onGuardado,
  onCancelar,
}: FormularioClienteProps) {
  const router = useRouter();
  const exigirSesion = useExigirSesion();
  const [nombre, setNombre] = useState(cliente?.nombre ?? "");
  const [nif, setNif] = useState(cliente?.nif ?? "");
  const [telefono, setTelefono] = useState(cliente?.telefono ?? "");
  const [direccion, setDireccion] = useState(cliente?.direccion ?? "");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    if (!(await exigirSesion())) return;

    if (!empresaId) {
      setError("No se ha encontrado tu negocio");
      return;
    }

    setGuardando(true);

    const supabase = crearClienteNavegador();
    const datos = {
      nombre,
      nif: nif || null,
      telefono: telefono || null,
      direccion: direccion || null,
    };

    const { error: errorGuardado } = cliente
      ? await supabase.from("clientes").update(datos).eq("id", cliente.id)
      : await supabase
          .from("clientes")
          .insert({ ...datos, empresa_id: empresaId });

    if (errorGuardado) {
      setError("No se ha podido guardar el cliente");
      setGuardando(false);
      return;
    }

    router.refresh();
    onGuardado();
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3.5">
      <Campo
        id="nombre"
        label="Nombre o razón social"
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
        placeholder="Ej.: María Dolores Jiménez"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Campo
          id="nif"
          label="NIF"
          value={nif}
          onChange={(evento) => setNif(evento.target.value)}
          placeholder="30XXXXXXX"
        />
        <Campo
          id="telefono"
          label="Teléfono"
          value={telefono}
          onChange={(evento) => setTelefono(evento.target.value)}
          placeholder="6XX XX XX XX"
        />
      </div>
      <Campo
        id="direccion"
        label="Dirección"
        value={direccion}
        onChange={(evento) => setDireccion(evento.target.value)}
        placeholder="Calle, número, localidad"
      />
      {error && <p className="text-sm text-peligro">{error}</p>}
      <div className="mt-1.5 flex justify-end gap-2.5">
        <Boton type="button" variante="secundario" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar cliente"}
        </Boton>
      </div>
    </form>
  );
}

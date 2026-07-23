"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { obtenerIniciales } from "@/lib/texto";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Textarea } from "@/components/ui/Textarea";

const OPCIONES_IVA = [21, 10, 0];

export type EmpresaAjustes = {
  id: string;
  nombre: string;
  nif: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  iva_defecto: number;
  condiciones_defecto: string | null;
};

export function FormularioAjustes({ empresa }: { empresa: EmpresaAjustes }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(empresa.nombre);
  const [nif, setNif] = useState(empresa.nif);
  const [direccion, setDireccion] = useState(empresa.direccion ?? "");
  const [telefono, setTelefono] = useState(empresa.telefono ?? "");
  const [email, setEmail] = useState(empresa.email ?? "");
  const [ivaDefecto, setIvaDefecto] = useState(empresa.iva_defecto);
  const [condiciones, setCondiciones] = useState(empresa.condiciones_defecto ?? "");
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);

    const supabase = crearClienteNavegador();
    const { error: errorGuardado } = await supabase
      .from("empresas")
      .update({
        nombre,
        nif,
        direccion: direccion || null,
        telefono: telefono || null,
        email: email || null,
        iva_defecto: ivaDefecto,
        condiciones_defecto: condiciones || null,
      })
      .eq("id", empresa.id);

    setGuardando(false);

    if (errorGuardado) {
      setError("No se han podido guardar los cambios");
      return;
    }

    setMensaje("Cambios guardados");
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <div className="flex flex-col gap-3.5 rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta">
        <div className="text-[15px] font-semibold text-texto">Datos del negocio</div>

        <div className="flex items-center gap-3.5">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-primario font-heading text-xl font-bold text-acento">
            {obtenerIniciales(nombre || "?")}
          </div>
          <p className="text-xs text-texto-secundario">
            El logo (PNG o JPG) se sube desde Ajustes en una próxima versión.
          </p>
        </div>

        <Campo
          id="nombre"
          label="Nombre del negocio"
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Campo
            id="nif"
            label="NIF"
            value={nif}
            onChange={(evento) => setNif(evento.target.value)}
            required
          />
          <Campo
            id="telefono"
            label="Teléfono"
            value={telefono}
            onChange={(evento) => setTelefono(evento.target.value)}
          />
        </div>
        <Campo
          id="direccion"
          label="Dirección"
          value={direccion}
          onChange={(evento) => setDireccion(evento.target.value)}
        />
        <Campo
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3.5 rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta">
        <div className="text-[15px] font-semibold text-texto">Facturación</div>

        <div>
          <div className="mb-1.5 text-sm font-medium text-texto">IVA por defecto</div>
          <div className="flex gap-2.5">
            {OPCIONES_IVA.map((opcion) => (
              <button
                key={opcion}
                type="button"
                onClick={() => setIvaDefecto(opcion)}
                className={`h-10 flex-1 rounded-lg border text-sm font-medium transition-colors ${
                  ivaDefecto === opcion
                    ? "border-secundario bg-secundario text-white"
                    : "border-borde bg-superficie text-texto hover:bg-fondo"
                }`}
              >
                {opcion} %
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-texto-secundario">
            El 10 % aplica a obras en vivienda cuando corresponde.
          </p>
        </div>

        <Textarea
          id="condiciones"
          label="Condiciones por defecto"
          value={condiciones}
          onChange={(evento) => setCondiciones(evento.target.value)}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        {error && <p className="text-sm text-peligro">{error}</p>}
        {mensaje && <p className="text-sm text-exito">{mensaje}</p>}
        <Boton type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </Boton>
      </div>
    </form>
  );
}

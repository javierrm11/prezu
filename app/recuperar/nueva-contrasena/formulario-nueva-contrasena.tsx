"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";

export function FormularioNuevaContrasena() {
  const router = useRouter();
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    if (contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (contrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);
    const supabase = crearClienteNavegador();
    const { error: errorActualizar } = await supabase.auth.updateUser({
      password: contrasena,
    });

    if (errorActualizar) {
      setError("No se ha podido guardar la contraseña. Pide un enlace nuevo e inténtalo otra vez.");
      setCargando(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="flex w-full flex-col gap-5">
      <div>
        <h1 className="font-heading text-xl font-bold text-primario">
          Elige una contraseña nueva
        </h1>
      </div>
      <Campo
        id="contrasena"
        label="Contraseña nueva"
        type="password"
        value={contrasena}
        onChange={(evento) => setContrasena(evento.target.value)}
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />
      <Campo
        id="confirmar-contrasena"
        label="Repite la contraseña"
        type="password"
        value={confirmarContrasena}
        onChange={(evento) => setConfirmarContrasena(evento.target.value)}
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />
      {error && <p className="text-sm text-peligro">{error}</p>}
      <Boton type="submit" disabled={cargando}>
        {cargando ? "Guardando…" : "Guardar contraseña"}
      </Boton>
    </form>
  );
}

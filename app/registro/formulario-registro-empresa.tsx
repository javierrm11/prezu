"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { registrarEmpresa } from "./acciones";
import { crearSesionCheckout } from "../suscripcion/acciones";

export function FormularioRegistroEmpresa() {
  const router = useRouter();
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [nif, setNif] = useState("");
  const [email, setEmail] = useState("");
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

    const resultado = await registrarEmpresa({ nombreNegocio, nif, email, contrasena });

    if (resultado.error) {
      setError(resultado.error);
      setCargando(false);
      return;
    }

    const supabase = crearClienteNavegador();
    const { error: errorLogin } = await supabase.auth.signInWithPassword({
      email,
      password: contrasena,
    });

    if (errorLogin) {
      setError("La cuenta se creó, pero no se ha podido iniciar sesión. Prueba a entrar desde el login.");
      setCargando(false);
      return;
    }

    router.refresh();

    const checkout = await crearSesionCheckout();

    if (checkout.error || !checkout.url) {
      // La cuenta y la sesión ya existen: si el checkout falla aquí,
      // /suscripcion (donde manda el layout autenticado sin
      // suscripción activa) deja reintentarlo.
      router.push("/suscripcion");
      return;
    }

    window.location.href = checkout.url;
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
      <Campo
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(evento) => setEmail(evento.target.value)}
        placeholder="paco@tunegocio.es"
        autoComplete="email"
        required
      />
      <Campo
        id="contrasena"
        label="Contraseña"
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
        {cargando ? "Creando cuenta…" : "Crear cuenta"}
      </Boton>
    </form>
  );
}

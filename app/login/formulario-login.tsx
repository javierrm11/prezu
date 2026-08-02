"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { IconoGoogle } from "@/components/ui/IconoGoogle";

const MENSAJES_ERROR: Record<string, string> = {
  enlace_invalido: "El enlace ha caducado o no es válido. Inténtalo de nuevo.",
};

export function FormularioLogin({
  volver,
  errorInicial,
}: {
  volver?: string;
  errorInicial?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(
    errorInicial ? (MENSAJES_ERROR[errorInicial] ?? null) : null,
  );
  const [cargando, setCargando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);

  const destinoInvitado =
    volver?.startsWith("/") && !volver.startsWith("//") ? volver : "/dashboard";

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setCargando(true);

    const supabase = crearClienteNavegador();
    const { error: errorLogin } = await supabase.auth.signInWithPassword({
      email,
      password: contrasena,
    });

    if (errorLogin) {
      setError("Email o contraseña incorrectos");
      setCargando(false);
      return;
    }

    router.refresh();
    router.push(volver?.startsWith("/") && !volver.startsWith("//") ? volver : "/dashboard");
  }

  async function continuarConGoogle() {
    setError(null);
    setCargandoGoogle(true);

    const supabase = crearClienteNavegador();
    const { error: errorGoogle } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/confirm?next=${destinoInvitado}` },
    });

    if (errorGoogle) {
      setError("No se ha podido continuar con Google");
      setCargandoGoogle(false);
    }
    // Si no hay error, el navegador ya está navegando a Google.
  }

  return (
    <form onSubmit={enviar} className="flex w-full flex-col gap-5">
      <Boton
        type="button"
        variante="secundario"
        onClick={continuarConGoogle}
        disabled={cargandoGoogle}
        className="inline-flex w-full items-center justify-center gap-2.5"
      >
        <IconoGoogle />
        {cargandoGoogle ? "Redirigiendo…" : "Continuar con Google"}
      </Boton>

      <div className="flex items-center gap-3 text-xs text-texto-secundario">
        <span className="h-px flex-1 bg-borde" />
        o con tu email
        <span className="h-px flex-1 bg-borde" />
      </div>

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
        autoComplete="current-password"
        required
      />
      {error && <p className="text-sm text-peligro">{error}</p>}
      <Boton type="submit" disabled={cargando}>
        {cargando ? "Entrando…" : "Entrar"}
      </Boton>
      <Link href={destinoInvitado}>
        <Boton type="button" variante="secundario" className="w-full">
          Continuar como invitado
        </Boton>
      </Link>
      <a href="/recuperar" className="text-center text-sm">
        ¿Has olvidado la contraseña?
      </a>
      <p className="text-center text-[13px] text-texto-secundario">
        ¿Aún no tienes cuenta?{" "}
        <a href={`/registro${volver ? `?volver=${encodeURIComponent(volver)}` : ""}`}>
          Crea una gratis
        </a>
      </p>
    </form>
  );
}

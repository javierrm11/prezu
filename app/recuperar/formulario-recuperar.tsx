"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";

export function FormularioRecuperar() {
  const searchParams = useSearchParams();
  const enlaceInvalido = searchParams.get("error") === "enlace_invalido";
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setCargando(true);

    const supabase = crearClienteNavegador();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/recuperar/nueva-contrasena`,
    });

    // Siempre el mismo mensaje, exista o no esa cuenta: si dijéramos
    // "no existe" estaríamos confirmando qué emails están dados de
    // alta en Prezu a quien sea que lo pruebe.
    setCargando(false);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-[15px] text-texto">
          Si <strong>{email}</strong> tiene una cuenta en Prezu, te hemos
          enviado un enlace para elegir una contraseña nueva.
        </p>
        <p className="text-sm text-texto-secundario">
          Revisa también la carpeta de spam. El enlace caduca en un rato, si
          no te llega puedes volver a pedirlo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex w-full flex-col gap-5">
      <div>
        <h1 className="font-heading text-xl font-bold text-primario">
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-sm text-texto-secundario">
          Ponnos tu email y te mandamos un enlace para elegir una nueva.
        </p>
      </div>
      {enlaceInvalido && (
        <p className="text-sm text-peligro">
          Ese enlace no es válido o ha caducado. Pide uno nuevo aquí abajo.
        </p>
      )}
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
      <Boton type="submit" disabled={cargando}>
        {cargando ? "Enviando…" : "Enviar enlace"}
      </Boton>
      <a href="/login" className="text-center text-sm">
        Volver al login
      </a>
    </form>
  );
}

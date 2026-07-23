"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";

export function BotonCerrarSesion() {
  const router = useRouter();
  const [cerrando, setCerrando] = useState(false);

  async function cerrarSesion() {
    setCerrando(true);
    const supabase = crearClienteNavegador();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={cerrarSesion}
      disabled={cerrando}
      className="h-11 rounded-lg px-1 text-sm font-medium text-peligro hover:bg-[#FCEAEA] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {cerrando ? "Cerrando sesión…" : "Cerrar sesión"}
    </button>
  );
}

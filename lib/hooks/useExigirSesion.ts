"use client";

import { useRouter, usePathname } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";

// El panel se puede mirar sin cuenta; esto es lo que convierte
// cualquier intento de escritura (crear, editar, borrar) en un
// redirect a /login, con vuelta a la página en la que estaba.
export function useExigirSesion() {
  const router = useRouter();
  const pathname = usePathname();

  return async function exigirSesion(): Promise<boolean> {
    const supabase = crearClienteNavegador();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?volver=${encodeURIComponent(pathname)}`);
      return false;
    }

    return true;
  };
}

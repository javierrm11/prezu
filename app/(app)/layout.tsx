import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerIniciales } from "@/lib/texto";
import { BarraLateral } from "./_componentes/barra-lateral";
import { NavMovil } from "./_componentes/nav-movil";

// El panel se puede mirar sin cuenta (vacío, sin negocio todavía);
// solo se pide login/registro al intentar escribir algo — ver
// lib/hooks/useExigirSesion.ts y las páginas que redirigen antes de
// renderizar (presupuestos/nuevo, facturas/nueva, ajustes).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const perfil = user
    ? ((
        await supabase
          .from("perfiles")
          .select("nombre, empresas(nombre)")
          .eq("user_id", user.id)
          .single()
      ).data as {
        nombre: string | null;
        empresas: { nombre: string } | null;
      } | null)
    : null;

  // Con email/contraseña el negocio (nombre + NIF) se crea antes de
  // la cuenta, en /registro. Con Google no hay ese paso previo: si
  // hay sesión pero todavía no hay perfil, falta completarlo.
  if (user && !perfil) {
    redirect("/completar-negocio");
  }

  const negocio = perfil?.empresas?.nombre ?? "Tu negocio";
  const iniciales = obtenerIniciales(perfil?.nombre ?? negocio);

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <BarraLateral autenticado={Boolean(user)} negocio={negocio} iniciales={iniciales} />
      <div className="flex min-h-0 flex-1 flex-col">
        <NavMovil />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

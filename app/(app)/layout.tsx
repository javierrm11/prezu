import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerIniciales } from "@/lib/texto";
import { BarraLateral } from "./_componentes/barra-lateral";
import { NavMovil } from "./_componentes/nav-movil";

// El acceso a la app no depende del plan: el límite del plan
// Gratis se comprueba solo al crear un presupuesto o factura (ver
// lib/limitesPlan.ts y el trigger de BD en 0015_planes.sql).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("perfiles")
    .select("nombre, empresas(nombre)")
    .eq("user_id", user.id)
    .single();

  // Sin tipos generados de Supabase, el embed many-to-one se infiere como
  // array; en tiempo de ejecución PostgREST siempre lo devuelve como objeto.
  const perfil = data as {
    nombre: string | null;
    empresas: { nombre: string } | null;
  } | null;

  const negocio = perfil?.empresas?.nombre ?? "Tu negocio";
  const iniciales = obtenerIniciales(perfil?.nombre ?? negocio);

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <BarraLateral negocio={negocio} iniciales={iniciales} />
      <div className="flex min-h-0 flex-1 flex-col">
        <NavMovil />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

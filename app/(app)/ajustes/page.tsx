import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { FormularioAjustes, type EmpresaAjustes } from "./_componentes/formulario-ajustes";
import { BotonCerrarSesion } from "./_componentes/boton-cerrar-sesion";

export default async function AjustesPage() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const empresaId = await obtenerEmpresaId(supabase);

  if (!empresaId || !user) {
    return (
      <p className="text-sm text-texto-secundario">
        No se ha encontrado tu negocio.
      </p>
    );
  }

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, nombre, nif, direccion, telefono, email, iva_defecto, condiciones_defecto")
    .eq("id", empresaId)
    .single();

  if (!empresa) {
    return (
      <p className="text-sm text-texto-secundario">
        No se ha encontrado tu negocio.
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 font-heading text-2xl font-bold text-primario">Ajustes</h1>

      <div className="flex flex-col gap-5">
        <FormularioAjustes empresa={empresa as EmpresaAjustes} />

        <div className="flex flex-col gap-3 rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta">
          <div className="text-[15px] font-semibold text-texto">Cuenta</div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-texto-secundario">Email de acceso</span>
            <span className="text-texto">{user.email}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-texto-secundario">Plan</span>
            <span className="rounded-full bg-[#FDF3DF] px-3 py-[3px] text-xs font-medium text-[#B87A0E]">
              Autónomo
            </span>
          </div>
          <div>
            <BotonCerrarSesion />
          </div>
        </div>
      </div>
    </div>
  );
}

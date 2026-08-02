import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { Logo } from "@/components/ui/Logo";
import { FormularioCompletarNegocio } from "./formulario-completar-negocio";

export default async function CompletarNegocioPage() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const empresaId = await obtenerEmpresaId(supabase);

  if (empresaId) {
    redirect("/dashboard");
  }

  const nombreSugerido =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "";

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="flex w-full max-w-[380px] flex-col gap-5">
        <div className="mb-2 flex flex-col items-center gap-2.5 text-center">
          <Logo size={32} />
          <span className="font-heading text-[22px] font-bold text-primario">
            Un último paso
          </span>
          <p className="text-sm text-texto-secundario">
            Necesitamos el nombre y el NIF de tu negocio para poder generar tus presupuestos y
            facturas.
          </p>
        </div>
        <FormularioCompletarNegocio nombreSugerido={nombreSugerido} />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { Logo } from "@/components/ui/Logo";
import { BotonCompletarPago } from "./boton-completar-pago";

const ESTADOS_CON_ACCESO = ["trialing", "active"];

const MENSAJES: Record<string, string> = {
  sin_iniciar: "Activa tu suscripción para descargar presupuestos y facturas en PDF.",
  past_due: "No hemos podido cobrar tu último pago. Actualiza el método de pago para seguir descargando PDF.",
  canceled: "Tu suscripción está cancelada. Vuelve a activarla para seguir descargando PDF.",
  incomplete: "No se ha podido completar el pago. Inténtalo de nuevo.",
  incomplete_expired: "El pago anterior caducó sin completarse. Inténtalo de nuevo.",
  paused: "Tu suscripción está en pausa. Actívala para seguir descargando PDF.",
  unpaid: "Hay un pago pendiente. Actualiza el método de pago para seguir descargando PDF.",
};

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>;
}) {
  const { volver } = await searchParams;
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const empresaId = await obtenerEmpresaId(supabase);

  if (!empresaId) {
    redirect("/login");
  }

  const { data: empresa } = await supabase
    .from("empresas")
    .select("estado_suscripcion")
    .eq("id", empresaId)
    .single();

  const estado = empresa?.estado_suscripcion ?? "sin_iniciar";

  if (ESTADOS_CON_ACCESO.includes(estado)) {
    redirect(volver?.startsWith("/") ? volver : "/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex w-full max-w-[380px] flex-col items-center gap-5 text-center">
        <div className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="font-heading text-[28px] font-bold text-primario">Prezu</span>
        </div>
        <p className="text-[15px] leading-relaxed text-texto-secundario">
          {MENSAJES[estado] ?? MENSAJES.sin_iniciar}
        </p>
        <p className="text-xs text-texto-secundario">
          1 día gratis, luego 2 € el primer mes y 5 € al mes a partir del segundo.
        </p>
        <BotonCompletarPago volver={volver} />
      </div>
    </div>
  );
}

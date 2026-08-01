import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";
import { BotonCompletarPago } from "./boton-completar-pago";

// Mensajes de problemas de cobro de una suscripción de pago ya
// contratada (Básico o Pro) — el plan Gratis nunca tiene nada de
// esto porque no depende de Stripe.
const MENSAJES_ESTADO: Record<string, string> = {
  past_due: "No hemos podido cobrar tu último pago. Actualiza el método de pago para seguir con acceso ilimitado.",
  incomplete: "No se ha podido completar el pago. Inténtalo de nuevo.",
  incomplete_expired: "El pago anterior caducó sin completarse. Inténtalo de nuevo.",
  paused: "Tu suscripción está en pausa. Actívala para seguir con acceso ilimitado.",
  unpaid: "Hay un pago pendiente. Actualiza el método de pago para seguir con acceso ilimitado.",
};

type Plan = "gratis" | "basico" | "pro";

const PLANES: {
  id: Plan;
  nombre: string;
  precio: string;
  descripcion: string;
  ventajas: string[];
}[] = [
  {
    id: "gratis",
    nombre: "Gratis",
    precio: "0 €",
    descripcion: "Captación / autónomo que factura muy poco",
    ventajas: ["Hasta 5 presupuestos o facturas al mes", "1 usuario"],
  },
  {
    id: "basico",
    nombre: "Básico",
    precio: "9 €",
    descripcion: "Autónomo con actividad habitual",
    ventajas: ["Presupuestos y facturas ilimitadas", "1 usuario", "Seguimiento de cobros"],
  },
];

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>;
}) {
  const { volver } = await searchParams;
  const destinoVolver = volver?.startsWith("/") && !volver.startsWith("//") ? volver : null;

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
    .select("plan, estado_suscripcion")
    .eq("id", empresaId)
    .single();

  const plan = (empresa?.plan as Plan | undefined) ?? "gratis";
  const estado = empresa?.estado_suscripcion ?? "sin_iniciar";
  const yaTienePlanPago = plan !== "gratis";

  return (
    <div className="flex flex-1 flex-col items-center gap-8 p-6 sm:p-10">
      <div className="flex items-center gap-2.5">
        <Logo size={32} />
        <span className="font-heading text-[28px] font-bold text-primario">Prezu</span>
      </div>

      <div className="max-w-md text-center">
        <h1 className="font-heading text-2xl font-bold text-primario">Elige tu plan</h1>
        {yaTienePlanPago && MENSAJES_ESTADO[estado] && (
          <p className="mt-2 text-sm text-peligro">{MENSAJES_ESTADO[estado]}</p>
        )}
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
        {PLANES.map((item) => {
          const esActual = item.id === plan;

          return (
            <div
              key={item.id}
              className={`flex flex-col gap-4 rounded-xl border-2 bg-superficie p-6 shadow-tarjeta ${
                esActual ? "border-acento" : "border-borde"
              }`}
            >
              <div>
                <div className="font-heading text-lg font-bold text-primario">{item.nombre}</div>
                <div className="text-xs text-texto-secundario">{item.descripcion}</div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-heading text-3xl font-bold text-texto">{item.precio}</span>
                <span className="text-sm text-texto-secundario">/mes</span>
              </div>

              <div className="flex flex-1 flex-col gap-1.5 border-t border-[#EEF0F6] pt-3.5">
                {item.ventajas.map((ventaja) => (
                  <div key={ventaja} className="flex items-start gap-2 text-sm text-texto">
                    <Check size={16} className="mt-0.5 flex-shrink-0 text-exito" strokeWidth={2.4} />
                    {ventaja}
                  </div>
                ))}
              </div>

              {esActual ? (
                <Badge tono="exito">Tu plan actual</Badge>
              ) : item.id === "gratis" ? (
                yaTienePlanPago && (
                  <p className="text-xs text-texto-secundario">
                    Cancela tu suscripción desde Ajustes para volver a Gratis.
                  </p>
                )
              ) : yaTienePlanPago ? (
                <p className="text-xs text-texto-secundario">
                  Para cambiar de plan, escríbenos y te ayudamos.
                </p>
              ) : (
                <BotonCompletarPago
                  plan={item.id as "basico" | "pro"}
                  etiqueta={`Elegir ${item.nombre}`}
                  volver={destinoVolver ?? undefined}
                />
              )}
            </div>
          );
        })}
      </div>

      {destinoVolver && (
        <Link href={destinoVolver} className="text-sm font-medium text-secundario hover:underline">
          Volver
        </Link>
      )}
    </div>
  );
}

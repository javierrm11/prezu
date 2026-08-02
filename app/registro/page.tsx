import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";
import { Boton } from "@/components/ui/Boton";
import { FormularioRegistroEmpresa } from "./formulario-registro-empresa";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>;
}) {
  const { volver } = await searchParams;
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(volver?.startsWith("/") && !volver.startsWith("//") ? volver : "/dashboard");
  }

  const destinoInvitado =
    volver?.startsWith("/") && !volver.startsWith("//") ? volver : "/dashboard";

  return (
    <div className="relative flex flex-1">
      <Link
        href="/dashboard"
        aria-label="Volver"
        className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-borde bg-superficie text-primario hover:bg-fondo"
      >
        <ArrowLeft size={20} />
      </Link>
      <div className="hidden w-[45%] flex-col justify-center gap-6 bg-primario px-16 py-12 md:flex">
        <Logo size={56} />
        <h1 className="text-pretty font-heading text-4xl leading-tight font-bold text-white">
          Del tajo al presupuesto en 30 segundos.
        </h1>
        <p className="text-base leading-relaxed text-white/70">
          Dicta las partidas por voz y envía el presupuesto por WhatsApp antes
          de recoger las herramientas.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="flex w-full max-w-[380px] flex-col gap-5">
          <div className="mb-2 flex items-center justify-center gap-2.5">
            <Logo size={32} />
            <span className="font-heading text-[28px] font-bold text-primario">
              Prezu
            </span>
          </div>

          <FormularioRegistroEmpresa volver={volver} />

          <Link href={destinoInvitado}>
            <Boton type="button" variante="secundario" className="w-full">
              Continuar como invitado
            </Boton>
          </Link>
          <p className="text-center text-[13px] text-texto-secundario">
            ¿Ya tienes cuenta?{" "}
            <Link
              href={`/login${volver ? `?volver=${encodeURIComponent(volver)}` : ""}`}
              className="font-medium text-secundario"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

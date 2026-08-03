import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";
import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de Prezu para gestionar tus presupuestos y facturas.",
  alternates: { canonical: "/login" },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string; error?: string }>;
}) {
  const { volver, error } = await searchParams;
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(volver?.startsWith("/") && !volver.startsWith("//") ? volver : "/dashboard");
  }

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
          <FormularioLogin volver={volver} errorInicial={error} />
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { Logo } from "@/components/ui/Logo";
import { SelectorRegistro } from "./selector-registro";

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

  const empresaId = user ? await obtenerEmpresaId(supabase) : null;

  return (
    <div className="relative flex flex-1">
      <Link
        href="/"
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
          <SelectorRegistro estaAutenticado={Boolean(user)} empresaId={empresaId} volver={volver} />
        </div>
      </div>
    </div>
  );
}

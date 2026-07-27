import { Suspense } from "react";
import { Logo } from "@/components/ui/Logo";
import { FormularioRecuperar } from "./formulario-recuperar";

export default function RecuperarPage() {
  return (
    <div className="flex flex-1">
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
          <Suspense fallback={null}>
            <FormularioRecuperar />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

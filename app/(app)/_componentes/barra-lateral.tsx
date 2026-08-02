"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import {
  esRutaActiva,
  NAV_NEGOCIO,
  NAV_PRINCIPAL,
  type ElementoNav,
} from "./navegacion";

type BarraLateralProps = {
  autenticado: boolean;
  negocio: string;
  iniciales: string;
};

export function BarraLateral({ autenticado, negocio, iniciales }: BarraLateralProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-shrink-0 flex-col gap-0.5 bg-primario p-3 md:flex">
      <div className="flex items-center gap-2.5 px-2 pt-1 pb-4">
        <Logo size={26} />
        <span className="font-heading text-xl font-bold text-white">
          Prezu
        </span>
      </div>

      <Link
        href="/presupuestos/nuevo"
        className="mb-3 flex h-11 items-center justify-center gap-2 rounded-lg bg-acento text-sm font-semibold text-primario transition-colors hover:bg-acento-hover"
      >
        <Plus size={20} strokeWidth={2} />
        Nuevo presupuesto
      </Link>

      <SeccionNav titulo="Principal" elementos={NAV_PRINCIPAL} pathname={pathname} />
      <SeccionNav titulo="Negocio" elementos={NAV_NEGOCIO} pathname={pathname} />

      <div className="flex-1" />

      {autenticado ? (
        <div className="mt-1 flex items-center gap-2.5 border-t border-white/10 px-2 pt-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-acento text-[13px] font-bold text-primario">
            {iniciales}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-white">
              {negocio}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-1 border-t border-white/10 px-2 pt-2.5">
          <Link
            href={`/login?volver=${encodeURIComponent(pathname)}`}
            className="flex h-10 items-center justify-center rounded-lg bg-white/10 text-sm font-medium text-white hover:bg-white/15"
          >
            Iniciar sesión o crear cuenta
          </Link>
        </div>
      )}
    </aside>
  );
}

function SeccionNav({
  titulo,
  elementos,
  pathname,
}: {
  titulo: string;
  elementos: ElementoNav[];
  pathname: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="px-2 pt-3.5 pb-1 text-[11px] font-semibold tracking-wider text-white/45">
        {titulo.toUpperCase()}
      </div>
      {elementos.map(({ href, etiqueta, icono: Icono }) => {
        const activo = esRutaActiva(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors ${
              activo
                ? "bg-white/[0.14] text-white"
                : "text-white/65 hover:bg-white/[0.08]"
            }`}
          >
            <Icono size={20} strokeWidth={1.75} />
            {etiqueta}
          </Link>
        );
      })}
    </div>
  );
}

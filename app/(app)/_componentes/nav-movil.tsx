"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { esRutaActiva, NAV_MOVIL } from "./navegacion";

export function NavMovil() {
  const pathname = usePathname();

  return (
    <nav className="flex items-stretch overflow-x-auto border-b border-borde bg-superficie md:hidden">
      {NAV_MOVIL.map((elemento) => (
        <ElementoNavMovil
          key={elemento.href}
          elemento={elemento}
          activo={esRutaActiva(pathname, elemento.href)}
        />
      ))}
    </nav>
  );
}

function ElementoNavMovil({
  elemento,
  activo,
}: {
  elemento: (typeof NAV_MOVIL)[number];
  activo: boolean;
}) {
  const Icono = elemento.icono;
  return (
    <Link
      href={elemento.href}
      className={`flex flex-shrink-0 flex-1 flex-col items-center justify-center gap-0.5 px-3 py-2 ${
        activo ? "text-secundario" : "text-texto-secundario"
      }`}
    >
      <Icono size={22} strokeWidth={1.75} />
      <span className="text-[11px] font-medium whitespace-nowrap">{elemento.etiqueta}</span>
    </Link>
  );
}

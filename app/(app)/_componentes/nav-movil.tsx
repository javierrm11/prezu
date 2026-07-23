"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { esRutaActiva, NAV_MOVIL } from "./navegacion";

export function NavMovil() {
  const pathname = usePathname();
  const mitad = Math.ceil(NAV_MOVIL.length / 2);
  const izquierda = NAV_MOVIL.slice(0, mitad);
  const derecha = NAV_MOVIL.slice(mitad);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex h-[68px] items-stretch border-t border-borde bg-superficie md:hidden">
      {izquierda.map((elemento) => (
        <ElementoNavMovil
          key={elemento.href}
          elemento={elemento}
          activo={esRutaActiva(pathname, elemento.href)}
        />
      ))}

      <div className="w-[72px]" />

      {derecha.map((elemento) => (
        <ElementoNavMovil
          key={elemento.href}
          elemento={elemento}
          activo={esRutaActiva(pathname, elemento.href)}
        />
      ))}

      <Link
        href="/presupuestos/nuevo"
        aria-label="Nuevo presupuesto"
        className="absolute bottom-[34px] left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-fondo bg-acento text-primario shadow-[0_4px_12px_rgba(26,43,109,0.25)] transition-colors hover:bg-acento-hover active:scale-95"
      >
        <Plus size={26} strokeWidth={2} />
      </Link>
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
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 ${
        activo ? "text-secundario" : "text-texto-secundario"
      }`}
    >
      <Icono size={22} strokeWidth={1.75} />
      <span className="text-[11px] font-medium">{elemento.etiqueta}</span>
    </Link>
  );
}

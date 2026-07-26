"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Boton } from "@/components/ui/Boton";

const ENLACES = [
  { href: "#como-funciona", etiqueta: "Cómo funciona" },
  { href: "#precios", etiqueta: "Precios" },
  { href: "#preguntas", etiqueta: "Preguntas" },
];

export function EncabezadoLanding() {
  const [conSombra, setConSombra] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    function alScroll() {
      setConSombra(window.scrollY > 8);
    }
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-superficie transition-shadow ${
        conSombra ? "border-borde shadow-tarjeta" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center gap-5 px-5">
        <a href="#top" className="flex flex-shrink-0 items-center gap-2.5">
          <Logo size={26} />
          <span className="font-heading text-[22px] font-bold text-primario">Prezu</span>
        </a>
        <span className="flex-1" />
        <nav className="hidden items-center gap-7 md:flex">
          {ENLACES.map((enlace) => (
            <a
              key={enlace.href}
              href={enlace.href}
              className="text-[15px] font-medium text-texto-secundario hover:text-primario"
            >
              {enlace.etiqueta}
            </a>
          ))}
        </nav>
        <Link href="/registro" className="flex-shrink-0">
          <Boton className="hidden md:inline-flex">Empezar gratis</Boton>
        </Link>
        <button
          type="button"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          aria-label="Abrir menú"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-borde bg-superficie text-primario md:hidden"
        >
          {menuAbierto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuAbierto && (
        <nav className="flex flex-col border-t border-borde bg-superficie px-5 pt-2 pb-4 md:hidden">
          {ENLACES.map((enlace) => (
            <a
              key={enlace.href}
              href={enlace.href}
              onClick={() => setMenuAbierto(false)}
              className="border-b border-[#EEF0F6] py-3.5 text-[16px] font-medium text-texto last:border-b-0"
            >
              {enlace.etiqueta}
            </a>
          ))}
          <Link href="/registro" onClick={() => setMenuAbierto(false)} className="mt-3">
            <Boton className="w-full">Empezar gratis</Boton>
          </Link>
        </nav>
      )}
    </header>
  );
}

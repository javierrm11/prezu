"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormularioCliente } from "@/app/(app)/clientes/_componentes/formulario-cliente";
import { FormularioRegistroEmpresa } from "./formulario-registro-empresa";

type TipoRegistro = "empresa" | "cliente";

type SelectorRegistroProps = {
  estaAutenticado: boolean;
  empresaId: string | null;
};

export function SelectorRegistro({ estaAutenticado, empresaId }: SelectorRegistroProps) {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoRegistro>(estaAutenticado ? "cliente" : "empresa");

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tipo-registro" className="text-sm font-medium text-texto">
          ¿Qué quieres crear?
        </label>
        <select
          id="tipo-registro"
          value={tipo}
          onChange={(evento) => setTipo(evento.target.value as TipoRegistro)}
          className="h-12 rounded-lg border border-borde bg-superficie px-3.5 text-[15px] text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
        >
          <option value="empresa">Cuenta de negocio</option>
          <option value="cliente">Cliente nuevo</option>
        </select>
      </div>

      {tipo === "empresa" &&
        (estaAutenticado ? (
          <p className="text-sm text-texto-secundario">
            Ya tienes una cuenta de negocio abierta. Si quieres dar de alta un cliente, elige
            &quot;Cliente nuevo&quot; arriba.
          </p>
        ) : (
          <FormularioRegistroEmpresa />
        ))}

      {tipo === "cliente" &&
        (estaAutenticado && empresaId ? (
          <FormularioCliente
            empresaId={empresaId}
            onGuardado={() => router.push("/clientes")}
            onCancelar={() => router.push("/dashboard")}
          />
        ) : (
          <p className="text-sm text-texto-secundario">
            Para dar de alta un cliente primero tienes que iniciar sesión con tu cuenta de
            negocio.{" "}
            <Link href="/login" className="font-medium text-secundario">
              Entrar
            </Link>
          </p>
        ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Modal } from "@/components/ui/Modal";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { FormularioCliente } from "./formulario-cliente";

export function BotonNuevoCliente() {
  const [abierto, setAbierto] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  async function abrir() {
    setEmpresaId(await obtenerEmpresaId(crearClienteNavegador()));
    setAbierto(true);
  }

  return (
    <>
      <Boton variante="secundario" onClick={abrir}>
        Nuevo cliente
      </Boton>
      {abierto && (
        <Modal titulo="Nuevo cliente" onCerrar={() => setAbierto(false)}>
          <FormularioCliente
            empresaId={empresaId}
            onGuardado={() => setAbierto(false)}
            onCancelar={() => setAbierto(false)}
          />
        </Modal>
      )}
    </>
  );
}

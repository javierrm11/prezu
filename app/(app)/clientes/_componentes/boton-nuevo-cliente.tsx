"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Modal } from "@/components/ui/Modal";
import { FormularioCliente } from "./formulario-cliente";

export function BotonNuevoCliente({ empresaId }: { empresaId: string | null }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Boton variante="secundario" onClick={() => setAbierto(true)}>
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

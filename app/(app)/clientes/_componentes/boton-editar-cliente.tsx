"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Modal } from "@/components/ui/Modal";
import { FormularioCliente, type Cliente } from "./formulario-cliente";

export function BotonEditarCliente({
  empresaId,
  cliente,
}: {
  empresaId: string;
  cliente: Cliente;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Boton variante="secundario" onClick={() => setAbierto(true)}>
        Editar
      </Boton>
      {abierto && (
        <Modal titulo="Editar cliente" onCerrar={() => setAbierto(false)}>
          <FormularioCliente
            empresaId={empresaId}
            cliente={cliente}
            onGuardado={() => setAbierto(false)}
            onCancelar={() => setAbierto(false)}
          />
        </Modal>
      )}
    </>
  );
}

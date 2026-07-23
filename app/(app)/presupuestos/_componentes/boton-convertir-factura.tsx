"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/Boton";
import { crearClienteNavegador } from "@/lib/supabase/browser";

export type LineaParaFactura = {
  concepto: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  descuentoPct: number;
  tipoIva: number;
  importe: number;
};

type BotonConvertirFacturaProps = {
  empresaId: string;
  presupuestoId: string;
  clienteId: string | null;
  lineas: LineaParaFactura[];
  baseImponible: number;
  totalIva: number;
  total: number;
};

export function BotonConvertirFactura({
  empresaId,
  presupuestoId,
  clienteId,
  lineas,
  baseImponible,
  totalIva,
  total,
}: BotonConvertirFacturaProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [convirtiendo, setConvirtiendo] = useState(false);

  async function convertir() {
    if (!clienteId) {
      setError("El presupuesto no tiene cliente asignado");
      return;
    }
    if (lineas.length === 0) {
      setError("El presupuesto no tiene partidas");
      return;
    }

    setError(null);
    setConvirtiendo(true);
    const supabase = crearClienteNavegador();

    // Snapshot de los datos fiscales del cliente en el momento de
    // convertir, no una referencia compartida (regla de negocio 9).
    const { data: cliente, error: errorCliente } = await supabase
      .from("clientes")
      .select("nombre, nif, direccion")
      .eq("id", clienteId)
      .single();

    if (errorCliente || !cliente) {
      setError("No se han podido leer los datos fiscales del cliente");
      setConvirtiendo(false);
      return;
    }

    const anio = new Date().getFullYear();

    const { data: numero, error: errorNumero } = await supabase.rpc(
      "siguiente_numero",
      { p_empresa: empresaId, p_tipo: "factura", p_codigo: "F", p_anio: anio },
    );

    if (errorNumero || numero == null) {
      setError("No se ha podido asignar el número de factura");
      setConvirtiendo(false);
      return;
    }

    const { data: factura, error: errorFactura } = await supabase
      .from("facturas")
      .insert({
        empresa_id: empresaId,
        cliente_id: clienteId,
        presupuesto_id: presupuestoId,
        numero,
        serie: "F",
        anio,
        tipo: "completa",
        fecha_emision: new Date().toISOString().slice(0, 10),
        cliente_nombre: cliente.nombre,
        cliente_nif: cliente.nif,
        cliente_direccion: cliente.direccion,
        base_imponible: baseImponible,
        total_iva: totalIva,
        total_irpf: 0,
        total,
      })
      .select("id")
      .single();

    if (errorFactura || !factura) {
      setError("No se ha podido crear la factura");
      setConvirtiendo(false);
      return;
    }

    const filasLineas = lineas.map((linea, indice) => ({
      factura_id: factura.id,
      orden: indice,
      concepto: linea.concepto,
      cantidad: linea.cantidad,
      unidad: linea.unidad,
      precio_unitario: linea.precioUnitario,
      descuento_pct: linea.descuentoPct,
      tipo_iva: linea.tipoIva,
      importe: linea.importe,
    }));

    const { error: errorLineas } = await supabase
      .from("factura_lineas")
      .insert(filasLineas);

    if (errorLineas) {
      setError(
        `La factura ${numero} se creó pero hubo un problema guardando las partidas. Revísala en /facturas/${factura.id}.`,
      );
      setConvirtiendo(false);
      return;
    }

    await supabase
      .from("presupuestos")
      .update({ estado: "facturado", factura_id: factura.id })
      .eq("id", presupuestoId);

    await supabase.from("eventos").insert([
      {
        empresa_id: empresaId,
        entidad: "presupuesto",
        entidad_id: presupuestoId,
        tipo: "facturado",
      },
      {
        empresa_id: empresaId,
        entidad: "factura",
        entidad_id: factura.id,
        tipo: "emitida",
      },
    ]);

    router.push(`/facturas/${factura.id}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Boton onClick={convertir} disabled={convirtiendo}>
        {convirtiendo ? "Convirtiendo…" : "Convertir en factura"}
      </Boton>
      {error && <p className="max-w-xs text-right text-sm text-peligro">{error}</p>}
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { calcularLinea, calcularTotales } from "@/lib/importes";
import { formatearEuros } from "@/lib/formato";
import {
  lineaVacia,
  TablaPartidas,
  type CamposLinea,
  type LineaConId,
} from "@/components/ui/TablaPartidas";
import { Boton } from "@/components/ui/Boton";

export type ClienteOpcion = { id: string; nombre: string };

type FormularioFacturaProps = {
  empresaId: string;
  clientes: ClienteOpcion[];
  ivaDefecto: number;
};

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function sumarDias(fechaISO: string, dias: number) {
  const fecha = new Date(fechaISO);
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

export function FormularioFactura({ empresaId, clientes, ivaDefecto }: FormularioFacturaProps) {
  const router = useRouter();
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? "");
  const [fecha, setFecha] = useState(hoyISO());
  const [vencimiento, setVencimiento] = useState(sumarDias(hoyISO(), 30));
  const [formaPago, setFormaPago] = useState("");
  const [lineas, setLineas] = useState<LineaConId[]>(() => [
    { ...lineaVacia(ivaDefecto), idLocal: "inicial-0" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function actualizarLinea(idLocal: string, cambios: Partial<CamposLinea>) {
    setLineas((actuales) =>
      actuales.map((linea) => (linea.idLocal === idLocal ? { ...linea, ...cambios } : linea)),
    );
  }

  function eliminarLinea(idLocal: string) {
    setLineas((actuales) => actuales.filter((linea) => linea.idLocal !== idLocal));
  }

  function anadirLinea() {
    setLineas((actuales) => [
      ...actuales,
      { ...lineaVacia(ivaDefecto), idLocal: crypto.randomUUID() },
    ]);
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    const lineasValidas = lineas.filter((linea) => linea.concepto.trim() && linea.cantidad > 0);

    if (!clienteId) {
      setError("Elige un cliente");
      return;
    }
    if (lineasValidas.length === 0) {
      setError("Añade al menos una partida");
      return;
    }

    const totales = calcularTotales(lineasValidas);
    const confirmado = window.confirm(
      `¿Emitir la factura por ${formatearEuros(totales.total)}? Una vez emitida no se puede modificar, solo rectificar.`,
    );
    if (!confirmado) return;

    setGuardando(true);
    const supabase = crearClienteNavegador();

    // Snapshot de los datos fiscales del cliente en el momento de
    // emitir, no una referencia compartida (regla de negocio 9).
    const { data: cliente, error: errorCliente } = await supabase
      .from("clientes")
      .select("nombre, nif, direccion")
      .eq("id", clienteId)
      .single();

    if (errorCliente || !cliente) {
      setError("No se han podido leer los datos fiscales del cliente");
      setGuardando(false);
      return;
    }

    const anio = new Date(fecha).getFullYear();

    const { data: numero, error: errorNumero } = await supabase.rpc("siguiente_numero", {
      p_empresa: empresaId,
      p_tipo: "factura",
      p_codigo: "F",
      p_anio: anio,
    });

    if (errorNumero || numero == null) {
      setError("No se ha podido asignar el número de factura");
      setGuardando(false);
      return;
    }

    const { data: factura, error: errorFactura } = await supabase
      .from("facturas")
      .insert({
        empresa_id: empresaId,
        cliente_id: clienteId,
        presupuesto_id: null,
        numero,
        serie: "F",
        anio,
        tipo: "completa",
        fecha_emision: fecha,
        vencimiento: vencimiento || null,
        forma_pago: formaPago || null,
        cliente_nombre: cliente.nombre,
        cliente_nif: cliente.nif,
        cliente_direccion: cliente.direccion,
        base_imponible: totales.baseImponible,
        total_iva: totales.totalIva,
        total_irpf: 0,
        total: totales.total,
      })
      .select("id")
      .single();

    if (errorFactura || !factura) {
      setError("No se ha podido crear la factura");
      setGuardando(false);
      return;
    }

    const filasLineas = lineasValidas.map((linea, indice) => ({
      factura_id: factura.id,
      orden: indice,
      concepto: linea.concepto,
      cantidad: linea.cantidad,
      unidad: linea.unidad,
      precio_unitario: linea.precioUnitario,
      tipo_iva: linea.tipoIva,
      importe: calcularLinea(linea).importe,
    }));

    const { error: errorLineas } = await supabase.from("factura_lineas").insert(filasLineas);

    if (errorLineas) {
      setError(
        `La factura ${numero} se creó pero hubo un problema guardando las partidas. Revísala en /facturas/${factura.id}.`,
      );
      setGuardando(false);
      return;
    }

    await supabase.from("eventos").insert({
      empresa_id: empresaId,
      entidad: "factura",
      entidad_id: factura.id,
      tipo: "emitida",
    });

    router.push(`/facturas/${factura.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 rounded-xl border border-borde bg-superficie p-4 shadow-tarjeta">
        <div className="min-w-[200px] flex-[2]">
          <label className="mb-1.5 block text-sm font-medium text-texto" htmlFor="cliente">
            Cliente
          </label>
          <select
            id="cliente"
            value={clienteId}
            onChange={(evento) => setClienteId(evento.target.value)}
            className="h-11 w-full rounded-lg border border-borde bg-superficie px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
          >
            <option value="" disabled>
              Elige un cliente…
            </option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[130px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-texto" htmlFor="fecha">
            Fecha de emisión
          </label>
          <input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(evento) => setFecha(evento.target.value)}
            className="h-11 w-full rounded-lg border border-borde bg-superficie px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
          />
        </div>
        <div className="min-w-[130px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-texto" htmlFor="vencimiento">
            Vencimiento
          </label>
          <input
            id="vencimiento"
            type="date"
            value={vencimiento}
            onChange={(evento) => setVencimiento(evento.target.value)}
            className="h-11 w-full rounded-lg border border-borde bg-superficie px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
          />
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-texto" htmlFor="formaPago">
            Forma de pago
          </label>
          <input
            id="formaPago"
            value={formaPago}
            onChange={(evento) => setFormaPago(evento.target.value)}
            placeholder="Transferencia, Bizum…"
            className="h-11 w-full rounded-lg border border-borde bg-superficie px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
          />
        </div>
      </div>

      <TablaPartidas
        lineas={lineas}
        onActualizarLinea={actualizarLinea}
        onEliminarLinea={eliminarLinea}
        onAnadirLinea={anadirLinea}
      />

      {error && <p className="text-sm text-peligro">{error}</p>}

      <div className="flex justify-end gap-2.5">
        <Boton type="button" variante="secundario" onClick={() => router.back()}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardando}>
          {guardando ? "Emitiendo…" : "Emitir factura"}
        </Boton>
      </div>
    </form>
  );
}

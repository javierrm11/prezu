"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { calcularLinea, calcularTotales } from "@/lib/importes";
import {
  lineaVacia,
  TablaPartidas,
  type CamposLinea,
  type LineaConId,
} from "@/components/ui/TablaPartidas";
import { Boton } from "@/components/ui/Boton";

const VALIDEZ_DIAS = [15, 30, 60];

export type ClienteOpcion = { id: string; nombre: string };

export type PresupuestoExistente = {
  id: string;
  clienteId: string;
  fechaEmision: string;
  validezDias: number;
  lineas: CamposLinea[];
};

type FormularioPresupuestoProps = {
  empresaId: string;
  clientes: ClienteOpcion[];
  ivaDefecto: number;
  presupuestoExistente?: PresupuestoExistente;
};

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function lineasIniciales(
  presupuestoExistente: PresupuestoExistente | undefined,
  ivaDefecto: number,
): LineaConId[] {
  const base = presupuestoExistente?.lineas ?? [lineaVacia(ivaDefecto)];
  return base.map((linea, indice) => ({ ...linea, idLocal: `inicial-${indice}` }));
}

export function FormularioPresupuesto({
  empresaId,
  clientes,
  ivaDefecto,
  presupuestoExistente,
}: FormularioPresupuestoProps) {
  const router = useRouter();
  const [clienteId, setClienteId] = useState(
    presupuestoExistente?.clienteId ?? clientes[0]?.id ?? "",
  );
  const [fecha, setFecha] = useState(presupuestoExistente?.fechaEmision ?? hoyISO());
  const [validezDias, setValidezDias] = useState(presupuestoExistente?.validezDias ?? 30);
  const [lineas, setLineas] = useState<LineaConId[]>(() =>
    lineasIniciales(presupuestoExistente, ivaDefecto),
  );
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

    const lineasValidas = lineas.filter(
      (linea) => linea.concepto.trim() && linea.cantidad > 0,
    );

    if (!clienteId) {
      setError("Elige un cliente");
      return;
    }
    if (lineasValidas.length === 0) {
      setError("Añade al menos una partida");
      return;
    }

    setGuardando(true);
    const supabase = crearClienteNavegador();
    const totalesFinales = calcularTotales(lineasValidas);
    const validoHasta = new Date(fecha);
    validoHasta.setDate(validoHasta.getDate() + validezDias);

    const datosPresupuesto = {
      empresa_id: empresaId,
      cliente_id: clienteId,
      fecha_emision: fecha,
      valido_hasta: validoHasta.toISOString().slice(0, 10),
      origen: "formulario" as const,
      base_imponible: totalesFinales.baseImponible,
      total_iva: totalesFinales.totalIva,
      total: totalesFinales.total,
    };

    let presupuestoId = presupuestoExistente?.id;

    if (presupuestoId) {
      const { error: errorUpdate } = await supabase
        .from("presupuestos")
        .update(datosPresupuesto)
        .eq("id", presupuestoId);

      if (errorUpdate) {
        setError("No se ha podido guardar el presupuesto");
        setGuardando(false);
        return;
      }

      await supabase.from("presupuesto_lineas").delete().eq("presupuesto_id", presupuestoId);
    } else {
      const { data: nuevoPresupuesto, error: errorInsert } = await supabase
        .from("presupuestos")
        .insert({ ...datosPresupuesto, estado: "borrador" })
        .select("id")
        .single();

      if (errorInsert || !nuevoPresupuesto) {
        setError("No se ha podido guardar el presupuesto");
        setGuardando(false);
        return;
      }

      presupuestoId = nuevoPresupuesto.id;
    }

    const filasLineas = lineasValidas.map((linea, indice) => ({
      presupuesto_id: presupuestoId,
      orden: indice,
      concepto: linea.concepto,
      cantidad: linea.cantidad,
      unidad: linea.unidad,
      precio_unitario: linea.precioUnitario,
      tipo_iva: linea.tipoIva,
      importe: calcularLinea(linea).importe,
    }));

    const { error: errorLineas } = await supabase
      .from("presupuesto_lineas")
      .insert(filasLineas);

    if (errorLineas) {
      if (!presupuestoExistente) {
        await supabase.from("presupuestos").delete().eq("id", presupuestoId);
      }
      setError("No se han podido guardar las partidas");
      setGuardando(false);
      return;
    }

    await supabase.from("eventos").insert({
      empresa_id: empresaId,
      entidad: "presupuesto",
      entidad_id: presupuestoId,
      tipo: presupuestoExistente ? "editado" : "creado",
    });

    router.push(`/presupuestos/${presupuestoId}`);
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
            Fecha
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
          <label className="mb-1.5 block text-sm font-medium text-texto" htmlFor="validez">
            Validez
          </label>
          <select
            id="validez"
            value={validezDias}
            onChange={(evento) => setValidezDias(Number(evento.target.value))}
            className="h-11 w-full rounded-lg border border-borde bg-superficie px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
          >
            {VALIDEZ_DIAS.map((dias) => (
              <option key={dias} value={dias}>
                {dias} días
              </option>
            ))}
          </select>
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
          {guardando ? "Guardando…" : "Guardar borrador"}
        </Boton>
      </div>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { calcularLinea, calcularTotales } from "@/lib/importes";
import { puedeCrearDocumento, type Plan } from "@/lib/limitesPlan";
import { useExigirSesion } from "@/lib/hooks/useExigirSesion";
import {
  lineaVacia,
  TablaPartidas,
  type CamposLinea,
  type LineaConId,
} from "@/components/ui/TablaPartidas";
import type { ItemCatalogoSelector } from "@/components/ui/SelectorConceptosPredefinidos";
import { Boton } from "@/components/ui/Boton";
import { CajaVoz } from "@/components/ui/CajaVoz";
import { interpretarNotaVoz } from "@/lib/ia/notaVoz";

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
  plan: Plan;
  clientes: ClienteOpcion[];
  ivaDefecto: number;
  catalogo?: ItemCatalogoSelector[];
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
  plan,
  clientes,
  ivaDefecto,
  catalogo,
  presupuestoExistente,
}: FormularioPresupuestoProps) {
  const router = useRouter();
  const exigirSesion = useExigirSesion();
  const [modoCliente, setModoCliente] = useState<"existente" | "nuevo">(
    !presupuestoExistente && clientes.length === 0 ? "nuevo" : "existente",
  );
  const [clienteId, setClienteId] = useState(
    presupuestoExistente?.clienteId ?? clientes[0]?.id ?? "",
  );
  const [nombreNuevoCliente, setNombreNuevoCliente] = useState("");
  const [nifNuevoCliente, setNifNuevoCliente] = useState("");
  const [direccionNuevoCliente, setDireccionNuevoCliente] = useState("");
  const [fecha, setFecha] = useState(presupuestoExistente?.fechaEmision ?? hoyISO());
  const [validezDias, setValidezDias] = useState(presupuestoExistente?.validezDias ?? 30);
  const [lineas, setLineas] = useState<LineaConId[]>(() =>
    lineasIniciales(presupuestoExistente, ivaDefecto),
  );
  const [notaVoz, setNotaVoz] = useState("");
  const [interpretandoVoz, setInterpretandoVoz] = useState(false);
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

  function anadirLinea(prefill?: Partial<CamposLinea>) {
    setLineas((actuales) => [
      ...actuales,
      { ...lineaVacia(ivaDefecto), ...prefill, idLocal: crypto.randomUUID() },
    ]);
  }

  async function enviarNotaVoz() {
    if (!notaVoz.trim()) return;

    if (!(await exigirSesion())) return;

    setInterpretandoVoz(true);
    const partidas = await interpretarNotaVoz(notaVoz, ivaDefecto);
    setInterpretandoVoz(false);

    if (partidas.length === 0) return;

    setLineas((actuales) => [
      ...actuales,
      ...partidas.map((partida) => ({ ...partida, idLocal: crypto.randomUUID() })),
    ]);
    setNotaVoz("");
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    const lineasValidas = lineas.filter(
      (linea) => linea.concepto.trim() && linea.cantidad > 0,
    );

    if (modoCliente === "existente" ? !clienteId : !nombreNuevoCliente.trim()) {
      setError(modoCliente === "existente" ? "Elige un cliente" : "Escribe el nombre del cliente");
      return;
    }
    if (lineasValidas.length === 0) {
      setError("Añade al menos una partida");
      return;
    }

    if (!(await exigirSesion())) return;

    setGuardando(true);
    const supabase = crearClienteNavegador();

    if (!presupuestoExistente) {
      const limite = await puedeCrearDocumento(supabase, empresaId, plan);
      if (!limite.ok) {
        setError(
          "Has usado tus 5 presupuestos o facturas gratis de este mes. Mejora tu plan para seguir creando.",
        );
        setGuardando(false);
        return;
      }
    }

    const totalesFinales = calcularTotales(lineasValidas);
    const validoHasta = new Date(fecha);
    validoHasta.setDate(validoHasta.getDate() + validezDias);

    const datosComunes = {
      empresa_id: empresaId,
      fecha_emision: fecha,
      valido_hasta: validoHasta.toISOString().slice(0, 10),
      origen: "formulario" as const,
      base_imponible: totalesFinales.baseImponible,
      total_iva: totalesFinales.totalIva,
      total: totalesFinales.total,
    };

    let presupuestoId = presupuestoExistente?.id;

    if (presupuestoId) {
      // Al editar solo se permite reasignar a un cliente ya dado de
      // alta (modoCliente siempre es "existente" aquí); no se toca
      // cliente_nombre/nif/direccion para no perder los datos de un
      // cliente "solo para este presupuesto" ya guardado.
      const { error: errorUpdate } = await supabase
        .from("presupuestos")
        .update({ ...datosComunes, cliente_id: clienteId })
        .eq("id", presupuestoId);

      if (errorUpdate) {
        setError("No se ha podido guardar el presupuesto");
        setGuardando(false);
        return;
      }

      await supabase.from("presupuesto_lineas").delete().eq("presupuesto_id", presupuestoId);
    } else {
      const nombreCliente =
        modoCliente === "existente"
          ? (clientes.find((cliente) => cliente.id === clienteId)?.nombre ?? "")
          : nombreNuevoCliente.trim();

      const { data: nuevoPresupuesto, error: errorInsert } = await supabase
        .from("presupuestos")
        .insert({
          ...datosComunes,
          cliente_id: modoCliente === "existente" ? clienteId : null,
          cliente_nombre: modoCliente === "nuevo" ? nombreCliente : null,
          cliente_nif: modoCliente === "nuevo" ? nifNuevoCliente.trim() || null : null,
          cliente_direccion: modoCliente === "nuevo" ? direccionNuevoCliente.trim() || null : null,
          estado: "borrador",
          nombre: `Presupuesto ${nombreCliente}`.trim(),
        })
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
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="block text-sm font-medium text-texto" htmlFor="cliente">
              Cliente
            </label>
            {!presupuestoExistente && clientes.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setModoCliente((actual) => (actual === "existente" ? "nuevo" : "existente"))
                }
                className="text-xs font-medium text-secundario hover:underline"
              >
                {modoCliente === "existente" ? "+ Cliente nuevo" : "Elegir cliente existente"}
              </button>
            )}
          </div>

          {modoCliente === "existente" ? (
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
          ) : (
            <div className="flex flex-col gap-2">
              <input
                id="cliente"
                value={nombreNuevoCliente}
                onChange={(evento) => setNombreNuevoCliente(evento.target.value)}
                placeholder="Nombre del cliente"
                className="h-11 w-full rounded-lg border border-borde bg-superficie px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={nifNuevoCliente}
                  onChange={(evento) => setNifNuevoCliente(evento.target.value)}
                  placeholder="NIF (opcional)"
                  className="h-11 w-full rounded-lg border border-borde bg-superficie px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
                />
                <input
                  value={direccionNuevoCliente}
                  onChange={(evento) => setDireccionNuevoCliente(evento.target.value)}
                  placeholder="Dirección (opcional)"
                  className="h-11 w-full rounded-lg border border-borde bg-superficie px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
                />
              </div>
              <p className="text-xs text-texto-secundario">
                No se guarda en tu lista de Clientes, solo en este presupuesto.
              </p>
            </div>
          )}
        </div>
        <div className="w-full overflow-hidden sm:min-w-[130px] sm:w-auto sm:flex-1">
          <label className="mb-1.5 block text-sm font-medium text-texto" htmlFor="fecha">
            Fecha
          </label>
          <input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(evento) => setFecha(evento.target.value)}
            className="h-11 w-full min-w-0 overflow-hidden rounded-lg border border-borde bg-superficie px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
          />
        </div>
        <div className="w-full sm:min-w-[130px] sm:w-auto sm:flex-1">
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

      <CajaVoz
        value={notaVoz}
        onChange={setNotaVoz}
        onEnviar={enviarNotaVoz}
        enviando={interpretandoVoz}
        placeholder="Describe el trabajo o dicta por voz…"
      />

      <TablaPartidas
        lineas={lineas}
        onActualizarLinea={actualizarLinea}
        onEliminarLinea={eliminarLinea}
        onAnadirLinea={anadirLinea}
        catalogo={catalogo}
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

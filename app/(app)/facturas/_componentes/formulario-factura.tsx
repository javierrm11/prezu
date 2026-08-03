"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { calcularLinea, calcularTotales } from "@/lib/importes";
import { formatearEuros } from "@/lib/formato";
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

export type ClienteOpcion = { id: string; nombre: string };

type FormularioFacturaProps = {
  empresaId: string;
  plan: Plan;
  clientes: ClienteOpcion[];
  ivaDefecto: number;
  serieFactura: string;
  catalogo?: ItemCatalogoSelector[];
};

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function sumarDias(fechaISO: string, dias: number) {
  const fecha = new Date(fechaISO);
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

export function FormularioFactura({
  empresaId,
  plan,
  clientes,
  ivaDefecto,
  serieFactura,
  catalogo,
}: FormularioFacturaProps) {
  const router = useRouter();
  const exigirSesion = useExigirSesion();
  const [modoCliente, setModoCliente] = useState<"existente" | "nuevo">(
    clientes.length === 0 ? "nuevo" : "existente",
  );
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? "");
  const [nombreNuevoCliente, setNombreNuevoCliente] = useState("");
  const [nifNuevoCliente, setNifNuevoCliente] = useState("");
  const [direccionNuevoCliente, setDireccionNuevoCliente] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [vencimiento, setVencimiento] = useState(sumarDias(hoyISO(), 30));
  const [formaPago, setFormaPago] = useState("");
  const [lineas, setLineas] = useState<LineaConId[]>(() => [
    { ...lineaVacia(ivaDefecto), idLocal: "inicial-0" },
  ]);
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
    setLineas((actuales) => {
      // Si se elige una partida predefinida y hay una línea sin
      // concepto (la que arranca vacía por defecto), se rellena esa
      // en vez de añadir otra al lado.
      const idxVacia = prefill ? actuales.findIndex((linea) => !linea.concepto.trim()) : -1;

      if (idxVacia !== -1) {
        return actuales.map((linea, indice) =>
          indice === idxVacia ? { ...linea, ...prefill } : linea,
        );
      }

      return [...actuales, { ...lineaVacia(ivaDefecto), ...prefill, idLocal: crypto.randomUUID() }];
    });
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

    const lineasValidas = lineas.filter((linea) => linea.concepto.trim() && linea.cantidad > 0);

    if (modoCliente === "existente" ? !clienteId : !nombreNuevoCliente.trim()) {
      setError(modoCliente === "existente" ? "Elige un cliente" : "Escribe el nombre del cliente");
      return;
    }
    if (lineasValidas.length === 0) {
      setError("Añade al menos una partida");
      return;
    }

    if (!(await exigirSesion())) return;

    const limite = await puedeCrearDocumento(crearClienteNavegador(), empresaId, plan);
    if (!limite.ok) {
      setError(
        "Has usado tus 5 presupuestos o facturas gratis de este mes. Mejora tu plan para seguir creando.",
      );
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
    // emitir, no una referencia compartida (regla de negocio 9). Si
    // es un cliente "solo para esta factura", ya tenemos sus datos
    // escritos a mano; si no, se leen de su ficha.
    let cliente: { nombre: string; nif: string | null; direccion: string | null };

    if (modoCliente === "nuevo") {
      cliente = {
        nombre: nombreNuevoCliente.trim(),
        nif: nifNuevoCliente.trim() || null,
        direccion: direccionNuevoCliente.trim() || null,
      };
    } else {
      const { data: clienteDB, error: errorCliente } = await supabase
        .from("clientes")
        .select("nombre, nif, direccion")
        .eq("id", clienteId)
        .single();

      if (errorCliente || !clienteDB) {
        setError("No se han podido leer los datos fiscales del cliente");
        setGuardando(false);
        return;
      }
      cliente = clienteDB;
    }

    const anio = new Date(fecha).getFullYear();

    const { data: numero, error: errorNumero } = await supabase.rpc("siguiente_numero", {
      p_empresa: empresaId,
      p_tipo: "factura",
      p_codigo: serieFactura,
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
        cliente_id: modoCliente === "existente" ? clienteId : null,
        presupuesto_id: null,
        numero,
        serie: serieFactura,
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
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="block text-sm font-medium text-texto" htmlFor="cliente">
              Cliente
            </label>
            {clientes.length > 0 && (
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
                No se guarda en tu lista de Clientes, solo en esta factura.
              </p>
            </div>
          )}
        </div>
        <div className="w-full overflow-hidden sm:min-w-[130px] sm:w-auto sm:flex-1">
          <label className="mb-1.5 block text-sm font-medium text-texto" htmlFor="fecha">
            Fecha de emisión
          </label>
          <input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(evento) => setFecha(evento.target.value)}
            className="h-11 w-full min-w-0 overflow-hidden rounded-lg border border-borde bg-superficie px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
          />
        </div>
        <div className="w-full overflow-hidden sm:min-w-[130px] sm:w-auto sm:flex-1">
          <label className="mb-1.5 block text-sm font-medium text-texto" htmlFor="vencimiento">
            Vencimiento
          </label>
          <input
            id="vencimiento"
            type="date"
            value={vencimiento}
            onChange={(evento) => setVencimiento(evento.target.value)}
            className="h-11 w-full min-w-0 overflow-hidden rounded-lg border border-borde bg-superficie px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
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
          {guardando ? "Emitiendo…" : "Emitir factura"}
        </Boton>
      </div>
    </form>
  );
}

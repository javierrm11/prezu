"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { calcularLinea, calcularTotales } from "@/lib/importes";
import { formatearEuros } from "@/lib/formato";
import { puedeCrearDocumento, type Plan } from "@/lib/limitesPlan";
import {
  lineaVacia,
  TablaPartidas,
  type CamposLinea,
  type LineaConId,
} from "@/components/ui/TablaPartidas";
import type { ItemCatalogoSelector } from "@/components/ui/SelectorConceptosPredefinidos";
import { Boton } from "@/components/ui/Boton";
import { Textarea } from "@/components/ui/Textarea";

type ClienteSnapshot = {
  id: string | null;
  nombre: string;
  nif: string | null;
  direccion: string | null;
};

type FormularioRectificativaProps = {
  empresaId: string;
  plan: Plan;
  facturaOriginalId: string;
  etiquetaOriginal: string;
  cliente: ClienteSnapshot;
  formaPagoInicial: string;
  vencimientoInicial: string | null;
  lineasIniciales: CamposLinea[];
  ivaDefecto: number;
  serieRectificativa: string;
  catalogo?: ItemCatalogoSelector[];
};

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export function FormularioRectificativa({
  empresaId,
  plan,
  facturaOriginalId,
  etiquetaOriginal,
  cliente,
  formaPagoInicial,
  vencimientoInicial,
  lineasIniciales,
  ivaDefecto,
  serieRectificativa,
  catalogo,
}: FormularioRectificativaProps) {
  const router = useRouter();
  const [fecha, setFecha] = useState(hoyISO());
  const [vencimiento, setVencimiento] = useState(vencimientoInicial ?? "");
  const [formaPago, setFormaPago] = useState(formaPagoInicial);
  const [motivo, setMotivo] = useState("");
  const [lineas, setLineas] = useState<LineaConId[]>(() =>
    (lineasIniciales.length > 0 ? lineasIniciales : [lineaVacia(ivaDefecto)]).map(
      (linea, indice) => ({ ...linea, idLocal: `inicial-${indice}` }),
    ),
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

  function anadirLinea(prefill?: Partial<CamposLinea>) {
    setLineas((actuales) => [
      ...actuales,
      { ...lineaVacia(ivaDefecto), ...prefill, idLocal: crypto.randomUUID() },
    ]);
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    const lineasValidas = lineas.filter((linea) => linea.concepto.trim() && linea.cantidad > 0);

    if (!motivo.trim()) {
      setError("Indica el motivo de la rectificación");
      return;
    }
    if (lineasValidas.length === 0) {
      setError("Añade al menos una partida");
      return;
    }

    const limite = await puedeCrearDocumento(crearClienteNavegador(), empresaId, plan);
    if (!limite.ok) {
      setError(
        "Has usado tus 5 presupuestos o facturas gratis de este mes. Mejora tu plan para seguir creando.",
      );
      return;
    }

    const totales = calcularTotales(lineasValidas);
    const confirmado = window.confirm(
      `¿Emitir la rectificativa de ${etiquetaOriginal} por ${formatearEuros(totales.total)}? Una vez emitida tampoco se puede modificar.`,
    );
    if (!confirmado) return;

    setGuardando(true);
    const supabase = crearClienteNavegador();
    const anio = new Date(fecha).getFullYear();

    const { data: numero, error: errorNumero } = await supabase.rpc("siguiente_numero", {
      p_empresa: empresaId,
      p_tipo: "rectificativa",
      p_codigo: serieRectificativa,
      p_anio: anio,
    });

    if (errorNumero || numero == null) {
      setError("No se ha podido asignar el número de la rectificativa");
      setGuardando(false);
      return;
    }

    const { data: rectificativa, error: errorRectificativa } = await supabase
      .from("facturas")
      .insert({
        empresa_id: empresaId,
        cliente_id: cliente.id,
        presupuesto_id: null,
        numero,
        serie: serieRectificativa,
        anio,
        tipo: "rectificativa",
        rectifica_a: facturaOriginalId,
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
        notas: motivo,
      })
      .select("id")
      .single();

    if (errorRectificativa || !rectificativa) {
      setError("No se ha podido crear la rectificativa");
      setGuardando(false);
      return;
    }

    const filasLineas = lineasValidas.map((linea, indice) => ({
      factura_id: rectificativa.id,
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
        `La rectificativa ${numero} se creó pero hubo un problema guardando las partidas. Revísala en /facturas/${rectificativa.id}.`,
      );
      setGuardando(false);
      return;
    }

    await supabase.from("eventos").insert([
      {
        empresa_id: empresaId,
        entidad: "factura",
        entidad_id: rectificativa.id,
        tipo: "emitida",
        datos: { rectifica_a: facturaOriginalId },
      },
      {
        empresa_id: empresaId,
        entidad: "factura",
        entidad_id: facturaOriginalId,
        tipo: "rectificada",
        datos: { rectificativa_id: rectificativa.id },
      },
    ]);

    router.push(`/facturas/${rectificativa.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 rounded-xl border border-borde bg-superficie p-4 shadow-tarjeta">
        <div className="min-w-[200px] flex-[2]">
          <div className="mb-1.5 text-sm font-medium text-texto">Cliente</div>
          <div className="flex h-11 items-center rounded-lg border border-borde bg-fondo px-3 text-sm text-texto-secundario">
            {cliente.nombre}
            {cliente.nif ? ` · NIF ${cliente.nif}` : ""}
          </div>
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

      <Textarea
        id="motivo"
        label="Motivo de la rectificación"
        value={motivo}
        onChange={(evento) => setMotivo(evento.target.value)}
        placeholder="Ej.: Error en el precio de la partida de mano de obra"
        rows={2}
        required
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
          {guardando ? "Emitiendo…" : "Emitir rectificativa"}
        </Boton>
      </div>
    </form>
  );
}

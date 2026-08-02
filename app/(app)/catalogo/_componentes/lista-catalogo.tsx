"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListPlus, Pencil, Plus } from "lucide-react";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { useExigirSesion } from "@/lib/hooks/useExigirSesion";
import { formatearEuros } from "@/lib/formato";
import { Boton } from "@/components/ui/Boton";
import { UNIDADES } from "@/components/ui/TablaPartidas";
import { SelectorConceptosPredefinidos } from "@/components/ui/SelectorConceptosPredefinidos";

export type ItemCatalogo = {
  id: string;
  concepto: string;
  unidad: string;
  precioUnitario: number;
  tipoIva: number;
  vecesUsado: number;
};

type ListaCatalogoProps = {
  empresaId: string | null;
  ivaDefecto: number;
  items: ItemCatalogo[];
};

export function ListaCatalogo({ empresaId, ivaDefecto, items }: ListaCatalogoProps) {
  const router = useRouter();
  const exigirSesion = useExigirSesion();
  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const [nuevoConcepto, setNuevoConcepto] = useState("");
  const [nuevaUnidad, setNuevaUnidad] = useState("ud");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editConcepto, setEditConcepto] = useState("");
  const [editPrecio, setEditPrecio] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardarNuevo() {
    if (!nuevoConcepto.trim()) {
      setError("Escribe un concepto");
      return;
    }

    setError(null);

    if (!(await exigirSesion())) return;

    if (!empresaId) {
      setError("No se ha encontrado tu negocio");
      return;
    }

    setGuardando(true);
    const supabase = crearClienteNavegador();

    const { error: errorInsert } = await supabase.from("catalogo").insert({
      empresa_id: empresaId,
      concepto: nuevoConcepto,
      precio_unitario: parseFloat(nuevoPrecio) || 0,
      unidad: nuevaUnidad,
      tipo_iva: ivaDefecto,
    });

    setGuardando(false);

    if (errorInsert) {
      setError("No se ha podido guardar la partida");
      return;
    }

    setNuevoConcepto("");
    setNuevaUnidad("ud");
    setNuevoPrecio("");
    setNuevoAbierto(false);
    router.refresh();
  }

  function iniciarEdicion(item: ItemCatalogo) {
    setEditandoId(item.id);
    setEditConcepto(item.concepto);
    setEditPrecio(String(item.precioUnitario));
  }

  async function guardarEdicion(id: string) {
    setError(null);

    if (!(await exigirSesion())) return;

    setGuardando(true);
    const supabase = crearClienteNavegador();

    const { error: errorUpdate } = await supabase
      .from("catalogo")
      .update({
        concepto: editConcepto,
        precio_unitario: parseFloat(editPrecio) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setGuardando(false);

    if (errorUpdate) {
      setError("No se ha podido guardar el cambio");
      return;
    }

    setEditandoId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primario">
          Catálogo de precios
        </h1>
        <div className="flex flex-shrink-0 gap-2.5">
          <Boton
            variante="secundario"
            className="inline-flex items-center gap-1.5"
            onClick={() => setSelectorAbierto(true)}
          >
            <ListPlus size={16} />
            Elegir de la lista
          </Boton>
          <Boton
            variante="secundario"
            onClick={() => setNuevoAbierto((abierto) => !abierto)}
          >
            Añadir partida
          </Boton>
        </div>
      </div>

      {selectorAbierto && (
        <SelectorConceptosPredefinidos
          onSeleccionar={(concepto) => {
            setNuevoConcepto(concepto.concepto);
            setNuevaUnidad(concepto.unidad);
            setNuevoAbierto(true);
            setSelectorAbierto(false);
          }}
          onCerrar={() => setSelectorAbierto(false)}
        />
      )}

      <div className="mb-4 flex items-center gap-2.5 rounded-lg bg-[#E8EDFB] px-4 py-3 text-[13px] text-secundario">
        <Plus size={16} className="flex-shrink-0" />
        La IA usa estos precios cuando dictas un presupuesto.
      </div>

      {nuevoAbierto && (
        <div className="mb-4 flex flex-wrap items-end gap-2.5 rounded-xl border border-secundario bg-superficie p-4">
          <div className="min-w-[180px] flex-[2]">
            <label className="mb-1.5 block text-[13px] font-medium text-texto">Concepto</label>
            <input
              value={nuevoConcepto}
              onChange={(evento) => setNuevoConcepto(evento.target.value)}
              placeholder="Ej.: Cambio de sifón"
              className="h-11 w-full rounded-lg border border-borde px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
            />
          </div>
          <div className="w-[110px]">
            <label className="mb-1.5 block text-[13px] font-medium text-texto">Unidad</label>
            <select
              value={nuevaUnidad}
              onChange={(evento) => setNuevaUnidad(evento.target.value)}
              className="h-11 w-full rounded-lg border border-borde bg-superficie px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
            >
              {UNIDADES.map((unidad) => (
                <option key={unidad.valor} value={unidad.valor}>
                  {unidad.etiqueta}
                </option>
              ))}
            </select>
          </div>
          <div className="w-[120px]">
            <label className="mb-1.5 block text-[13px] font-medium text-texto">Precio (€)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={nuevoPrecio}
              onChange={(evento) => setNuevoPrecio(evento.target.value)}
              placeholder="0,00"
              className="h-11 w-full rounded-lg border border-borde px-3 text-right text-sm tabular-nums text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
            />
          </div>
          <Boton onClick={guardarNuevo} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </Boton>
        </div>
      )}

      {error && <p className="mb-3 text-sm text-peligro">{error}</p>}

      {items.length === 0 ? (
        <p className="text-sm text-texto-secundario">
          Todavía no tienes partidas en el catálogo.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
          {items.map((item) => (
            <div key={item.id} className="border-b border-[#EEF0F6] last:border-b-0">
              {editandoId === item.id ? (
                <div className="flex flex-wrap items-center gap-2.5 bg-fondo p-3">
                  <input
                    value={editConcepto}
                    onChange={(evento) => setEditConcepto(evento.target.value)}
                    className="h-11 min-w-[160px] flex-[2] rounded-lg border border-borde px-3 text-sm text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editPrecio}
                    onChange={(evento) => setEditPrecio(evento.target.value)}
                    className="h-11 w-[110px] rounded-lg border border-borde px-3 text-right text-sm tabular-nums text-texto focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario"
                  />
                  <Boton onClick={() => guardarEdicion(item.id)} disabled={guardando}>
                    {guardando ? "Guardando…" : "Guardar"}
                  </Boton>
                </div>
              ) : (
                <div className="flex min-h-11 items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-texto">
                      {item.concepto}
                    </div>
                    <div className="mt-0.5 text-xs text-[#8A8FA3]">
                      Usado {item.vecesUsado} veces
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-sm font-semibold tabular-nums text-texto">
                    {formatearEuros(item.precioUnitario)} / {item.unidad}
                  </div>
                  <div className="w-11 flex-shrink-0 text-right text-[13px] text-texto-secundario">
                    {item.tipoIva} %
                  </div>
                  <button
                    type="button"
                    onClick={() => iniciarEdicion(item)}
                    aria-label="Editar"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-texto-secundario hover:bg-fondo"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

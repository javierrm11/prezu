import type { SupabaseClient } from "@supabase/supabase-js";

export type ResultadoEnvioPresupuesto =
  | { numero: number; anio: number; serie: string }
  | { error: string };

type PresupuestoParaEnviar = {
  id: string;
  empresaId: string;
  estado: string;
  fechaEmision: string;
  numero: number | null;
  anio: number | null;
  serie: string | null;
};

// Idempotente y reutilizado desde cualquier acción que de verdad
// entrega el presupuesto al cliente (WhatsApp, copiar enlace,
// marcar aceptado/rechazado a mano, convertir en factura): ese es
// el momento de numerarlo, igual que siguiente_numero() solo se
// llama al emitir una factura, nunca al crear el borrador. Si el
// presupuesto ya tiene número no vuelve a numerar ni toca su
// estado (por si ya está aceptado/rechazado/facturado); si no lo
// tiene, lo numera y, solo si seguía en borrador, lo pasa a
// "enviado".
export async function asegurarPresupuestoEnviado(
  supabase: SupabaseClient,
  presupuesto: PresupuestoParaEnviar,
  seriePresupuesto: string,
): Promise<ResultadoEnvioPresupuesto> {
  if (presupuesto.numero != null && presupuesto.anio != null) {
    return {
      numero: presupuesto.numero,
      anio: presupuesto.anio,
      serie: presupuesto.serie || seriePresupuesto,
    };
  }

  const anio = new Date(presupuesto.fechaEmision).getFullYear();

  const { data: numero, error: errorNumero } = await supabase.rpc("siguiente_numero", {
    p_empresa: presupuesto.empresaId,
    p_tipo: "presupuesto",
    p_codigo: seriePresupuesto,
    p_anio: anio,
  });

  if (errorNumero || numero == null) {
    return { error: "No se ha podido asignar el número del presupuesto" };
  }

  const cambios: Record<string, unknown> = { numero, serie: seriePresupuesto, anio };
  if (presupuesto.estado === "borrador") {
    cambios.estado = "enviado";
    cambios.enviado_at = new Date().toISOString();
  }

  const { error: errorUpdate } = await supabase
    .from("presupuestos")
    .update(cambios)
    .eq("id", presupuesto.id);

  if (errorUpdate) {
    return { error: "No se ha podido numerar el presupuesto" };
  }

  await supabase.from("eventos").insert({
    empresa_id: presupuesto.empresaId,
    entidad: "presupuesto",
    entidad_id: presupuesto.id,
    tipo: "enviado",
  });

  return { numero, anio, serie: seriePresupuesto };
}

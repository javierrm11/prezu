"use server";

import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { extraerPartidas } from "@/lib/ia/extraccion";
import { interpretarTexto } from "@/lib/interpretarPartida";
import type { CamposLinea } from "@/components/ui/TablaPartidas";

// Compartido por presupuestos y facturas: la interpretación de la
// nota de voz/texto no depende de qué documento se esté creando.
export async function interpretarNotaVoz(
  texto: string,
  ivaDefecto: number,
): Promise<CamposLinea[]> {
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  if (!empresaId) return [];

  const { data: catalogoDB } = await supabase
    .from("catalogo")
    .select("concepto, unidad, precio_unitario, tipo_iva")
    .eq("empresa_id", empresaId);

  const catalogo = (catalogoDB ?? []).map((item) => ({
    concepto: item.concepto,
    unidad: item.unidad,
    precioUnitario: Number(item.precio_unitario),
    tipoIva: Number(item.tipo_iva),
  }));

  try {
    return await extraerPartidas(texto, catalogo, ivaDefecto);
  } catch {
    // Gemini no disponible (red, cuota, API key...): no dejamos el
    // botón roto, caemos al intérprete por reglas ya existente.
    return [interpretarTexto(texto, catalogo, ivaDefecto)];
  }
}

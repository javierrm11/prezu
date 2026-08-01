import type { SupabaseClient } from "@supabase/supabase-js";

export type Plan = "gratis" | "basico" | "pro";

export const LIMITE_GRATIS = 5;

function inicioDeMes(): string {
  const fecha = new Date();
  fecha.setDate(1);
  fecha.setHours(0, 0, 0, 0);
  return fecha.toISOString();
}

// Mismo criterio que el trigger de BD (verificar_limite_plan_gratis
// en 0015_planes.sql): presupuestos + facturas creados este mes
// natural, sea cual sea su estado.
export async function contarDocumentosDelMes(
  supabase: SupabaseClient,
  empresaId: string,
): Promise<number> {
  const desde = inicioDeMes();

  const [{ count: presupuestos }, { count: facturas }] = await Promise.all([
    supabase
      .from("presupuestos")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .gte("created_at", desde),
    supabase
      .from("facturas")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .gte("created_at", desde),
  ]);

  return (presupuestos ?? 0) + (facturas ?? 0);
}

export type ResultadoLimitePlan = { ok: true } | { ok: false; usados: number };

// Comprobación en el cliente para dar un mensaje claro antes de
// insertar. El trigger de BD es quien de verdad lo hace cumplir (no
// se puede confiar solo en esta comprobación: se podría saltar
// llamando a Supabase directamente).
export async function puedeCrearDocumento(
  supabase: SupabaseClient,
  empresaId: string,
  plan: Plan,
): Promise<ResultadoLimitePlan> {
  if (plan !== "gratis") {
    return { ok: true };
  }

  const usados = await contarDocumentosDelMes(supabase, empresaId);
  return usados >= LIMITE_GRATIS ? { ok: false, usados } : { ok: true };
}

"use server";

import { crearClienteAdmin } from "@/lib/supabase/admin";

const ESTADOS_RESUELTOS = ["aceptado", "rechazado", "facturado", "caducado"];

export async function aceptarPresupuesto(token: string, nombre: string) {
  const admin = crearClienteAdmin();

  const { data: presupuesto } = await admin
    .from("presupuestos")
    .select("id, empresa_id, estado")
    .eq("token_publico", token)
    .maybeSingle();

  if (!presupuesto) {
    return { error: "Presupuesto no encontrado." };
  }

  if (ESTADOS_RESUELTOS.includes(presupuesto.estado)) {
    return { error: "Este presupuesto ya no admite respuesta." };
  }

  const { error } = await admin
    .from("presupuestos")
    .update({
      estado: "aceptado",
      aceptado_at: new Date().toISOString(),
      aceptado_por: nombre,
    })
    .eq("id", presupuesto.id);

  if (error) {
    return { error: "No se ha podido registrar la aceptación." };
  }

  await admin.from("eventos").insert({
    empresa_id: presupuesto.empresa_id,
    entidad: "presupuesto",
    entidad_id: presupuesto.id,
    tipo: "aceptado",
    datos: { nombre, origen: "publico" },
  });

  return { ok: true };
}

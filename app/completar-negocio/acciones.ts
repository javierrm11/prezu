"use server";

import { crearClienteServidor } from "@/lib/supabase/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";

type DatosCompletarNegocio = {
  nombreNegocio: string;
  nif: string;
};

// Igual que registrarEmpresa (app/registro/acciones.ts), pero para
// alguien que ya tiene sesión y todavía no tiene negocio — el caso
// de la primera vez que alguien entra con Google, que no pasa por
// el formulario de alta que pide nombre/NIF antes de crear la
// cuenta. Necesita el cliente admin por el mismo motivo: sin
// empresa todavía no hay empresa_actual() con la que las políticas
// RLS puedan dejar escribir en empresas/perfiles.
export async function completarNegocio({ nombreNegocio, nif }: DatosCompletarNegocio) {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const admin = crearClienteAdmin();

  const { data: perfilExistente } = await admin
    .from("perfiles")
    .select("empresa_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perfilExistente) {
    return { ok: true as const };
  }

  const { data: empresa, error: errorEmpresa } = await admin
    .from("empresas")
    .insert({ nombre: nombreNegocio, nif })
    .select("id")
    .single();

  if (errorEmpresa || !empresa) {
    return { error: "No se ha podido crear el negocio." };
  }

  const { error: errorPerfil } = await admin.from("perfiles").insert({
    user_id: user.id,
    empresa_id: empresa.id,
    rol: "admin",
  });

  if (errorPerfil) {
    await admin.from("empresas").delete().eq("id", empresa.id);
    return { error: "No se ha podido crear el perfil del negocio." };
  }

  return { ok: true as const };
}

"use server";

import { crearClienteAdmin } from "@/lib/supabase/admin";

type DatosRegistroEmpresa = {
  nombreNegocio: string;
  nif: string;
  email: string;
  contrasena: string;
};

// Único flujo (junto a la página pública) donde el cliente admin
// (service role) es imprescindible: quien se registra todavía no
// tiene sesión, así que ninguna política RLS de empresa_actual()
// puede aplicarle. Alta atómica: si un paso falla se deshace lo ya
// creado, para no dejar cuentas de Auth huérfanas sin empresa.
export async function registrarEmpresa({
  nombreNegocio,
  nif,
  email,
  contrasena,
}: DatosRegistroEmpresa) {
  const admin = crearClienteAdmin();

  const { data: usuarioCreado, error: errorUsuario } = await admin.auth.admin.createUser({
    email,
    password: contrasena,
    email_confirm: true,
  });

  if (errorUsuario || !usuarioCreado.user) {
    if (errorUsuario?.code === "email_exists") {
      return { error: "Ya existe una cuenta con ese email." };
    }
    return { error: "No se ha podido crear la cuenta." };
  }

  const { data: empresa, error: errorEmpresa } = await admin
    .from("empresas")
    .insert({ nombre: nombreNegocio, nif })
    .select("id")
    .single();

  if (errorEmpresa || !empresa) {
    await admin.auth.admin.deleteUser(usuarioCreado.user.id);
    return { error: "No se ha podido crear el negocio." };
  }

  const { error: errorPerfil } = await admin.from("perfiles").insert({
    user_id: usuarioCreado.user.id,
    empresa_id: empresa.id,
    rol: "admin",
  });

  if (errorPerfil) {
    await admin.from("empresas").delete().eq("id", empresa.id);
    await admin.auth.admin.deleteUser(usuarioCreado.user.id);
    return { error: "No se ha podido crear el perfil del negocio." };
  }

  return { ok: true as const };
}

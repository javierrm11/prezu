import type { SupabaseClient } from "@supabase/supabase-js";

export async function obtenerEmpresaId(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("empresa_id")
    .eq("user_id", user.id)
    .single();

  return (perfil?.empresa_id as string | undefined) ?? null;
}

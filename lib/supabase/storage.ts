import type { SupabaseClient } from "@supabase/supabase-js";

export async function crearUrlFirmadaLogo(
  supabase: SupabaseClient,
  path: string | null,
  segundos = 60,
) {
  if (!path) return null;

  const { data } = await supabase.storage.from("logos").createSignedUrl(path, segundos);
  return data?.signedUrl ?? null;
}

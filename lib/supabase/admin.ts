import { createClient } from '@supabase/supabase-js'

/**
 * Cliente con service_role: salta RLS por completo.
 * Uso exclusivo: página pública por token_publico y jobs internos.
 * Nunca importar desde código cliente ni exponer SUPABASE_SERVICE_ROLE_KEY.
 */
export function crearClienteAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

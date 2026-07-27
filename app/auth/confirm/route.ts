import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/server";

// Punto de llegada de los enlaces que manda Supabase por email
// (recuperar contraseña, y en el futuro confirmación de email o
// enlace mágico si se implementan).
//
// Este proyecto usa flujo PKCE (tokens con prefijo "pkce_"): el
// enlace del email pasa primero por el /verify de Supabase, que
// redirige aquí con "?code=..." — no con "token_hash", que es el
// otro formato posible según cómo esté configurada la plantilla de
// email. Se aceptan los dos por si el proyecto cambia de flujo.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await crearClienteServidor();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(
    new URL("/recuperar?error=enlace_invalido", origin),
  );
}

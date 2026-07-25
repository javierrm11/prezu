"use server";

import { crearClienteStripe } from "@/lib/stripe";
import { crearClienteServidor } from "@/lib/supabase/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";

// empresaId se saca de la sesión, nunca de un parámetro del
// cliente: así nadie puede generar un pago para el negocio de otro
// pasando un id ajeno.
export async function crearSesionCheckout() {
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  if (!empresaId) {
    return { error: "No se ha encontrado tu negocio (sin sesión o sin perfil)." };
  }

  const admin = crearClienteAdmin();
  const { data: empresa, error: errorEmpresa } = await admin
    .from("empresas")
    .select("nombre, stripe_customer_id")
    .eq("id", empresaId)
    .single();

  if (errorEmpresa || !empresa) {
    return { error: `No se ha podido leer el negocio: ${errorEmpresa?.message ?? "sin datos"}` };
  }

  const stripe = crearClienteStripe();

  let clienteId = empresa.stripe_customer_id;
  if (!clienteId) {
    const cliente = await stripe.customers.create({
      name: empresa.nombre,
      metadata: { empresa_id: empresaId },
    });
    clienteId = cliente.id;
    await admin.from("empresas").update({ stripe_customer_id: clienteId }).eq("id", empresaId);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: clienteId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    discounts: [{ coupon: process.env.STRIPE_COUPON_ID! }],
    subscription_data: { trial_period_days: 1 },
    success_url: `${baseUrl}/dashboard`,
    cancel_url: `${baseUrl}/suscripcion`,
  });

  if (!session.url) {
    return { error: "No se ha podido iniciar el pago." };
  }

  return { url: session.url };
}

type ResultadoAccion = { ok: true } | { error: string };

type SuscripcionEncontrada =
  | { error: string }
  | { admin: ReturnType<typeof crearClienteAdmin>; empresaId: string; subscriptionId: string };

async function obtenerSuscripcionActual(): Promise<SuscripcionEncontrada> {
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  if (!empresaId) {
    return { error: "No se ha encontrado tu negocio (sin sesión o sin perfil)." };
  }

  const admin = crearClienteAdmin();
  const { data: empresa, error: errorEmpresa } = await admin
    .from("empresas")
    .select("stripe_subscription_id")
    .eq("id", empresaId)
    .single();

  if (errorEmpresa || !empresa?.stripe_subscription_id) {
    return { error: "No se ha encontrado tu suscripción." };
  }

  return { admin, empresaId, subscriptionId: empresa.stripe_subscription_id };
}

// Cancela al final del periodo ya pagado, no al momento: el negocio
// conserva el acceso hasta esa fecha, igual que la mayoría de SaaS.
export async function cancelarSuscripcion(): Promise<ResultadoAccion> {
  const resultado = await obtenerSuscripcionActual();
  if ("error" in resultado) return resultado;

  const stripe = crearClienteStripe();
  const suscripcion = await stripe.subscriptions.update(resultado.subscriptionId, {
    cancel_at_period_end: true,
  });

  await resultado.admin
    .from("empresas")
    .update({ suscripcion_cancela_al_final: suscripcion.cancel_at_period_end })
    .eq("id", resultado.empresaId);

  return { ok: true };
}

export async function reanudarSuscripcion(): Promise<ResultadoAccion> {
  const resultado = await obtenerSuscripcionActual();
  if ("error" in resultado) return resultado;

  const stripe = crearClienteStripe();
  const suscripcion = await stripe.subscriptions.update(resultado.subscriptionId, {
    cancel_at_period_end: false,
  });

  await resultado.admin
    .from("empresas")
    .update({ suscripcion_cancela_al_final: suscripcion.cancel_at_period_end })
    .eq("id", resultado.empresaId);

  return { ok: true };
}

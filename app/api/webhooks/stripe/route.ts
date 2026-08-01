import Stripe from "stripe";
import { crearClienteStripe } from "@/lib/stripe";
import { crearClienteAdmin } from "@/lib/supabase/admin";

const PLAN_POR_PRICE_ID: Record<string, "basico" | "pro"> = {};
if (process.env.STRIPE_PRICE_ID_BASICO) {
  PLAN_POR_PRICE_ID[process.env.STRIPE_PRICE_ID_BASICO] = "basico";
}
if (process.env.STRIPE_PRICE_ID_PRO) {
  PLAN_POR_PRICE_ID[process.env.STRIPE_PRICE_ID_PRO] = "pro";
}

// Necesita el cuerpo crudo sin parsear para poder verificar la
// firma de Stripe (constructEvent), así que Next no debe tocarlo.
export async function POST(request: Request) {
  const firma = request.headers.get("stripe-signature");
  const secreto = process.env.STRIPE_WEBHOOK_SECRET;

  if (!firma || !secreto) {
    return new Response("Falta configurar el webhook", { status: 500 });
  }

  const cuerpo = await request.text();
  const stripe = crearClienteStripe();

  let evento: Stripe.Event;
  try {
    evento = stripe.webhooks.constructEvent(cuerpo, firma, secreto);
  } catch {
    return new Response("Firma inválida", { status: 400 });
  }

  const admin = crearClienteAdmin();

  async function sincronizarSuscripcion(suscripcion: Stripe.Subscription) {
    const clienteId =
      typeof suscripcion.customer === "string" ? suscripcion.customer : suscripcion.customer.id;
    const finPeriodo = suscripcion.items.data[0]?.current_period_end;

    // Una suscripción cancelada del todo vuelve al plan Gratis (y por
    // tanto al límite de 5 documentos/mes). Mientras siga existiendo
    // (activa, en trial, con un pago fallido...) se deduce del precio
    // contratado; si ese precio no es ninguno de los conocidos, no se
    // toca el plan que ya tuviera.
    const priceId = suscripcion.items.data[0]?.price.id;
    const plan =
      suscripcion.status === "canceled" ? "gratis" : priceId ? PLAN_POR_PRICE_ID[priceId] : undefined;

    const cambios: Record<string, unknown> = {
      stripe_subscription_id: suscripcion.id,
      estado_suscripcion: suscripcion.status,
      suscripcion_periodo_fin: finPeriodo
        ? new Date(finPeriodo * 1000).toISOString()
        : null,
      suscripcion_cancela_al_final: suscripcion.cancel_at_period_end,
    };
    if (plan) cambios.plan = plan;

    await admin.from("empresas").update(cambios).eq("stripe_customer_id", clienteId);
  }

  switch (evento.type) {
    case "checkout.session.completed": {
      const session = evento.data.object;
      if (typeof session.subscription === "string") {
        const suscripcion = await stripe.subscriptions.retrieve(session.subscription);
        await sincronizarSuscripcion(suscripcion);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created":
    case "customer.subscription.deleted": {
      await sincronizarSuscripcion(evento.data.object);
      break;
    }
    default:
      break;
  }

  return new Response("ok", { status: 200 });
}

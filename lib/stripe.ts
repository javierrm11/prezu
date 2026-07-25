import Stripe from "stripe";

// Solo se importa desde Server Actions y route handlers: la clave
// secreta de Stripe nunca debe llegar al cliente.
export function crearClienteStripe() {
  const clave = process.env.STRIPE_SECRET_KEY;
  if (!clave) throw new Error("Falta STRIPE_SECRET_KEY");
  return new Stripe(clave);
}

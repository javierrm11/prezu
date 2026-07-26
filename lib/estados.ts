export type Tono = "exito" | "aviso" | "peligro" | "neutro";

const TONO_PRESUPUESTO: Record<string, Tono> = {
  aceptado: "exito",
  facturado: "exito",
  enviado: "aviso",
  visto: "aviso",
  rechazado: "peligro",
  caducado: "peligro",
  borrador: "neutro",
};

const TONO_FACTURA: Record<string, Tono> = {
  cobrada: "exito",
  pendiente: "aviso",
  vencida: "peligro",
};

export function tonoPresupuesto(estado: string): Tono {
  return TONO_PRESUPUESTO[estado] ?? "neutro";
}

export function tonoFactura(estadoCobro: string): Tono {
  return TONO_FACTURA[estadoCobro] ?? "neutro";
}

// "vencida" es un estado válido en BD, pero nada lo asigna todavía
// (no hay job que lo revise). Aquí solo se calcula para mostrarlo
// en la UI; el valor guardado en estado_cobro no se toca.
export function estadoCobroEfectivo(estadoCobro: string, vencimiento: string | null): string {
  if (estadoCobro === "pendiente" && vencimiento && new Date(vencimiento) < new Date()) {
    return "vencida";
  }
  return estadoCobro;
}

const ESTADOS_SUSCRIPCION_CON_ACCESO = ["trialing", "active"];

// La suscripción ya no bloquea la app entera (ver AppLayout): solo
// se comprueba en el momento de descargar un PDF de presupuesto o
// factura, en la página y en el route handler.
export function tieneAccesoSuscripcion(estadoSuscripcion: string | null | undefined): boolean {
  return Boolean(estadoSuscripcion && ESTADOS_SUSCRIPCION_CON_ACCESO.includes(estadoSuscripcion));
}

const ETIQUETAS_EVENTO: Record<string, string> = {
  creado: "Presupuesto creado",
  editado: "Presupuesto editado",
  enviado: "Enviado al cliente",
  visto: "Visto por el cliente",
  aceptado: "Aceptado por el cliente",
  rechazado: "Rechazado por el cliente",
  caducado: "Presupuesto caducado",
  facturado: "Convertido en factura",
  emitida: "Factura emitida",
  rectificada: "Factura rectificada",
  cobrada: "Marcada como cobrada",
  error_vf: "Error VeriFactu",
};

export function etiquetaEvento(tipo: string) {
  return ETIQUETAS_EVENTO[tipo] ?? tipo;
}

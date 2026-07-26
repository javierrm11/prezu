import { tieneAccesoSuscripcion } from "@/lib/estados";

// Un único sitio para decidir a dónde lleva "Descargar PDF": a
// pagar (si no hay suscripción activa), a elegir plantilla (si
// nunca se ha elegido una) o directo al PDF. Usado tanto en la
// página de presupuesto como en la de factura, para no duplicar el
// orden de comprobaciones en los dos sitios.
export function calcularEnlacePdf({
  estadoSuscripcion,
  pdfPlantilla,
  rutaDetalle,
  rutaApiPdf,
  rutaElegirPlantilla,
}: {
  estadoSuscripcion: string | null | undefined;
  pdfPlantilla: string | null | undefined;
  rutaDetalle: string;
  rutaApiPdf: string;
  rutaElegirPlantilla?: string;
}) {
  if (!tieneAccesoSuscripcion(estadoSuscripcion)) {
    return `/suscripcion?volver=${encodeURIComponent(rutaDetalle)}`;
  }
  if (rutaElegirPlantilla && !pdfPlantilla) {
    return rutaElegirPlantilla;
  }
  return rutaApiPdf;
}

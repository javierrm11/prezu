// Un único sitio para decidir a dónde lleva "Descargar PDF": a
// elegir plantilla (si nunca se ha elegido una) o directo al PDF.
// Usado tanto en la página de presupuesto como en la de factura,
// para no duplicar el orden de comprobaciones en los dos sitios.
export function calcularEnlacePdf({
  pdfPlantilla,
  rutaApiPdf,
  rutaElegirPlantilla,
}: {
  pdfPlantilla: string | null | undefined;
  rutaApiPdf: string;
  rutaElegirPlantilla?: string;
}) {
  if (rutaElegirPlantilla && !pdfPlantilla) {
    return rutaElegirPlantilla;
  }
  return rutaApiPdf;
}

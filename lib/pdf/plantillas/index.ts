import type { ComponentProps, ReactElement } from "react";
import { Document } from "@react-pdf/renderer";
import { DocumentoClasico } from "./Clasico";
import { DocumentoModerno } from "./Moderno";
import { DocumentoMinimalista } from "./Minimalista";
import { DocumentoConAcento } from "./ConAcento";
import type { DatosDocumentoPDF, IdPlantillaPDF } from "./tipos";

export { PLANTILLAS_PDF } from "./tipos";
export type { DatosDocumentoPDF, IdPlantillaPDF } from "./tipos";

// renderToBuffer exige específicamente un <Document>, no cualquier
// ReactElement: sin este tipo, TypeScript no lo distingue.
type ElementoDocumentoPDF = ReactElement<ComponentProps<typeof Document>>;

const COMPONENTES_PLANTILLA: Record<IdPlantillaPDF, (datos: DatosDocumentoPDF) => ElementoDocumentoPDF> = {
  clasico: DocumentoClasico,
  moderno: DocumentoModerno,
  minimalista: DocumentoMinimalista,
  acento: DocumentoConAcento,
};

export function renderizarDocumentoPDF(
  plantilla: IdPlantillaPDF | null | undefined,
  datos: DatosDocumentoPDF,
): ElementoDocumentoPDF {
  const Componente = COMPONENTES_PLANTILLA[plantilla ?? "clasico"];
  return Componente(datos);
}

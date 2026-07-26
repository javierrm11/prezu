import type { EmpresaPDF, LineaPDF } from "../estilos";

export type IdPlantillaPDF = "clasico" | "moderno" | "minimalista" | "acento";

export const PLANTILLAS_PDF: { id: IdPlantillaPDF; nombre: string; descripcion: string }[] = [
  { id: "clasico", nombre: "Clásico", descripcion: "Cabecera con logo, tabla en azul oscuro." },
  { id: "moderno", nombre: "Moderno", descripcion: "Banda de color a todo lo ancho, filas alternas." },
  { id: "minimalista", nombre: "Minimalista", descripcion: "Solo líneas finas, mucho blanco, sin cajas." },
  { id: "acento", nombre: "Con acento", descripcion: "Franja de color lateral y detalles en ámbar." },
];

// Datos comunes a presupuesto y factura: un mismo documento con
// pequeñas diferencias de etiqueta según `tipo`, para no duplicar
// cada plantilla en dos componentes casi idénticos.
export type DatosDocumentoPDF = {
  tipo: "presupuesto" | "factura";
  empresa: EmpresaPDF;
  cliente: { nombre: string; nif: string | null; ciudad?: string | null; direccion?: string | null };
  numeroDocumento: string;
  fecha: string | null;
  fechaSecundaria: string | null;
  lineas: LineaPDF[];
  baseImponible: number;
  totalIva: number;
  total: number;
  etiquetaIva: string;
  condiciones: string | null;
  formaPago?: string | null;
};

export function etiquetasDocumento(tipo: DatosDocumentoPDF["tipo"]) {
  return tipo === "presupuesto"
    ? {
        cliente: "PRESUPUESTO PARA",
        numero: "Nº",
        fecha: "Fecha",
        fechaSecundaria: "Válido hasta",
      }
    : {
        cliente: "FACTURAR A",
        numero: "Nº factura",
        fecha: "Emitida",
        fechaSecundaria: "Vencimiento",
      };
}

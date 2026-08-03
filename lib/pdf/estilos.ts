import { StyleSheet } from "@react-pdf/renderer";

export const COLOR_PRIMARIO = "#1A2B6D";
export const COLOR_ACENTO = "#F4A623";
export const COLOR_TEXTO = "#0D1B4B";
export const COLOR_TEXTO_SECUNDARIO = "#5A6A9A";
export const COLOR_BORDE = "#D0D8F0";
export const COLOR_FONDO = "#F8F9FF";

export const estilosDocumento = StyleSheet.create({
  pagina: { padding: 44, fontSize: 11.5, color: COLOR_TEXTO, fontFamily: "Helvetica" },
  cabecera: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  filaCabecera: { flexDirection: "row", alignItems: "center" },
  logoChip: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLOR_PRIMARIO,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoTexto: { color: COLOR_ACENTO, fontFamily: "Helvetica-Bold", fontSize: 14 },
  logoImagen: { width: 34, height: 34, borderRadius: 8, marginRight: 10, objectFit: "cover" },
  nombreNegocio: { fontFamily: "Helvetica-Bold", fontSize: 16, color: COLOR_PRIMARIO },
  textoSecundario: { color: COLOR_TEXTO_SECUNDARIO, fontSize: 9.5 },
  datosNegocio: { textAlign: "right", color: COLOR_TEXTO_SECUNDARIO, fontSize: 9.5, lineHeight: 1.7 },
  divisor: { height: 2, backgroundColor: COLOR_PRIMARIO, marginVertical: 22 },
  filaDatos: { flexDirection: "row", justifyContent: "space-between", marginBottom: 26 },
  etiquetaChica: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR_TEXTO_SECUNDARIO,
    letterSpacing: 1,
    marginBottom: 5,
  },
  clienteNombre: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  cajaMeta: {
    backgroundColor: COLOR_FONDO,
    borderWidth: 1,
    borderColor: COLOR_BORDE,
    borderRadius: 8,
    padding: 11,
    fontSize: 10,
  },
  filaMeta: { flexDirection: "row", justifyContent: "space-between", gap: 20, marginBottom: 6 },
  filaMetaSinMargen: { flexDirection: "row", justifyContent: "space-between", gap: 20 },
  metaValor: { color: COLOR_TEXTO, fontFamily: "Helvetica-Bold" },
  tablaCabecera: {
    flexDirection: "row",
    backgroundColor: COLOR_PRIMARIO,
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    padding: 9,
    borderRadius: 4,
  },
  tablaFila: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F6",
    paddingVertical: 11,
    paddingHorizontal: 10,
    fontSize: 11,
  },
  colConcepto: { flex: 3 },
  // Sin color propio: en la cabecera deben heredar el blanco de
  // tablaCabecera. El gris de texto secundario en las filas de datos
  // se aplica aparte con colCantidadDato/colPrecioDato.
  colCantidad: { width: 60, textAlign: "right" },
  colPrecio: { width: 70, textAlign: "right" },
  colCantidadDato: { width: 60, textAlign: "right", color: COLOR_TEXTO_SECUNDARIO },
  colPrecioDato: { width: 70, textAlign: "right", color: COLOR_TEXTO_SECUNDARIO },
  colImporte: { width: 80, textAlign: "right", fontFamily: "Helvetica-Bold" },
  totales: {
    alignSelf: "flex-end",
    width: 220,
    backgroundColor: COLOR_FONDO,
    borderWidth: 1,
    borderColor: COLOR_BORDE,
    borderRadius: 8,
    padding: 16,
    marginTop: 28,
    gap: 9,
  },
  filaTotal: { flexDirection: "row", justifyContent: "space-between", fontSize: 11 },
  filaTotalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDE,
    paddingTop: 9,
    marginTop: 3,
  },
  totalGrande: { fontFamily: "Helvetica-Bold", fontSize: 19, color: COLOR_PRIMARIO },
  pie: {
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDE,
    paddingTop: 16,
    fontSize: 9.5,
    color: COLOR_TEXTO_SECUNDARIO,
    lineHeight: 1.7,
  },
  pieTitulo: { fontFamily: "Helvetica-Bold", color: COLOR_TEXTO, marginBottom: 2, fontSize: 10.5 },
  // Caja del IBAN: a diferencia de "Forma de pago" (texto suelto),
  // este es el dato que el cliente necesita para poder pagar de
  // verdad, así que lleva su propio recuadro destacado en vez de
  // perderse como una línea más del pie.
  ibanCaja: {
    alignSelf: "flex-start",
    backgroundColor: "#FCF3E3",
    borderWidth: 1,
    borderColor: "#F0D9A6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  ibanEtiqueta: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLOR_TEXTO_SECUNDARIO,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  ibanValor: { fontSize: 13, fontFamily: "Helvetica-Bold", color: COLOR_PRIMARIO },
});

export type LineaPDF = {
  concepto: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  importe: number;
};

export type EmpresaPDF = {
  nombre: string;
  nif: string | null;
  direccion: string | null;
  ciudad: string | null;
  telefono: string | null;
  email: string | null;
  logoUrl?: string | null;
  iban?: string | null;
};

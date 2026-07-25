import { StyleSheet } from "@react-pdf/renderer";

export const COLOR_PRIMARIO = "#1A2B6D";
export const COLOR_ACENTO = "#F4A623";
export const COLOR_TEXTO = "#0D1B4B";
export const COLOR_TEXTO_SECUNDARIO = "#5A6A9A";
export const COLOR_BORDE = "#D0D8F0";
export const COLOR_FONDO = "#F8F9FF";

export const estilosDocumento = StyleSheet.create({
  pagina: { padding: 44, fontSize: 10.5, color: COLOR_TEXTO, fontFamily: "Helvetica" },
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
  nombreNegocio: { fontFamily: "Helvetica-Bold", fontSize: 15, color: COLOR_PRIMARIO },
  textoSecundario: { color: COLOR_TEXTO_SECUNDARIO, fontSize: 9 },
  datosNegocio: { textAlign: "right", color: COLOR_TEXTO_SECUNDARIO, fontSize: 9, lineHeight: 1.7 },
  divisor: { height: 2, backgroundColor: COLOR_PRIMARIO, marginVertical: 18 },
  filaDatos: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  etiquetaChica: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLOR_TEXTO_SECUNDARIO,
    letterSpacing: 1,
    marginBottom: 4,
  },
  clienteNombre: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  cajaMeta: {
    backgroundColor: COLOR_FONDO,
    borderWidth: 1,
    borderColor: COLOR_BORDE,
    borderRadius: 8,
    padding: 10,
    fontSize: 9,
  },
  filaMeta: { flexDirection: "row", justifyContent: "space-between", gap: 20, marginBottom: 4 },
  filaMetaSinMargen: { flexDirection: "row", justifyContent: "space-between", gap: 20 },
  metaValor: { color: COLOR_TEXTO, fontFamily: "Helvetica-Bold" },
  tablaCabecera: {
    flexDirection: "row",
    backgroundColor: COLOR_PRIMARIO,
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    padding: 7,
    borderRadius: 4,
  },
  tablaFila: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F6",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 10,
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
    width: 190,
    backgroundColor: COLOR_FONDO,
    borderWidth: 1,
    borderColor: COLOR_BORDE,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 6,
  },
  filaTotal: { flexDirection: "row", justifyContent: "space-between" },
  filaTotalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDE,
    paddingTop: 6,
    marginTop: 2,
  },
  totalGrande: { fontFamily: "Helvetica-Bold", fontSize: 15, color: COLOR_PRIMARIO },
  pie: {
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDE,
    paddingTop: 12,
    fontSize: 8.5,
    color: COLOR_TEXTO_SECUNDARIO,
    lineHeight: 1.7,
  },
  pieTitulo: { fontFamily: "Helvetica-Bold", color: COLOR_TEXTO, marginBottom: 2 },
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
};

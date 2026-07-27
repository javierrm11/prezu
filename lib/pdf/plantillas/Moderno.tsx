import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { formatearEuros, formatearFecha } from "@/lib/formato";
import { obtenerIniciales } from "@/lib/texto";
import { COLOR_PRIMARIO, COLOR_ACENTO, COLOR_TEXTO_SECUNDARIO, COLOR_BORDE, COLOR_FONDO } from "../estilos";
import { etiquetasDocumento, type DatosDocumentoPDF } from "./tipos";

const estilos = StyleSheet.create({
  pagina: { fontSize: 10.5, color: "#0D1B4B", fontFamily: "Helvetica" },
  banda: {
    backgroundColor: COLOR_PRIMARIO,
    paddingTop: 30,
    paddingBottom: 24,
    paddingHorizontal: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  filaLogo: { flexDirection: "row", alignItems: "center" },
  logoChip: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLOR_ACENTO,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoTexto: { color: COLOR_PRIMARIO, fontFamily: "Helvetica-Bold", fontSize: 14 },
  logoImagen: { width: 34, height: 34, borderRadius: 8, marginRight: 10, objectFit: "cover" },
  nombreNegocio: { fontFamily: "Helvetica-Bold", fontSize: 15, color: "#FFFFFF" },
  contactoNegocio: { color: "rgba(255,255,255,0.65)", fontSize: 8.5, marginTop: 2 },
  tipoDocumento: {
    textAlign: "right",
    color: COLOR_ACENTO,
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    letterSpacing: 1,
    maxWidth: 260,
  },
  // "FACTURA RECTIFICATIVA" no cabe en una línea al tamaño normal
  // sin partir la palabra por la mitad: se achica solo para ese caso.
  tipoDocumentoLargo: {
    fontSize: 13,
    letterSpacing: 0.5,
    maxWidth: 200,
  },
  numeroDocumento: { textAlign: "right", color: "#FFFFFF", fontSize: 10, marginTop: 4 },
  contenido: { paddingHorizontal: 44, paddingTop: 26, paddingBottom: 44, flex: 1 },
  filaDatos: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  etiquetaChica: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLOR_TEXTO_SECUNDARIO,
    letterSpacing: 1,
    marginBottom: 4,
  },
  clienteNombre: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  textoSecundario: { color: COLOR_TEXTO_SECUNDARIO, fontSize: 9 },
  cajaMeta: { textAlign: "right", fontSize: 9 },
  filaMeta: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginBottom: 4 },
  metaEtiqueta: { color: COLOR_TEXTO_SECUNDARIO },
  metaValor: { color: "#0D1B4B", fontFamily: "Helvetica-Bold" },
  tablaCabecera: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: COLOR_ACENTO,
    paddingBottom: 6,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLOR_PRIMARIO,
    letterSpacing: 0.5,
  },
  tablaFila: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontSize: 10,
  },
  filaImpar: { backgroundColor: COLOR_FONDO },
  colConcepto: { flex: 3 },
  colCantidad: { width: 60, textAlign: "right" },
  colPrecio: { width: 70, textAlign: "right" },
  colCantidadDato: { width: 60, textAlign: "right", color: COLOR_TEXTO_SECUNDARIO },
  colPrecioDato: { width: 70, textAlign: "right", color: COLOR_TEXTO_SECUNDARIO },
  colImporte: { width: 80, textAlign: "right", fontFamily: "Helvetica-Bold" },
  totales: {
    alignSelf: "flex-end",
    width: 200,
    marginTop: 18,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLOR_ACENTO,
    paddingLeft: 12,
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
  totalGrande: { fontFamily: "Helvetica-Bold", fontSize: 17, color: COLOR_PRIMARIO },
  pie: {
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDE,
    paddingTop: 12,
    marginTop: 20,
    fontSize: 8.5,
    color: COLOR_TEXTO_SECUNDARIO,
    lineHeight: 1.7,
  },
  pieTitulo: { fontFamily: "Helvetica-Bold", color: "#0D1B4B", marginBottom: 2 },
});

export function DocumentoModerno(datos: DatosDocumentoPDF) {
  const { empresa, cliente, numeroDocumento, fecha, fechaSecundaria, lineas } = datos;
  const { baseImponible, totalIva, total, etiquetaIva, condiciones, formaPago, rectificaA } = datos;
  const etiquetas = etiquetasDocumento(datos.tipo);
  const contactoNegocio = [empresa.telefono, empresa.email, empresa.nif && `NIF ${empresa.nif}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <Document>
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.banda}>
          <View style={estilos.filaLogo}>
            {empresa.logoUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={empresa.logoUrl} style={estilos.logoImagen} />
            ) : (
              <View style={estilos.logoChip}>
                <Text style={estilos.logoTexto}>{obtenerIniciales(empresa.nombre)}</Text>
              </View>
            )}
            <View>
              <Text style={estilos.nombreNegocio}>{empresa.nombre}</Text>
              {contactoNegocio && <Text style={estilos.contactoNegocio}>{contactoNegocio}</Text>}
            </View>
          </View>
          <View>
            <Text
              style={
                datos.tipo === "rectificativa"
                  ? [estilos.tipoDocumento, estilos.tipoDocumentoLargo]
                  : estilos.tipoDocumento
              }
            >
              {etiquetas.titulo}
            </Text>
            <Text style={estilos.numeroDocumento}>{numeroDocumento}</Text>
          </View>
        </View>

        <View style={estilos.contenido}>
          <View style={estilos.filaDatos}>
            <View>
              <Text style={estilos.etiquetaChica}>{etiquetas.cliente}</Text>
              <Text style={estilos.clienteNombre}>{cliente.nombre}</Text>
              {cliente.nif && <Text style={estilos.textoSecundario}>NIF {cliente.nif}</Text>}
              {cliente.ciudad && <Text style={estilos.textoSecundario}>{cliente.ciudad}</Text>}
              {cliente.direccion && <Text style={estilos.textoSecundario}>{cliente.direccion}</Text>}
              {rectificaA && (
                <Text style={[estilos.textoSecundario, { marginTop: 4 }]}>
                  Rectifica a la factura {rectificaA}
                </Text>
              )}
            </View>
            <View style={estilos.cajaMeta}>
              <View style={estilos.filaMeta}>
                <Text style={estilos.metaEtiqueta}>{etiquetas.fecha}</Text>
                <Text style={estilos.metaValor}>{fecha ? formatearFecha(fecha) : "—"}</Text>
              </View>
              <View style={estilos.filaMeta}>
                <Text style={estilos.metaEtiqueta}>{etiquetas.fechaSecundaria}</Text>
                <Text style={estilos.metaValor}>
                  {fechaSecundaria ? formatearFecha(fechaSecundaria) : "—"}
                </Text>
              </View>
            </View>
          </View>

          <View>
            <View style={estilos.tablaCabecera}>
              <Text style={estilos.colConcepto}>CONCEPTO</Text>
              <Text style={estilos.colCantidad}>CANT.</Text>
              <Text style={estilos.colPrecio}>PRECIO</Text>
              <Text style={estilos.colImporte}>IMPORTE</Text>
            </View>
            {lineas.map((linea, indice) => (
              <View
                key={indice}
                style={indice % 2 === 1 ? [estilos.tablaFila, estilos.filaImpar] : estilos.tablaFila}
              >
                <Text style={estilos.colConcepto}>{linea.concepto}</Text>
                <Text style={estilos.colCantidadDato}>
                  {linea.cantidad} {linea.unidad}
                </Text>
                <Text style={estilos.colPrecioDato}>{formatearEuros(linea.precioUnitario)}</Text>
                <Text style={estilos.colImporte}>{formatearEuros(linea.importe)}</Text>
              </View>
            ))}
          </View>

          <View style={estilos.totales}>
            <View style={estilos.filaTotal}>
              <Text style={{ color: COLOR_TEXTO_SECUNDARIO }}>Base imponible</Text>
              <Text>{formatearEuros(baseImponible)}</Text>
            </View>
            <View style={estilos.filaTotal}>
              <Text style={{ color: COLOR_TEXTO_SECUNDARIO }}>{etiquetaIva}</Text>
              <Text>{formatearEuros(totalIva)}</Text>
            </View>
            <View style={estilos.filaTotalFinal}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Total</Text>
              <Text style={estilos.totalGrande}>{formatearEuros(total)}</Text>
            </View>
          </View>

          <View style={{ flex: 1 }} />

          {(condiciones || formaPago) && (
            <View style={estilos.pie}>
              {condiciones && (
                <>
                  <Text style={estilos.pieTitulo}>Condiciones</Text>
                  <Text>{condiciones}</Text>
                </>
              )}
              {formaPago && <Text style={{ marginTop: 6 }}>Forma de pago: {formaPago}</Text>}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

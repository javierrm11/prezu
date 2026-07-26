import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { formatearEuros, formatearFecha } from "@/lib/formato";
import { obtenerIniciales } from "@/lib/texto";
import { COLOR_PRIMARIO, COLOR_ACENTO, COLOR_TEXTO_SECUNDARIO, COLOR_BORDE, COLOR_FONDO } from "../estilos";
import { etiquetasDocumento, type DatosDocumentoPDF } from "./tipos";

const estilos = StyleSheet.create({
  pagina: { fontSize: 10.5, color: "#0D1B4B", fontFamily: "Helvetica" },
  franja: { position: "absolute", left: 0, top: 0, bottom: 0, width: 8, backgroundColor: COLOR_ACENTO },
  contenido: { paddingTop: 44, paddingRight: 44, paddingBottom: 44, paddingLeft: 52, flex: 1 },
  cabecera: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  filaLogo: { flexDirection: "row", alignItems: "center" },
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
  filaDatos: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 26,
    marginBottom: 24,
  },
  etiquetaChica: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLOR_TEXTO_SECUNDARIO,
    letterSpacing: 1,
    marginBottom: 4,
  },
  clienteNombre: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  insignia: {
    backgroundColor: "#FCEEDA",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  insigniaTexto: { color: "#B87A0E", fontFamily: "Helvetica-Bold", fontSize: 11 },
  filaMeta: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 },
  metaEtiqueta: { color: COLOR_TEXTO_SECUNDARIO, fontSize: 9 },
  metaValor: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  tablaCabecera: {
    flexDirection: "row",
    backgroundColor: "#0D1B4B",
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    padding: 7,
    borderRadius: 4,
  },
  tablaFila: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F6",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 10,
  },
  puntoAcento: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: COLOR_ACENTO,
    marginRight: 6,
  },
  colConcepto: { flex: 3, flexDirection: "row", alignItems: "center" },
  colCantidad: { width: 60, textAlign: "right" },
  colPrecio: { width: 70, textAlign: "right" },
  colCantidadDato: { width: 60, textAlign: "right", color: COLOR_TEXTO_SECUNDARIO },
  colPrecioDato: { width: 70, textAlign: "right", color: COLOR_TEXTO_SECUNDARIO },
  colImporte: { width: 80, textAlign: "right", fontFamily: "Helvetica-Bold" },
  totales: {
    alignSelf: "flex-end",
    width: 190,
    backgroundColor: COLOR_FONDO,
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
    backgroundColor: COLOR_FONDO,
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    fontSize: 8.5,
    color: COLOR_TEXTO_SECUNDARIO,
    lineHeight: 1.7,
  },
  pieTitulo: { fontFamily: "Helvetica-Bold", color: "#0D1B4B", marginBottom: 2 },
});

export function DocumentoConAcento(datos: DatosDocumentoPDF) {
  const { empresa, cliente, numeroDocumento, fecha, fechaSecundaria, lineas } = datos;
  const { baseImponible, totalIva, total, etiquetaIva, condiciones, formaPago } = datos;
  const etiquetas = etiquetasDocumento(datos.tipo);
  const contactoNegocio = [empresa.telefono, empresa.email].filter(Boolean).join(" · ");

  return (
    <Document>
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.franja} fixed />
        <View style={estilos.contenido}>
          <View style={estilos.cabecera}>
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
                {empresa.direccion && (
                  <Text style={estilos.textoSecundario}>{empresa.direccion}</Text>
                )}
              </View>
            </View>
            <View style={estilos.datosNegocio}>
              {empresa.nif && <Text>NIF {empresa.nif}</Text>}
              {empresa.ciudad && <Text>{empresa.ciudad}</Text>}
              {contactoNegocio && <Text>{contactoNegocio}</Text>}
            </View>
          </View>

          <View style={estilos.filaDatos}>
            <View>
              <Text style={estilos.etiquetaChica}>{etiquetas.cliente}</Text>
              <Text style={estilos.clienteNombre}>{cliente.nombre}</Text>
              {cliente.nif && <Text style={estilos.textoSecundario}>NIF {cliente.nif}</Text>}
              {cliente.ciudad && <Text style={estilos.textoSecundario}>{cliente.ciudad}</Text>}
              {cliente.direccion && <Text style={estilos.textoSecundario}>{cliente.direccion}</Text>}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <View style={estilos.insignia}>
                <Text style={estilos.insigniaTexto}>{numeroDocumento}</Text>
              </View>
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
              <View key={indice} style={estilos.tablaFila}>
                <View style={estilos.colConcepto}>
                  <View style={estilos.puntoAcento} />
                  <Text>{linea.concepto}</Text>
                </View>
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

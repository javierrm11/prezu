import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { formatearEuros, formatearFecha } from "@/lib/formato";
import { COLOR_TEXTO_SECUNDARIO } from "../estilos";
import { etiquetasDocumento, type DatosDocumentoPDF } from "./tipos";

const COLOR_LINEA = "#E4E7F2";

const estilos = StyleSheet.create({
  pagina: { padding: 48, fontSize: 11, color: "#0D1B4B", fontFamily: "Helvetica" },
  cabecera: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  filaLogo: { flexDirection: "row", alignItems: "center" },
  logoImagen: { width: 26, height: 26, borderRadius: 6, marginRight: 8, objectFit: "cover" },
  nombreNegocio: { fontFamily: "Helvetica-Bold", fontSize: 13, color: "#0D1B4B" },
  datosNegocio: { textAlign: "right", color: COLOR_TEXTO_SECUNDARIO, fontSize: 9, lineHeight: 1.6 },
  tipoDocumento: {
    marginTop: 32,
    marginBottom: 3,
    fontSize: 9.5,
    letterSpacing: 2,
    color: COLOR_TEXTO_SECUNDARIO,
  },
  numeroDocumento: { fontSize: 24, fontFamily: "Helvetica-Bold", color: "#0D1B4B" },
  divisor: { height: 1, backgroundColor: COLOR_LINEA, marginVertical: 22 },
  filaDatos: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  etiquetaChica: { fontSize: 8.5, color: COLOR_TEXTO_SECUNDARIO, letterSpacing: 1, marginBottom: 5 },
  clienteNombre: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  textoSecundario: { color: COLOR_TEXTO_SECUNDARIO, fontSize: 9.5 },
  filaMeta: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginBottom: 5 },
  metaEtiqueta: { color: COLOR_TEXTO_SECUNDARIO, fontSize: 9.5 },
  metaValor: { fontSize: 9.5, color: "#0D1B4B" },
  tablaCabecera: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#0D1B4B",
    paddingBottom: 9,
    fontSize: 8.5,
    letterSpacing: 1,
    color: COLOR_TEXTO_SECUNDARIO,
  },
  tablaFila: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLOR_LINEA,
    paddingVertical: 12,
    fontSize: 11,
  },
  colConcepto: { flex: 3 },
  colCantidad: { width: 60, textAlign: "right" },
  colPrecio: { width: 70, textAlign: "right" },
  colCantidadDato: { width: 60, textAlign: "right", color: COLOR_TEXTO_SECUNDARIO },
  colPrecioDato: { width: 70, textAlign: "right", color: COLOR_TEXTO_SECUNDARIO },
  colImporte: { width: 80, textAlign: "right" },
  totales: { alignSelf: "flex-end", width: 220, marginTop: 30, gap: 9 },
  filaTotal: { flexDirection: "row", justifyContent: "space-between", fontSize: 11 },
  filaTotalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#0D1B4B",
    paddingTop: 10,
    marginTop: 5,
  },
  totalGrande: { fontFamily: "Helvetica-Bold", fontSize: 22, color: "#0D1B4B" },
  pie: {
    borderTopWidth: 1,
    borderTopColor: COLOR_LINEA,
    paddingTop: 16,
    fontSize: 9.5,
    color: COLOR_TEXTO_SECUNDARIO,
    lineHeight: 1.7,
  },
  pieTitulo: { color: "#0D1B4B", marginBottom: 2, letterSpacing: 1, fontSize: 9 },
  // Sin caja rellena (rompería el "solo líneas finas, sin cajas" de
  // esta plantilla): solo una regla fina arriba y texto grande en
  // negrita, que ya es suficiente para que destaque del resto.
  ibanBloque: { marginTop: 32, borderTopWidth: 1, borderTopColor: COLOR_LINEA, paddingTop: 10 },
  ibanEtiqueta: { fontSize: 8.5, color: COLOR_TEXTO_SECUNDARIO, letterSpacing: 1, marginBottom: 3 },
  ibanValor: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#0D1B4B" },
});

export function DocumentoMinimalista(datos: DatosDocumentoPDF) {
  const { empresa, cliente, numeroDocumento, fecha, fechaSecundaria, lineas } = datos;
  const { baseImponible, totalIva, total, etiquetaIva, condiciones, formaPago, rectificaA } = datos;
  const etiquetas = etiquetasDocumento(datos.tipo);
  const contactoNegocio = [empresa.telefono, empresa.email].filter(Boolean).join(" · ");
  const mostrarIban = datos.tipo !== "presupuesto" && Boolean(empresa.iban);

  return (
    <Document>
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.cabecera}>
          <View style={estilos.filaLogo}>
            {empresa.logoUrl && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={empresa.logoUrl} style={estilos.logoImagen} />
            )}
            <Text style={estilos.nombreNegocio}>{empresa.nombre}</Text>
          </View>
          <View style={estilos.datosNegocio}>
            {empresa.nif && <Text>NIF {empresa.nif}</Text>}
            {empresa.direccion && <Text>{empresa.direccion}</Text>}
            {empresa.ciudad && <Text>{empresa.ciudad}</Text>}
            {contactoNegocio && <Text>{contactoNegocio}</Text>}
          </View>
        </View>

        <Text style={estilos.tipoDocumento}>{etiquetas.titulo} ·</Text>
        <Text style={estilos.numeroDocumento}>{numeroDocumento}</Text>

        <View style={estilos.divisor} />

        <View style={estilos.filaDatos}>
          <View>
            <Text style={estilos.etiquetaChica}>{etiquetas.cliente.toUpperCase()}</Text>
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
          <View>
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
            <Text>Total</Text>
            <Text style={estilos.totalGrande}>{formatearEuros(total)}</Text>
          </View>
        </View>

        {(condiciones || formaPago) && (
          <View style={[estilos.pie, { marginTop: 32 }]}>
            {condiciones && (
              <>
                <Text style={estilos.pieTitulo}>CONDICIONES</Text>
                <Text>{condiciones}</Text>
              </>
            )}
            {formaPago && <Text style={{ marginTop: 6 }}>Forma de pago: {formaPago}</Text>}
          </View>
        )}
        {mostrarIban && (
          <View style={estilos.ibanBloque}>
            <Text style={estilos.ibanEtiqueta}>PAGO POR TRANSFERENCIA</Text>
            <Text style={estilos.ibanValor}>{empresa.iban}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

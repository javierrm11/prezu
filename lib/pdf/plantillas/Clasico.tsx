import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { formatearEuros, formatearFecha } from "@/lib/formato";
import { obtenerIniciales } from "@/lib/texto";
import { COLOR_TEXTO_SECUNDARIO, estilosDocumento as estilos } from "../estilos";
import { etiquetasDocumento, type DatosDocumentoPDF } from "./tipos";

export function DocumentoClasico(datos: DatosDocumentoPDF) {
  const { empresa, cliente, numeroDocumento, fecha, fechaSecundaria, lineas } = datos;
  const { baseImponible, totalIva, total, etiquetaIva, condiciones, formaPago, rectificaA } = datos;
  const etiquetas = etiquetasDocumento(datos.tipo);
  const contactoNegocio = [empresa.telefono, empresa.email].filter(Boolean).join(" · ");
  const mostrarIban = datos.tipo !== "presupuesto" && Boolean(empresa.iban);

  return (
    <Document>
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.cabecera}>
          <View style={estilos.filaCabecera}>
            {empresa.logoUrl ? (
              // No es una imagen DOM: es el primitivo de @react-pdf/renderer,
              // que no acepta (ni necesita) la prop "alt".
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={empresa.logoUrl} style={estilos.logoImagen} />
            ) : (
              <View style={estilos.logoChip}>
                <Text style={estilos.logoTexto}>{obtenerIniciales(empresa.nombre)}</Text>
              </View>
            )}
            <View>
              <Text style={estilos.nombreNegocio}>{empresa.nombre}</Text>
              {empresa.direccion && <Text style={estilos.textoSecundario}>{empresa.direccion}</Text>}
            </View>
          </View>
          <View style={estilos.datosNegocio}>
            {empresa.nif && <Text>NIF {empresa.nif}</Text>}
            {empresa.ciudad && <Text>{empresa.ciudad}</Text>}
            {contactoNegocio && <Text>{contactoNegocio}</Text>}
          </View>
        </View>

        <View style={estilos.divisor} />

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
              <Text>{etiquetas.numero}</Text>
              <Text style={estilos.metaValor}>{numeroDocumento}</Text>
            </View>
            <View style={estilos.filaMeta}>
              <Text>{etiquetas.fecha}</Text>
              <Text style={estilos.metaValor}>{fecha ? formatearFecha(fecha) : "—"}</Text>
            </View>
            <View style={estilos.filaMetaSinMargen}>
              <Text>{etiquetas.fechaSecundaria}</Text>
              <Text style={estilos.metaValor}>
                {fechaSecundaria ? formatearFecha(fechaSecundaria) : "—"}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
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

        <View style={{ flex: 1 }} />

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

        {(condiciones || formaPago) && (
          <View style={[estilos.pie, { marginTop: 20 }]}>
            {condiciones && (
              <>
                <Text style={estilos.pieTitulo}>Condiciones</Text>
                <Text>{condiciones}</Text>
              </>
            )}
            {formaPago && <Text style={{ marginTop: 6 }}>Forma de pago: {formaPago}</Text>}
          </View>
        )}

        <View style={{ flex: 1 }} />

        {mostrarIban && (
          <View style={estilos.ibanCaja}>
            <Text style={estilos.ibanEtiqueta}>PAGO POR TRANSFERENCIA</Text>
            <Text style={estilos.ibanValor}>{empresa.iban}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

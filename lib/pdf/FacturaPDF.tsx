import { Document, Page, View, Text } from "@react-pdf/renderer";
import { formatearEuros, formatearFecha } from "@/lib/formato";
import { obtenerIniciales } from "@/lib/texto";
import {
  COLOR_TEXTO_SECUNDARIO,
  estilosDocumento as estilos,
  type EmpresaPDF,
  type LineaPDF,
} from "./estilos";

export type { LineaPDF };

export type FacturaPDFProps = {
  empresa: EmpresaPDF;
  cliente: { nombre: string; nif: string | null; direccion: string | null };
  numeroDocumento: string;
  fecha: string | null;
  vencimiento: string | null;
  lineas: LineaPDF[];
  baseImponible: number;
  totalIva: number;
  total: number;
  etiquetaIva: string;
  condiciones: string | null;
  formaPago: string | null;
};

export function FacturaPDF({
  empresa,
  cliente,
  numeroDocumento,
  fecha,
  vencimiento,
  lineas,
  baseImponible,
  totalIva,
  total,
  etiquetaIva,
  condiciones,
  formaPago,
}: FacturaPDFProps) {
  const contactoNegocio = [empresa.telefono, empresa.email].filter(Boolean).join(" · ");

  return (
    <Document>
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.cabecera}>
          <View style={estilos.filaCabecera}>
            <View style={estilos.logoChip}>
              <Text style={estilos.logoTexto}>{obtenerIniciales(empresa.nombre)}</Text>
            </View>
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
            <Text style={estilos.etiquetaChica}>FACTURAR A</Text>
            <Text style={estilos.clienteNombre}>{cliente.nombre}</Text>
            {cliente.nif && <Text style={estilos.textoSecundario}>NIF {cliente.nif}</Text>}
            {cliente.direccion && <Text style={estilos.textoSecundario}>{cliente.direccion}</Text>}
          </View>
          <View style={estilos.cajaMeta}>
            <View style={estilos.filaMeta}>
              <Text>Nº factura</Text>
              <Text style={estilos.metaValor}>{numeroDocumento}</Text>
            </View>
            <View style={estilos.filaMeta}>
              <Text>Emitida</Text>
              <Text style={estilos.metaValor}>{fecha ? formatearFecha(fecha) : "—"}</Text>
            </View>
            <View style={estilos.filaMetaSinMargen}>
              <Text>Vencimiento</Text>
              <Text style={estilos.metaValor}>
                {vencimiento ? formatearFecha(vencimiento) : "—"}
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
              <Text style={estilos.colCantidad}>
                {linea.cantidad} {linea.unidad}
              </Text>
              <Text style={estilos.colPrecio}>{formatearEuros(linea.precioUnitario)}</Text>
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
      </Page>
    </Document>
  );
}

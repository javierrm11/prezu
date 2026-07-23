// Única fuente de cálculo de totales de la app. Todo en céntimos
// enteros para evitar errores de coma flotante; redondeo a 2
// decimales por línea, los totales son la suma de líneas ya
// redondeadas.

export type LineaImporte = {
  cantidad: number;
  precioUnitario: number;
  descuentoPct?: number;
  tipoIva: number;
};

export type ResultadoLinea = {
  importe: number;
  cuotaIva: number;
};

export type ResultadoTotales = {
  baseImponible: number;
  totalIva: number;
  total: number;
};

function aCentimos(valor: number) {
  return Math.round(valor * 100);
}

function aEuros(centimos: number) {
  return centimos / 100;
}

export function calcularLinea({
  cantidad,
  precioUnitario,
  descuentoPct = 0,
  tipoIva,
}: LineaImporte): ResultadoLinea {
  const brutoCentimos = aCentimos(cantidad * precioUnitario);
  const importeCentimos = Math.round(brutoCentimos * (1 - descuentoPct / 100));
  const cuotaIvaCentimos = Math.round(importeCentimos * (tipoIva / 100));

  return {
    importe: aEuros(importeCentimos),
    cuotaIva: aEuros(cuotaIvaCentimos),
  };
}

export function calcularTotales(lineas: LineaImporte[]): ResultadoTotales {
  let baseCentimos = 0;
  let ivaCentimos = 0;

  for (const linea of lineas) {
    const resultado = calcularLinea(linea);
    baseCentimos += aCentimos(resultado.importe);
    ivaCentimos += aCentimos(resultado.cuotaIva);
  }

  return {
    baseImponible: aEuros(baseCentimos),
    totalIva: aEuros(ivaCentimos),
    total: aEuros(baseCentimos + ivaCentimos),
  };
}

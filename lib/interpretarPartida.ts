// Interpreta texto libre (escrito o dictado) como una partida, sin
// IA: expresiones regulares para cantidad/unidad/precio + búsqueda
// por solapamiento de palabras contra el catálogo del negocio. No
// "entiende" el texto — reconoce patrones y datos ya conocidos.

export type ItemCatalogoBase = {
  concepto: string;
  unidad: string;
  precioUnitario: number;
  tipoIva: number;
};

export type PartidaInterpretada = {
  concepto: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  tipoIva: number;
};

const PATRONES_UNIDAD: { patron: RegExp; unidad: string }[] = [
  { patron: /(\d+(?:[.,]\d+)?)\s*horas?\b/i, unidad: "h" },
  { patron: /(\d+(?:[.,]\d+)?)\s*(?:metros?\s*cuadrados?|m2|m²)\b/i, unidad: "m2" },
  { patron: /(\d+(?:[.,]\d+)?)\s*metros?\b/i, unidad: "m" },
  { patron: /(\d+(?:[.,]\d+)?)\s*(?:kilos?|kg)\b/i, unidad: "kg" },
  { patron: /(\d+(?:[.,]\d+)?)\s*(?:unidades?|uds?)\b/i, unidad: "ud" },
];

// Sin \b tras la alternativa: "€" no es un carácter de palabra, así
// que un \b ahí nunca coincide cuando le sigue un espacio, un signo
// o el final de la cadena ("180€" o "180€ + 10% iva" no matcheaban).
const PATRON_PRECIO =
  /(?:por|son|unos?|unas?|cuestan?|vale[n]?|a)?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:€|euros?)/i;

const PATRON_IVA_DESPUES = /\+?\s*(\d+(?:[.,]\d+)?)\s*%\s*(?:de\s*)?iva\b/i;
const PATRON_IVA_ANTES = /iva\s+(?:del?\s+)?(\d+(?:[.,]\d+)?)\s*%/i;

function aNumero(texto: string) {
  return parseFloat(texto.replace(",", "."));
}

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    // Quita los diacríticos sueltos que deja NFD (rango Unicode de
    // marcas combinantes) para comparar "sifón" con "sifon" igual.
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

function palabras(texto: string) {
  return normalizar(texto)
    .split(/\s+/)
    .filter((palabra) => palabra.length > 2);
}

function buscarEnCatalogo(concepto: string, catalogo: ItemCatalogoBase[]) {
  const palabrasTexto = new Set(palabras(concepto));
  if (palabrasTexto.size === 0) return null;

  let mejor: { item: ItemCatalogoBase; puntuacion: number } | null = null;

  for (const item of catalogo) {
    const palabrasItem = palabras(item.concepto);
    if (palabrasItem.length === 0) continue;

    const coincidencias = palabrasItem.filter((palabra) => palabrasTexto.has(palabra)).length;
    const puntuacion = coincidencias / palabrasItem.length;

    // Al menos el 60% de las palabras de la partida del catálogo
    // deben aparecer en el texto dictado, para evitar falsos positivos.
    if (puntuacion >= 0.6 && (!mejor || puntuacion > mejor.puntuacion)) {
      mejor = { item, puntuacion };
    }
  }

  return mejor?.item ?? null;
}

export function interpretarTexto(
  textoOriginal: string,
  catalogo: ItemCatalogoBase[],
  ivaDefecto: number,
): PartidaInterpretada {
  let texto = textoOriginal.trim();
  let cantidad = 1;
  let unidad = "ud";
  let precioUnitario: number | null = null;
  let tipoIva: number | null = null;

  for (const { patron, unidad: unidadPatron } of PATRONES_UNIDAD) {
    const coincidencia = texto.match(patron);
    if (coincidencia) {
      cantidad = aNumero(coincidencia[1]);
      unidad = unidadPatron;
      texto = texto.replace(coincidencia[0], " ");
      break;
    }
  }

  const coincidenciaIva = texto.match(PATRON_IVA_DESPUES) ?? texto.match(PATRON_IVA_ANTES);
  if (coincidenciaIva) {
    tipoIva = aNumero(coincidenciaIva[1]);
    texto = texto.replace(coincidenciaIva[0], " ");
  }

  const coincidenciaPrecio = texto.match(PATRON_PRECIO);
  if (coincidenciaPrecio) {
    precioUnitario = aNumero(coincidenciaPrecio[1]);
    texto = texto.replace(coincidenciaPrecio[0], " ");
  }

  const conceptoLimpio = texto
    .replace(/\s+/g, " ")
    .replace(/^[\s,.-]+|[\s,.-]+$/g, "")
    // Quita el conector que queda colgando al recortar "3 horas de…"
    // o "160 euros de…" por el medio del texto.
    .replace(/^(?:de|del|de la|en|para)\s+/i, "")
    .trim();

  const conceptoFinal = conceptoLimpio || textoOriginal.trim();
  const coincidenciaCatalogo = buscarEnCatalogo(conceptoFinal, catalogo);

  return {
    concepto: coincidenciaCatalogo?.concepto ?? conceptoFinal,
    cantidad,
    unidad: coincidenciaCatalogo?.unidad ?? unidad,
    precioUnitario: precioUnitario ?? coincidenciaCatalogo?.precioUnitario ?? 0,
    tipoIva: tipoIva ?? coincidenciaCatalogo?.tipoIva ?? ivaDefecto,
  };
}

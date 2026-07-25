import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { ItemCatalogoBase } from "@/lib/interpretarPartida";

// Único uso server-only del proyecto: la API key de Gemini nunca
// debe llegar al cliente. Este módulo solo se importa desde
// Server Actions.

const MODELO = "gemini-3.0-flash";
const INTENTOS_MAXIMOS = 2;

const PartidaExtraidaSchema = z.object({
  concepto: z.string().min(1),
  cantidad: z.number().positive(),
  unidad: z.enum(["ud", "h", "m", "m2", "m3", "kg", "pa"]),
  precioUnitario: z.number().nonnegative(),
  tipoIva: z.number(),
});

const ExtraccionSchema = z.object({
  partidas: z.array(PartidaExtraidaSchema).min(1),
});

const esquemaJson = z.toJSONSchema(ExtraccionSchema);

export type PartidaExtraida = z.infer<typeof PartidaExtraidaSchema>;

function construirPrompt(texto: string, catalogo: ItemCatalogoBase[], ivaDefecto: number) {
  const catalogoTexto = catalogo.length
    ? catalogo
        .map((item) => `- ${item.concepto}: ${item.precioUnitario} €/${item.unidad}, IVA ${item.tipoIva} %`)
        .join("\n")
    : "(este negocio todavía no tiene partidas guardadas en su catálogo)";

  return `Eres un asistente que ayuda a un autónomo de oficios (fontanero, electricista, reformas) a convertir en partidas de presupuesto la descripción de un trabajo que acaba de dictar o escribir.

Texto del trabajo:
"""
${texto}
"""

Catálogo de precios habituales de este negocio. Cuando el trabajo descrito coincida claramente con una de estas partidas, reutiliza exactamente su precio, unidad e IVA. Si no hay ninguna coincidencia clara, propón un precio en euros razonable para ese trabajo y usa IVA ${ivaDefecto} %:
${catalogoTexto}

Divide el texto en una o varias partidas, una por cada trabajo o material distinto que se mencione. Cada partida necesita: concepto (breve y claro, sin precios ni cantidades dentro del texto), cantidad, unidad (ud, h, m, m2, m3, kg o pa), precioUnitario (euros, sin IVA) y tipoIva (21, 10, 4 o 0).`;
}

export async function extraerPartidas(
  texto: string,
  catalogo: ItemCatalogoBase[],
  ivaDefecto: number,
): Promise<PartidaExtraida[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta GEMINI_API_KEY");
  }

  const cliente = new GoogleGenAI({ apiKey });
  const prompt = construirPrompt(texto, catalogo, ivaDefecto);

  let ultimoError: unknown;

  for (let intento = 0; intento < INTENTOS_MAXIMOS; intento++) {
    try {
      const interaction = await cliente.interactions.create({
        model: MODELO,
        input: prompt,
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: esquemaJson,
        },
      });

      if (!interaction.output_text) {
        throw new Error("Respuesta vacía de Gemini");
      }

      const bruto = JSON.parse(interaction.output_text);
      // Rechaza y reintenta si no valida (regla del flujo de voz).
      const validado = ExtraccionSchema.parse(bruto);
      return validado.partidas;
    } catch (error) {
      ultimoError = error;
    }
  }

  throw ultimoError instanceof Error ? ultimoError : new Error("No se pudo interpretar el texto");
}

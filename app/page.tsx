import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, FileText, Play, ShieldCheck } from "lucide-react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { construirEnlaceWhatsApp } from "@/lib/whatsapp";
import { Logo } from "@/components/ui/Logo";
import { Boton } from "@/components/ui/Boton";
import { EncabezadoLanding } from "./_landing/EncabezadoLanding";
import { RevelarAlEntrar } from "./_landing/RevelarAlEntrar";
import { AcordeonFAQ, type PreguntaFrecuente } from "./_landing/AcordeonFAQ";
import { WhatsAppFlotante } from "./_landing/WhatsAppFlotante";

export const metadata: Metadata = {
  title: "Presupuestos y facturas por voz para autónomos de oficios",
  description:
    "Dicta el trabajo y tu cliente recibe el presupuesto por WhatsApp en segundos. Facturas con numeración correlativa, preparado para VeriFactu.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Prezu — Del tajo al presupuesto en 30 segundos",
    description:
      "Dicta el trabajo y tu cliente recibe el presupuesto por WhatsApp antes de que arranques la furgoneta.",
    url: "/",
    siteName: "Prezu",
    locale: "es_ES",
    type: "website",
  },
};

const WHATSAPP_CONTACTO = construirEnlaceWhatsApp(
  "+34611434736",
  "Hola, quiero saber más sobre Prezu.",
);

const BARRAS_ONDA = [
  { alto: 16, retraso: 0 },
  { alto: 28, retraso: 0.09 },
  { alto: 36, retraso: 0.18 },
  { alto: 22, retraso: 0.27 },
  { alto: 32, retraso: 0.36 },
  { alto: 38, retraso: 0.45 },
  { alto: 20, retraso: 0.54 },
  { alto: 34, retraso: 0.18 },
  { alto: 26, retraso: 0.36 },
  { alto: 36, retraso: 0.09 },
  { alto: 18, retraso: 0.45 },
  { alto: 30, retraso: 0.27 },
];

const PREGUNTAS: PreguntaFrecuente[] = [
  {
    pregunta: "¿Y si no me entiende al dictar?",
    respuesta:
      "Siempre revisas antes de enviar. La app te enseña las partidas y las corriges en un toque. Nada sale sin tu visto bueno.",
  },
  {
    pregunta: "¿Tengo que meter mis precios uno a uno?",
    respuesta:
      "No hace falta escribir cada precio desde cero: puedes elegir conceptos habituales de tu oficio (fontanería, electricidad, reformas, taller...) y ponerles tu precio, o dictarlos directamente. Prezu los recuerda para la próxima vez.",
  },
  {
    pregunta: "¿Vale para facturas o solo presupuestos?",
    respuesta:
      "Para las dos cosas. Un presupuesto aceptado se convierte en factura en un clic, con numeración correlativa.",
  },
  {
    pregunta: "¿Necesito instalar algo?",
    respuesta: "No. Funciona directamente en el navegador del móvil, sin instalar nada.",
  },
  {
    pregunta: "¿Esto cumple con la ley de facturación nueva?",
    respuesta:
      "Está construido pensando en VeriFactu, que será obligatoria para los autónomos en los próximos años: facturas inmutables, numeración correlativa y conexión con la AEAT lista para activarse en cuanto lo exija la ley.",
  },
  {
    pregunta: "¿Y mis datos?",
    respuesta: "Son tuyos. Cumplimos el RGPD y no los compartimos con terceros.",
  },
];

export default async function Home() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const jsonLdSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Prezu",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Presupuestos y facturas por voz para autónomos de oficios: fontaneros, electricistas, talleres y reformas.",
    offers: PLANES.map((plan) => ({
      "@type": "Offer",
      name: plan.nombre,
      price: plan.precio.replace(/[^\d]/g, "") || "0",
      priceCurrency: "EUR",
    })),
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PREGUNTAS.map((pregunta) => ({
      "@type": "Question",
      name: pregunta.pregunta,
      acceptedAnswer: { "@type": "Answer", text: pregunta.respuesta },
    })),
  };

  return (
    <div id="top" className="flex flex-1 flex-col bg-fondo">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <EncabezadoLanding />
      <Hero />
      <SeccionDolor />
      <ComoFunciona />
      <SeccionCatalogo />
      <SeccionVerifactu />
      <Precios />
      <SeccionPreguntas />
      <CTAFinal />
      <PieDePagina />
      <WhatsAppFlotante enlace={WHATSAPP_CONTACTO} />
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-fondo px-5 py-8 sm:py-14">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-10 sm:gap-16">
        <div className="flex min-w-[280px] flex-1 basis-[380px] flex-col gap-4">
          <h1 className="text-pretty font-heading text-[34px] leading-[1.05] font-bold tracking-tight text-primario sm:text-[54px]">
            Del tajo al presupuesto en 30 segundos.
          </h1>
          <p className="max-w-[34ch] text-pretty text-[16px] leading-relaxed text-texto-secundario sm:text-[19px]">
            Dicta el trabajo al salir de la visita y tu cliente recibe un PDF profesional por
            WhatsApp antes de que arranques la furgoneta.
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2.5">
            <Link href="/registro">
              <Boton>Empezar gratis</Boton>
            </Link>
            <a href="#como-funciona">
              <Boton variante="secundario" className="inline-flex items-center gap-2">
                <Play size={17} fill="currentColor" />
                Ver cómo funciona
              </Boton>
            </a>
          </div>
          <div className="text-[13px] text-texto-secundario">
            1 día gratis · 2 € el primer mes · 5 €/mes después
          </div>
          <div className="mt-0.5 flex items-center gap-2 border-t border-borde pt-4 text-[14px] text-texto-secundario">
            <ShieldCheck size={17} className="flex-shrink-0 text-secundario" />
            Hecho para fontaneros, electricistas, talleres y reformas.
          </div>
        </div>

        <div className="flex min-w-[240px] flex-1 basis-[300px] justify-center">
          <div className="relative flex w-[min(100%,300px)] flex-col items-center pb-[82px]">
            <div className="w-[min(100%,300px)] overflow-hidden rounded-[30px] border-[9px] border-primario bg-superficie shadow-[0_16px_44px_rgba(26,43,109,0.22)]">
              <div className="flex h-[22px] items-center justify-center bg-primario">
                <div className="h-[5px] w-14 rounded-full bg-white/28" />
              </div>
              <div className="flex flex-col items-center gap-3 bg-fondo px-3.5 pt-3.5 pb-[18px]">
                <div className="self-start font-heading text-[15px] font-bold text-primario">
                  Presupuesto por voz
                </div>
                <div className="font-heading text-2xl font-bold tabular-nums text-texto">0:07</div>
                <div className="flex h-[38px] items-center gap-[3px]">
                  {BARRAS_ONDA.map((barra, indice) => (
                    <div
                      key={indice}
                      className="w-1 rounded-sm bg-peligro"
                      style={{
                        height: barra.alto,
                        animation: `onda-voz 1.1s ease-in-out ${barra.retraso}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <div
                  className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-peligro bg-[#FCEAEA]"
                  style={{ animation: "pulso-grabando 1.7s ease-out infinite" }}
                >
                  <div className="h-3 w-3 rounded-[2px] bg-peligro" />
                </div>
                <div className="text-[13px] font-medium text-peligro">Grabando…</div>
                <div className="w-full rounded-xl border border-borde bg-superficie px-3.5 py-2.5 text-[13px] leading-relaxed text-texto-secundario">
                  «Para María Dolores: doce metros de tubería a catorce cincuenta…»
                </div>
              </div>
            </div>

            <div
              className="absolute right-[-6px] bottom-0 flex w-[min(96%,258px)] flex-col gap-2 rounded-xl rounded-bl-[4px] bg-superficie px-3.5 py-2.5 shadow-[0_10px_28px_rgba(26,43,109,0.22)]"
              style={{ animation: "flotar 4s ease-in-out infinite" }}
            >
              <div className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2z" />
                </svg>
                <span className="text-[11px] font-semibold text-texto-secundario">
                  Fontanería Paco García
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-[34px] flex-shrink-0 items-center justify-center rounded-[5px] border border-borde bg-[#EEF0F6]">
                  <FileText size={16} className="text-peligro" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs leading-snug font-semibold text-texto">
                    Presupuesto · Reforma de baño
                  </div>
                  <div className="mt-0.5 text-[13px] font-semibold tabular-nums text-texto">
                    960,74 €
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-[10px] text-[#8A8FA3]">
                12:41
                <svg width="14" height="10" viewBox="0 0 24 18" fill="none" aria-hidden="true">
                  <path
                    d="M15 4 7 14l-4-4"
                    stroke="#2F4FB5"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m21 4-8 10-1.4-1.4"
                    stroke="#2F4FB5"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const DOLORES = [
  {
    titulo: "Los presupuestos, para la noche.",
    texto: "Llegas a casa reventado y aún te quedan dos por pasar.",
  },
  {
    titulo: "El cliente no espera.",
    texto: "Mientras tardas tres días en mandar el papel, otro ya se lo ha llevado.",
  },
  {
    titulo: "Y ahora, la ley nueva.",
    texto: "VeriFactu está al caer y tu Excel de facturas no va a valer.",
  },
];

function SeccionDolor() {
  return (
    <RevelarAlEntrar>
      <section className="bg-primario px-5 py-12 sm:py-[88px]">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="mb-8 font-heading text-[30px] leading-tight font-bold text-white sm:text-[46px]">
            ¿Te suena?
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {DOLORES.map((dolor) => (
              <div
                key={dolor.titulo}
                className="flex flex-col gap-3 rounded-xl border border-white/14 bg-white/6 p-6"
              >
                <div className="font-heading text-[19px] font-bold text-white">{dolor.titulo}</div>
                <div className="text-[15px] leading-relaxed text-white/72">{dolor.texto}</div>
              </div>
            ))}
          </div>
          <div className="mt-9 max-w-[22ch] text-pretty font-heading text-[22px] leading-snug font-bold text-acento sm:text-[34px]">
            Cada presupuesto que tardas es un trabajo que vuela.
          </div>
        </div>
      </section>
    </RevelarAlEntrar>
  );
}

function ComoFunciona() {
  return (
    <RevelarAlEntrar>
      <section id="como-funciona" className="bg-fondo px-5 py-12 sm:py-[88px]">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-12 sm:gap-[72px]">
          <h2 className="font-heading text-[30px] leading-tight font-bold text-primario sm:text-[46px]">
            Habla. Revisa. Envía.
          </h2>

          <div className="flex flex-wrap items-center gap-8 sm:gap-14">
            <div className="flex min-w-[280px] flex-1 basis-[320px] flex-col gap-3.5">
              <PasoNumero numero={1} />
              <div className="font-heading text-[22px] font-bold text-primario sm:text-[28px]">
                Dicta el trabajo.
              </div>
              <p className="max-w-[42ch] text-pretty text-[16px] leading-relaxed text-texto-secundario">
                «Para María Dolores: doce metros de tubería a catorce cincuenta, un plato de ducha
                instalado y ocho horas de mano de obra.»
              </p>
            </div>
            <div className="flex min-w-[240px] flex-1 basis-[260px] justify-center">
              <div className="w-[min(100%,250px)] overflow-hidden rounded-[26px] border-8 border-primario bg-superficie shadow-[0_10px_30px_rgba(26,43,109,0.16)]">
                <div className="flex flex-col items-center gap-3.5 bg-fondo px-3.5 pt-5 pb-6">
                  <div className="font-heading text-[22px] font-bold tabular-nums text-texto">
                    0:12
                  </div>
                  <div className="flex h-[34px] items-center gap-[3px]">
                    {BARRAS_ONDA.slice(0, 10).map((barra, indice) => (
                      <div
                        key={indice}
                        className="w-1 rounded-sm bg-peligro"
                        style={{
                          height: barra.alto - 4,
                          animation: `onda-voz 1.1s ease-in-out ${barra.retraso}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-peligro bg-[#FCEAEA]">
                    <div className="h-3 w-3 rounded-[2px] bg-peligro" />
                  </div>
                  <div className="w-full rounded-xl border border-borde bg-superficie px-3 py-2.5 text-xs leading-relaxed text-texto-secundario">
                    doce metros de tubería a catorce cincuenta, un plato de ducha instalado…
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 sm:flex-row-reverse sm:gap-14">
            <div className="flex min-w-[280px] flex-1 basis-[320px] flex-col gap-3.5">
              <PasoNumero numero={2} />
              <div className="font-heading text-[22px] font-bold text-primario sm:text-[28px]">
                Prezu lo convierte en presupuesto.
              </div>
              <p className="max-w-[42ch] text-pretty text-[16px] leading-relaxed text-texto-secundario">
                Partidas, cantidades, precios y IVA, con TUS precios de siempre. Tú solo revisas y
                corriges si hace falta.
              </p>
            </div>
            <div className="min-w-[280px] flex-1 basis-[320px]">
              <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
                <div className="grid grid-cols-[minmax(0,3fr)_54px_86px] gap-2 border-b border-borde px-3.5 py-2.5 text-[10px] font-semibold tracking-wider text-texto-secundario">
                  <div>CONCEPTO</div>
                  <div className="text-right">CANT.</div>
                  <div className="text-right">IMPORTE</div>
                </div>
                {[
                  { concepto: "Tubería multicapa 20 mm", cant: "12 m", importe: "174,00 €" },
                  { concepto: "Plato de ducha instalado", cant: "1 ud", importe: "280,00 €" },
                  { concepto: "Grifería monomando", cant: "1 ud", importe: "60,00 €" },
                  { concepto: "Mano de obra", cant: "8 h", importe: "280,00 €" },
                ].map((linea) => (
                  <div
                    key={linea.concepto}
                    className="grid h-11 grid-cols-[minmax(0,3fr)_54px_86px] items-center gap-2 border-b border-[#EEF0F6] px-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-1.5 text-[13px]">
                      <span className="h-[7px] w-[7px] flex-shrink-0 rounded-full bg-acento" />
                      <span className="truncate">{linea.concepto}</span>
                    </div>
                    <div className="text-right text-[13px] tabular-nums text-texto-secundario">
                      {linea.cant}
                    </div>
                    <div className="text-right text-[13px] font-semibold tabular-nums">
                      {linea.importe}
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-1.5 bg-fondo p-3.5">
                  <div className="flex justify-between text-[13px] text-texto-secundario">
                    <span>Base imponible</span>
                    <span className="tabular-nums text-texto">794,00 €</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-texto-secundario">
                    <span>IVA (21 %)</span>
                    <span className="tabular-nums text-texto">166,74 €</span>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-borde pt-2">
                    <span className="text-[13px] font-semibold">Total</span>
                    <span className="font-heading text-[26px] font-bold tabular-nums text-primario">
                      960,74 €
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-texto-secundario">
                <span className="h-[7px] w-[7px] rounded-full bg-acento" />
                Precio sacado de tu catálogo
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 sm:gap-14">
            <div className="flex min-w-[280px] flex-1 basis-[320px] flex-col gap-3.5">
              <PasoNumero numero={3} />
              <div className="font-heading text-[22px] font-bold text-primario sm:text-[28px]">
                Tu cliente lo recibe por WhatsApp.
              </div>
              <p className="max-w-[42ch] text-pretty text-[16px] leading-relaxed text-texto-secundario">
                PDF con tu logo y un botón para aceptar. Te avisamos cuando lo ve y cuando lo
                acepta.
              </p>
            </div>
            <div className="flex min-w-[240px] flex-1 basis-[260px] justify-center">
              <div className="w-[min(100%,250px)] overflow-hidden rounded-[26px] border-8 border-primario bg-superficie shadow-[0_10px_30px_rgba(26,43,109,0.16)]">
                <div className="flex items-center gap-2.5 border-b border-borde px-3.5 py-3">
                  <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-primario font-heading text-[13px] font-bold text-acento">
                    PG
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-texto">
                      Fontanería Paco García
                    </div>
                    <div className="text-[10px] text-texto-secundario">
                      Villafranca de Córdoba
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 bg-fondo p-3.5">
                  <div className="font-heading text-[15px] font-bold text-primario">
                    Presupuesto P-2026-014
                  </div>
                  <div className="flex flex-col gap-1.5 rounded-xl border border-borde bg-superficie px-3 py-2.5">
                    <div className="flex justify-between text-[11px] text-texto-secundario">
                      <span>Reforma de baño</span>
                      <span className="tabular-nums text-texto">794,00 €</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-texto-secundario">
                      <span>IVA (21 %)</span>
                      <span className="tabular-nums text-texto">166,74 €</span>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-borde pt-1.5">
                      <span className="text-xs font-semibold">Total</span>
                      <span className="font-heading text-[19px] font-bold tabular-nums text-primario">
                        960,74 €
                      </span>
                    </div>
                  </div>
                  <div className="flex h-[46px] items-center justify-center rounded-lg bg-exito text-sm font-semibold text-white">
                    Aceptar presupuesto
                  </div>
                  <div className="flex h-10 items-center justify-center rounded-lg border-[1.5px] border-secundario text-[13px] font-medium text-secundario">
                    Proponer cambios
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </RevelarAlEntrar>
  );
}

function PasoNumero({ numero }: { numero: number }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primario font-heading text-[19px] font-bold text-acento">
      {numero}
    </div>
  );
}

const ITEMS_CATALOGO = [
  { concepto: "Mano de obra", usos: 48, precio: "35,00 € / h" },
  { concepto: "Tubería multicapa 20 mm instalada", usos: 23, precio: "14,50 € / m" },
  { concepto: "Desatasco con máquina", usos: 19, precio: "120,00 € / ud" },
  { concepto: "Grifería monomando instalada", usos: 14, precio: "60,00 € / ud" },
  { concepto: "Sustitución termo eléctrico 80 L", usos: 6, precio: "340,00 € / ud" },
];

function SeccionCatalogo() {
  return (
    <RevelarAlEntrar>
      <section className="border-y border-borde bg-superficie px-5 py-12 sm:py-[88px]">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-8 sm:gap-14">
          <div className="flex min-w-[300px] flex-1 basis-[340px] flex-col gap-4">
            <h2 className="text-pretty font-heading text-[28px] leading-tight font-bold text-primario sm:text-[42px]">
              Tu catálogo, tu chapa y pintura.
            </h2>
            <p className="max-w-[44ch] text-pretty text-[16px] leading-relaxed text-texto-secundario">
              La primera vez le dices el precio. La segunda, ya se lo sabe. Prezu guarda tus
              partidas de siempre — la hora de mano de obra, el metro de tubería, el
              desplazamiento — y las clava en cada presupuesto. Cuanto más lo usas, más rápido va.
            </p>
          </div>
          <div className="min-w-[280px] flex-1 basis-[320px]">
            <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
              <div className="flex items-center gap-2 bg-[#E8EDFB] px-3.5 py-2.5 text-xs text-secundario">
                Prezu usa estos precios cuando dictas.
              </div>
              {ITEMS_CATALOGO.map((item, indice) => (
                <div
                  key={item.concepto}
                  className={`flex items-center gap-3 px-3.5 py-3 ${
                    indice < ITEMS_CATALOGO.length - 1 ? "border-b border-[#EEF0F6]" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-texto">{item.concepto}</div>
                    <div className="text-[11px] text-[#8A8FA3]">Usado {item.usos} veces</div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums text-texto">
                    {item.precio}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </RevelarAlEntrar>
  );
}

function SeccionVerifactu() {
  return (
    <RevelarAlEntrar>
      <section className="bg-primario px-5 py-12 sm:py-[88px]">
        <div className="mx-auto flex max-w-[900px] flex-col items-start gap-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-acento/40 bg-acento/16 px-3.5 py-1.5 text-[13px] font-semibold text-acento">
            <ShieldCheck size={14} />
            Preparado para VeriFactu
          </span>
          <h2 className="text-pretty font-heading text-[30px] leading-tight font-bold text-white sm:text-[46px]">
            Aceptado hoy, facturado hoy.
          </h2>
          <p className="max-w-[52ch] text-pretty text-[16px] leading-relaxed text-white/75 sm:text-[18px]">
            Cuando el cliente acepta, la factura se hace sola: mismo trabajo, mismas partidas,
            numeración correlativa y sin errores. Y con la vista puesta en{" "}
            <strong className="font-semibold text-white">VeriFactu</strong>, la normativa que
            será obligatoria para los autónomos en los próximos años. Cuando llegue, tú ya estarás
            listo.
          </p>
          <div className="max-w-[56ch] border-t border-white/16 pt-4 text-[13px] text-white/55">
            Hoy generas facturas válidas; la conexión con la AEAT se activará cuando la ley lo
            exija.
          </div>
        </div>
      </section>
    </RevelarAlEntrar>
  );
}

const PLANES = [
  {
    nombre: "Gratis",
    precio: "0 €",
    descripcion: "Captación / autónomo que factura muy poco",
    ventajas: ["Hasta 5 presupuestos o facturas al mes", "1 usuario"],
    destacado: false,
  },
  {
    nombre: "Básico",
    precio: "9 €",
    descripcion: "Autónomo con actividad habitual",
    ventajas: ["Presupuestos y facturas ilimitadas", "1 usuario", "Seguimiento de cobros"],
    destacado: true,
  },
];

function Precios() {
  return (
    <RevelarAlEntrar>
      <section id="precios" className="bg-fondo px-5 pt-10 pb-12 sm:pt-[72px] sm:pb-[88px]">
        <div className="mx-auto flex max-w-[680px] flex-col items-center gap-8">
          <h2 className="text-center font-heading text-[30px] leading-tight font-bold text-primario sm:text-[46px]">
            Un plan para cada momento del negocio.
          </h2>

          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
            {PLANES.map((plan) => (
              <div
                key={plan.nombre}
                className={`flex flex-col gap-5 rounded-xl border-2 bg-superficie p-6 text-left shadow-tarjeta ${
                  plan.destacado ? "border-acento" : "border-borde"
                }`}
              >
                <div>
                  <div className="font-heading text-[19px] font-bold text-primario">
                    {plan.nombre}
                  </div>
                  <div className="mt-0.5 text-[13px] text-texto-secundario">{plan.descripcion}</div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="font-heading text-[38px] font-bold tabular-nums text-texto">
                      {plan.precio}
                    </span>
                    <span className="text-[15px] text-texto-secundario">/mes</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 border-t border-[#EEF0F6] pt-5">
                  {plan.ventajas.map((ventaja) => (
                    <div key={ventaja} className="flex items-start gap-2.5">
                      <Check size={18} className="mt-0.5 flex-shrink-0 text-exito" strokeWidth={2.4} />
                      <span className="text-[15px]">{ventaja}</span>
                    </div>
                  ))}
                </div>
                <Link href="/registro">
                  <Boton
                    variante={plan.destacado ? "primario" : "secundario"}
                    className="w-full"
                  >
                    Empezar gratis
                  </Boton>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center text-[13px] text-texto-secundario">
            Todos los planes empiezan por el plan Gratis, sin tarjeta. Mejora cuando lo necesites.
          </div>
        </div>
      </section>
    </RevelarAlEntrar>
  );
}

function SeccionPreguntas() {
  return (
    <RevelarAlEntrar>
      <section id="preguntas" className="border-t border-borde bg-superficie px-5 py-12 sm:py-[88px]">
        <div className="mx-auto max-w-[760px]">
          <h2 className="mb-6 font-heading text-[28px] leading-tight font-bold text-primario sm:text-[42px]">
            Preguntas frecuentes
          </h2>
          <AcordeonFAQ preguntas={PREGUNTAS} />
        </div>
      </section>
    </RevelarAlEntrar>
  );
}

function CTAFinal() {
  return (
    <RevelarAlEntrar>
      <section className="bg-primario px-5 py-14 sm:py-[104px]">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-6 text-center">
          <h2 className="text-pretty font-heading text-[32px] leading-[1.05] font-bold text-white sm:text-[56px]">
            El próximo presupuesto, díctalo.
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/registro">
              <Boton>Empezar gratis</Boton>
            </Link>
            <a
              href={WHATSAPP_CONTACTO}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center gap-2.5 rounded-lg bg-white px-5 text-[15px] font-semibold text-primario hover:bg-[#EEF0F6]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2z" />
              </svg>
              Escríbenos por WhatsApp
            </a>
          </div>
          <div className="text-sm text-white/60">Te contestamos en el día. De persona a persona.</div>
        </div>
      </section>
    </RevelarAlEntrar>
  );
}

function PieDePagina() {
  return (
    <footer className="bg-texto px-5 pt-12 pb-8">
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 sm:grid-cols-4">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-heading text-xl font-bold text-white">Prezu</span>
          </div>
          <div className="max-w-[26ch] text-sm leading-relaxed text-white/60">
            Presupuestos y facturas por voz para autónomos de oficios.
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="text-xs font-semibold tracking-wider text-white/45">PRODUCTO</div>
          <a href="#como-funciona" className="text-sm text-white/75 hover:text-acento">
            Cómo funciona
          </a>
          <a href="#precios" className="text-sm text-white/75 hover:text-acento">
            Precios
          </a>
          <a href="#preguntas" className="text-sm text-white/75 hover:text-acento">
            Preguntas
          </a>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="text-xs font-semibold tracking-wider text-white/45">LEGAL</div>
          <Link href="/aviso-legal" className="text-sm text-white/75 hover:text-acento">
            Aviso legal
          </Link>
          <Link href="/privacidad" className="text-sm text-white/75 hover:text-acento">
            Privacidad
          </Link>
          <Link href="/cookies" className="text-sm text-white/75 hover:text-acento">
            Cookies
          </Link>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="text-xs font-semibold tracking-wider text-white/45">CONTACTO</div>
          <a
            href={WHATSAPP_CONTACTO}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/75 hover:text-acento"
          >
            WhatsApp +34 611 43 47 36
          </a>
          <a href="mailto:javierrumo2@gmail.com" className="text-sm text-white/75 hover:text-acento">
            javierrumo2@gmail.com
          </a>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-[1100px] border-t border-white/12 pt-5 text-[13px] text-white/50">
        Un producto de Molero — Villafranca de Córdoba
      </div>
    </footer>
  );
}

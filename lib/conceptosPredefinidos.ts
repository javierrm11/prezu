// Biblioteca de conceptos habituales por oficio, sin precio: cada
// negocio cobra distinto según su zona y su margen. Solo ahorran
// tener que escribir el texto del concepto desde cero.

export type ConceptoPredefinido = {
  concepto: string;
  unidad: string;
};

export type CategoriaConceptos = {
  categoria: string;
  conceptos: ConceptoPredefinido[];
};

export const CONCEPTOS_PREDEFINIDOS: CategoriaConceptos[] = [
  {
    categoria: "Fontanería",
    conceptos: [
      { concepto: "Instalación de grifo", unidad: "ud" },
      { concepto: "Sustitución de válvula de corte", unidad: "ud" },
      { concepto: "Metro de tubería de cobre", unidad: "m" },
      { concepto: "Metro de tubería de PVC", unidad: "m" },
      { concepto: "Instalación de inodoro", unidad: "ud" },
      { concepto: "Instalación de lavabo", unidad: "ud" },
      { concepto: "Desatasco de tubería", unidad: "ud" },
      { concepto: "Instalación de termo eléctrico", unidad: "ud" },
      { concepto: "Instalación de calentador de gas", unidad: "ud" },
      { concepto: "Reparación de fuga de agua", unidad: "ud" },
      { concepto: "Metro de canalón", unidad: "m" },
      { concepto: "Revisión de instalación de fontanería", unidad: "ud" },
    ],
  },
  {
    categoria: "Electricidad",
    conceptos: [
      { concepto: "Instalación de punto de luz", unidad: "ud" },
      { concepto: "Instalación de enchufe", unidad: "ud" },
      { concepto: "Metro de cableado eléctrico", unidad: "m" },
      { concepto: "Sustitución de cuadro eléctrico", unidad: "ud" },
      { concepto: "Instalación de automático/diferencial", unidad: "ud" },
      { concepto: "Instalación de termostato", unidad: "ud" },
      { concepto: "Revisión de instalación eléctrica", unidad: "ud" },
      { concepto: "Instalación de placa solar", unidad: "ud" },
      { concepto: "Instalación de portero automático", unidad: "ud" },
      { concepto: "Certificado de instalación eléctrica", unidad: "ud" },
    ],
  },
  {
    categoria: "Reformas",
    conceptos: [
      { concepto: "Alicatado", unidad: "m2" },
      { concepto: "Pintura de pared", unidad: "m2" },
      { concepto: "Instalación de pladur", unidad: "m2" },
      { concepto: "Instalación de puerta", unidad: "ud" },
      { concepto: "Instalación de ventana", unidad: "ud" },
      { concepto: "Demolición de tabique", unidad: "m2" },
      { concepto: "Suelo laminado", unidad: "m2" },
      { concepto: "Suelo cerámico", unidad: "m2" },
      { concepto: "Reforma de baño completo", unidad: "pa" },
      { concepto: "Reforma de cocina completa", unidad: "pa" },
    ],
  },
  {
    categoria: "Taller",
    conceptos: [
      { concepto: "Cambio de aceite y filtro", unidad: "ud" },
      { concepto: "Cambio de pastillas de freno", unidad: "ud" },
      { concepto: "Revisión de neumáticos", unidad: "ud" },
      { concepto: "Diagnosis electrónica", unidad: "ud" },
      { concepto: "Cambio de batería", unidad: "ud" },
      { concepto: "Cambio de correa de distribución", unidad: "ud" },
      { concepto: "Alineación y equilibrado", unidad: "ud" },
      { concepto: "Revisión pre-ITV", unidad: "ud" },
      { concepto: "Cambio de amortiguadores", unidad: "ud" },
    ],
  },
  {
    categoria: "General",
    conceptos: [
      { concepto: "Hora de mano de obra", unidad: "h" },
      { concepto: "Desplazamiento", unidad: "ud" },
      { concepto: "Materiales", unidad: "pa" },
    ],
  },
];

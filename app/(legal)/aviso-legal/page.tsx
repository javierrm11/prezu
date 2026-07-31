import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso legal",
  alternates: { canonical: "/aviso-legal" },
};

// Datos sintéticos de ejemplo — sustituir por los datos fiscales
// reales del titular antes de publicar en producción.
const TITULAR = {
  nombre: "Javier Molero García",
  nif: "12345678Z",
  domicilio: "Calle Ejemplo, 12, 14420 Villafranca de Córdoba (Córdoba), España",
  email: "javierrumo2@gmail.com",
  telefono: "+34 611 43 47 36",
};

export default function AvisoLegalPage() {
  return (
    <article className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primario">Aviso legal</h1>
        <p className="mt-2 text-sm text-texto-secundario">Última actualización: 27/07/2026</p>
      </div>

      <Seccion titulo="1. Datos del titular">
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
          Sociedad de la Información y de Comercio Electrónico (LSSICE), se informa de los
          siguientes datos:
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          <li>
            <strong className="text-texto">Titular:</strong> {TITULAR.nombre}
          </li>
          <li>
            <strong className="text-texto">NIF:</strong> {TITULAR.nif}
          </li>
          <li>
            <strong className="text-texto">Domicilio:</strong> {TITULAR.domicilio}
          </li>
          <li>
            <strong className="text-texto">Email:</strong> {TITULAR.email}
          </li>
          <li>
            <strong className="text-texto">Teléfono:</strong> {TITULAR.telefono}
          </li>
          <li>
            <strong className="text-texto">Nombre comercial:</strong> Prezu
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="2. Objeto">
        <p>
          Prezu es una aplicación web que permite a autónomos de oficios crear presupuestos y
          facturas, dictados por voz o introducidos manualmente, y enviarlos a sus clientes. El
          acceso y uso de Prezu atribuye la condición de usuario y supone la aceptación de las
          condiciones incluidas en este Aviso Legal.
        </p>
      </Seccion>

      <Seccion titulo="3. Condiciones de uso">
        <p>
          El usuario se compromete a hacer un uso adecuado y lícito de Prezu, así como a no
          emplearla para incurrir en actividades ilícitas o contrarias a la buena fe, a los
          derechos de terceros, o que de cualquier forma puedan dañar, inutilizar, sobrecargar o
          deteriorar la aplicación o impedir su normal utilización.
        </p>
        <p>
          El acceso a las funciones autenticadas de Prezu requiere el registro de una cuenta y el
          pago de la suscripción vigente en cada momento, conforme a las condiciones publicadas en
          la propia aplicación.
        </p>
      </Seccion>

      <Seccion titulo="4. Propiedad intelectual e industrial">
        <p>
          El diseño, el código fuente y los contenidos propios de Prezu (marca, logotipo, textos e
          interfaz) son titularidad de {TITULAR.nombre} y están protegidos por la normativa de
          propiedad intelectual e industrial. Queda prohibida su reproducción, distribución o
          transformación sin autorización expresa.
        </p>
        <p>
          Los datos que el usuario introduce en Prezu (clientes, presupuestos, facturas, catálogo
          de precios) son en todo momento propiedad del usuario. Ver la{" "}
          <a href="/privacidad" className="font-medium text-secundario hover:underline">
            política de privacidad
          </a>{" "}
          para más detalle sobre su tratamiento.
        </p>
      </Seccion>

      <Seccion titulo="5. Responsabilidad">
        <p>
          Prezu convierte el trabajo dictado en partidas de presupuesto mediante inteligencia
          artificial, pero nunca guarda ni envía nada sin que el usuario lo revise y confirme
          expresamente. La responsabilidad sobre el contenido final de cada presupuesto o factura
          emitida corresponde al usuario que lo confirma.
        </p>
        <p>
          El titular no garantiza la disponibilidad continuada de Prezu ni se hace responsable de
          los daños derivados de interrupciones del servicio ajenas a su control razonable.
        </p>
      </Seccion>

      <Seccion titulo="6. Legislación aplicable">
        <p>
          Este Aviso Legal se rige por la legislación española. Para cualquier controversia
          derivada del uso de Prezu, las partes se someten a los Juzgados y Tribunales que
          correspondan según la normativa de protección de consumidores y usuarios aplicable.
        </p>
      </Seccion>
    </article>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="font-heading text-xl font-bold text-primario">{titulo}</h2>
      <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed text-texto-secundario">
        {children}
      </div>
    </section>
  );
}

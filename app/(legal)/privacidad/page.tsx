import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  alternates: { canonical: "/privacidad" },
};

// Datos sintéticos de ejemplo — sustituir por los datos fiscales
// reales del titular antes de publicar en producción.
const TITULAR = {
  nombre: "Javier Molero García",
  nif: "12345678Z",
  domicilio: "Calle Ejemplo, 12, 14420 Villafranca de Córdoba (Córdoba), España",
  email: "javierrumo2@gmail.com",
};

export default function PrivacidadPage() {
  return (
    <article className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primario">Política de privacidad</h1>
        <p className="mt-2 text-sm text-texto-secundario">Última actualización: 27/07/2026</p>
      </div>

      <Seccion titulo="1. Responsable del tratamiento">
        <ul className="flex flex-col gap-1">
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
        </ul>
      </Seccion>

      <Seccion titulo="2. Qué datos tratamos">
        <p>Según cómo uses Prezu, tratamos estos datos:</p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>
            <strong className="text-texto">Datos de tu cuenta:</strong> email y contraseña
            (gestionada de forma cifrada por nuestro proveedor de autenticación).
          </li>
          <li>
            <strong className="text-texto">Datos de tu negocio:</strong> nombre, NIF, dirección,
            teléfono, email y logotipo que introduces en Ajustes.
          </li>
          <li>
            <strong className="text-texto">Datos de tus clientes:</strong> nombre, NIF, dirección
            y teléfono que tú introduces para emitir presupuestos y facturas.
          </li>
          <li>
            <strong className="text-texto">Datos de los presupuestos y facturas:</strong> partidas,
            importes, estados y fechas.
          </li>
          <li>
            <strong className="text-texto">Datos de pago:</strong> gestionados directamente por
            Stripe; Prezu no almacena los datos de tu tarjeta.
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="3. Finalidad y base legal">
        <p>
          Tratamos estos datos para prestarte el servicio de Prezu (crear y enviar presupuestos y
          facturas, gestionar tu cuenta y tu suscripción), sobre la base legal de la ejecución del
          contrato de uso de la aplicación que aceptas al registrarte.
        </p>
        <p>
          Los datos de facturación se conservan además por obligación legal (normativa fiscal y
          mercantil), durante el plazo que dicha normativa exige.
        </p>
      </Seccion>

      <Seccion titulo="4. Con quién compartimos los datos">
        <p>
          No vendemos ni cedemos tus datos a terceros con fines comerciales. Para poder prestar el
          servicio, trabajamos con los siguientes encargados de tratamiento, cada uno sujeto a su
          propia política de privacidad y a las garantías del RGPD:
        </p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>
            <strong className="text-texto">Supabase</strong> — base de datos, autenticación y
            almacenamiento de archivos (logotipos).
          </li>
          <li>
            <strong className="text-texto">Vercel</strong> — alojamiento de la aplicación.
          </li>
          <li>
            <strong className="text-texto">Stripe</strong> — procesamiento de los pagos de la
            suscripción.
          </li>
          <li>
            <strong className="text-texto">Google (Gemini API)</strong> — transcripción e
            interpretación del dictado por voz al crear un presupuesto.
          </li>
        </ul>
        <p>
          El cliente final que recibe un presupuesto o factura solo puede ver los datos de ese
          documento concreto, a través de un enlace privado no indexable ni adivinable — nunca
          accede al resto de tu información.
        </p>
      </Seccion>

      <Seccion titulo="5. Cuánto tiempo conservamos los datos">
        <p>
          Mientras mantengas tu cuenta activa. Si la cancelas, conservamos los datos de
          facturación el tiempo que exige la normativa fiscal y mercantil, y eliminamos el resto en
          un plazo razonable tras la baja, salvo que exista otra obligación legal que exija
          conservarlos más tiempo.
        </p>
      </Seccion>

      <Seccion titulo="6. Tus derechos">
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación
          del tratamiento y portabilidad escribiendo a{" "}
          <a href={`mailto:${TITULAR.email}`} className="font-medium text-secundario hover:underline">
            {TITULAR.email}
          </a>
          . También tienes derecho a presentar una reclamación ante la Agencia Española de
          Protección de Datos (
          <a
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-secundario hover:underline"
          >
            aepd.es
          </a>
          ) si consideras que el tratamiento no se ajusta a la normativa.
        </p>
      </Seccion>

      <Seccion titulo="7. Seguridad">
        <p>
          El acceso a tus datos y a los de tus clientes está protegido por autenticación y por
          reglas de seguridad a nivel de base de datos que garantizan que cada negocio solo puede
          ver su propia información. Las comunicaciones con Prezu viajan cifradas (HTTPS).
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

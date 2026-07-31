import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de cookies",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <article className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primario">Política de cookies</h1>
        <p className="mt-2 text-sm text-texto-secundario">Última actualización: 27/07/2026</p>
      </div>

      <Seccion titulo="1. Qué son las cookies">
        <p>
          Una cookie es un pequeño archivo que se guarda en tu navegador al visitar una web. Sirve
          para recordar información entre visitas, como si has iniciado sesión o no.
        </p>
      </Seccion>

      <Seccion titulo="2. Qué cookies usa Prezu">
        <p>
          Prezu solo utiliza <strong className="text-texto">cookies técnicas necesarias</strong>{" "}
          para el funcionamiento de la aplicación:
        </p>
        <div className="overflow-hidden rounded-xl border border-borde bg-superficie">
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-b border-borde px-4 py-2.5 text-xs font-semibold tracking-wider text-texto-secundario">
            <div>COOKIE</div>
            <div>FINALIDAD</div>
            <div>DURACIÓN</div>
          </div>
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-4 py-3 text-[13px]">
            <div className="font-medium text-texto">Cookies de sesión (Supabase Auth)</div>
            <div className="text-texto-secundario">Mantener tu sesión iniciada</div>
            <div className="text-texto-secundario">Hasta cerrar sesión o caducar</div>
          </div>
        </div>
        <p>
          Estas cookies son estrictamente necesarias para que puedas acceder a tu cuenta, y por eso
          no requieren tu consentimiento previo según la normativa vigente (Ley 34/2002, LSSICE,
          artículo 22.2).
        </p>
      </Seccion>

      <Seccion titulo="3. Lo que Prezu NO usa">
        <p>
          Prezu no utiliza cookies de analítica, publicidad ni redes sociales. No hay seguimiento
          de tu actividad con fines estadísticos ni comerciales, ni se comparten datos de
          navegación con terceros ajenos al funcionamiento del servicio.
        </p>
      </Seccion>

      <Seccion titulo="4. Cómo desactivar las cookies">
        <p>
          Puedes eliminar o bloquear las cookies desde la configuración de tu navegador. Ten en
          cuenta que, al ser cookies técnicas necesarias, si las bloqueas no podrás iniciar sesión
          ni usar las funciones de Prezu que requieren estar autenticado.
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

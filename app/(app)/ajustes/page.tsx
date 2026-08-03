import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { crearUrlFirmadaLogo } from "@/lib/supabase/storage";
import { contarDocumentosDelMes } from "@/lib/limitesPlan";
import type { IdPlantillaPDF } from "@/lib/pdf/plantillas";
import { FormularioAjustes, type EmpresaAjustes } from "./_componentes/formulario-ajustes";
import { SeccionSuscripcion } from "./_componentes/seccion-suscripcion";
import { SeccionPlantillaPDF } from "./_componentes/seccion-plantilla-pdf";
import { BotonCerrarSesion } from "./_componentes/boton-cerrar-sesion";

export default async function AjustesPage() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?volver=${encodeURIComponent("/ajustes")}`);
  }

  const empresaId = await obtenerEmpresaId(supabase);

  if (!empresaId) {
    return (
      <p className="text-sm text-texto-secundario">
        No se ha encontrado tu negocio.
      </p>
    );
  }

  const [{ data: empresa }, documentosUsadosEsteMes] = await Promise.all([
    supabase
      .from("empresas")
      .select(
        "id, nombre, nif, direccion, telefono, email, iban, iva_defecto, condiciones_defecto, logo_url, serie_presupuesto, serie_factura, serie_rectificativa, plan, estado_suscripcion, suscripcion_periodo_fin, suscripcion_cancela_al_final, pdf_plantilla",
      )
      .eq("id", empresaId)
      .single(),
    contarDocumentosDelMes(supabase, empresaId),
  ]);

  if (!empresa) {
    return (
      <p className="text-sm text-texto-secundario">
        No se ha encontrado tu negocio.
      </p>
    );
  }

  const anioActual = new Date().getFullYear();

  // Estas dos sí dependen de datos de empresa (logo_url, serie_factura),
  // así que van después de tenerla, pero entre sí son independientes.
  const [urlLogoInicial, { data: serieActual }] = await Promise.all([
    crearUrlFirmadaLogo(supabase, empresa.logo_url),
    supabase
      .from("series")
      .select("ultimo_numero")
      .eq("empresa_id", empresaId)
      .eq("tipo", "factura")
      .eq("codigo", empresa.serie_factura)
      .eq("anio", anioActual)
      .maybeSingle(),
  ]);

  const proximoNumeroFacturaInicial = (serieActual?.ultimo_numero ?? 0) + 1;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 font-heading text-2xl font-bold text-primario">Ajustes</h1>

      <div className="flex flex-col gap-5">
        <FormularioAjustes
          empresa={empresa as EmpresaAjustes}
          urlLogoInicial={urlLogoInicial}
          proximoNumeroFacturaInicial={proximoNumeroFacturaInicial}
        />

        <SeccionSuscripcion
          plan={empresa.plan}
          documentosUsadosEsteMes={documentosUsadosEsteMes}
          estado={empresa.estado_suscripcion}
          periodoFin={empresa.suscripcion_periodo_fin}
          cancelaAlFinal={empresa.suscripcion_cancela_al_final}
        />

        <SeccionPlantillaPDF
          empresaId={empresaId}
          plantillaActual={empresa.pdf_plantilla as IdPlantillaPDF | null}
        />

        <div className="flex flex-col gap-3 rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta">
          <div className="text-[15px] font-semibold text-texto">Cuenta</div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-texto-secundario">Email de acceso</span>
            <span className="text-texto">{user.email}</span>
          </div>
          <div>
            <BotonCerrarSesion />
          </div>
        </div>
      </div>
    </div>
  );
}

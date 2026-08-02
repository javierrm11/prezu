import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearUrlFirmadaLogo } from "@/lib/supabase/storage";
import { formatearEuros, formatearFecha, formatearNumeroDocumento } from "@/lib/formato";
import { construirEnlaceWhatsApp } from "@/lib/whatsapp";
import { Logo } from "@/components/ui/Logo";
import { Boton } from "@/components/ui/Boton";
import { LogoNegocio } from "@/components/ui/LogoNegocio";
import { PanelAceptar } from "./_componentes/panel-aceptar";

// Página pública: no debe aparecer en buscadores (regla 5, datos
// del negocio y del cliente detrás de un token no adivinable).
export const metadata = {
  robots: { index: false, follow: false },
};

const ESTADOS_RESUELTOS = ["aceptado", "rechazado", "facturado", "caducado"];

type FilaPublica = {
  id: string;
  empresa_id: string;
  numero: number | null;
  anio: number | null;
  estado: string;
  fecha_emision: string | null;
  valido_hasta: string | null;
  base_imponible: number;
  total_iva: number;
  total: number;
  visto_at: string | null;
  aceptado_at: string | null;
  aceptado_por: string | null;
  condiciones: string | null;
  clientes: { nombre: string } | null;
  cliente_nombre: string | null;
  empresas: {
    nombre: string;
    nif: string | null;
    direccion: string | null;
    telefono: string | null;
    email: string | null;
    condiciones_defecto: string | null;
    logo_url: string | null;
    serie_presupuesto: string;
  } | null;
};

export default async function PaginaPublicaPresupuesto({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = crearClienteAdmin();

  // Único punto de acceso: el token_publico (uuid no adivinable).
  // No revela nada más allá de este presupuesto concreto.
  const { data } = await admin
    .from("presupuestos")
    .select(
      "id, empresa_id, numero, anio, estado, fecha_emision, valido_hasta, base_imponible, total_iva, total, visto_at, aceptado_at, aceptado_por, condiciones, clientes(nombre), cliente_nombre, empresas(nombre, nif, direccion, telefono, email, condiciones_defecto, logo_url, serie_presupuesto)",
    )
    .eq("token_publico", token)
    .maybeSingle();

  const presupuesto = data as unknown as FilaPublica | null;

  if (!presupuesto) {
    notFound();
  }

  if (!presupuesto.visto_at) {
    const nuevoEstado = presupuesto.estado === "enviado" ? "visto" : presupuesto.estado;

    await admin
      .from("presupuestos")
      .update({ visto_at: new Date().toISOString(), estado: nuevoEstado })
      .eq("id", presupuesto.id);

    await admin.from("eventos").insert({
      empresa_id: presupuesto.empresa_id,
      entidad: "presupuesto",
      entidad_id: presupuesto.id,
      tipo: "visto",
    });
  }

  const { data: lineas } = await admin
    .from("presupuesto_lineas")
    .select("concepto, cantidad, unidad, precio_unitario, importe")
    .eq("presupuesto_id", presupuesto.id)
    .order("orden");

  const etiquetaNumero = formatearNumeroDocumento(
    presupuesto.empresas?.serie_presupuesto ?? "P",
    presupuesto.numero,
    presupuesto.anio,
  );
  const negocio = presupuesto.empresas?.nombre ?? "tu proveedor";
  const urlLogo = await crearUrlFirmadaLogo(admin, presupuesto.empresas?.logo_url ?? null);
  const yaAceptado = presupuesto.estado === "aceptado";
  const yaResuelto = ESTADOS_RESUELTOS.includes(presupuesto.estado);
  const condiciones = presupuesto.condiciones ?? presupuesto.empresas?.condiciones_defecto;

  const enlaceProponerCambios = presupuesto.empresas?.telefono
    ? construirEnlaceWhatsApp(
        presupuesto.empresas.telefono,
        `Hola, sobre el presupuesto ${etiquetaNumero} tengo algunos cambios que proponer.`,
      )
    : null;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[560px] flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-borde bg-superficie p-4">
        <LogoNegocio nombre={negocio} urlLogo={urlLogo} size={44} />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold text-texto">{negocio}</div>
          {presupuesto.empresas?.telefono && (
            <div className="text-xs text-texto-secundario">{presupuesto.empresas.telefono}</div>
          )}
        </div>
      </div>

      {yaAceptado ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E7F6EC]">
            <Check size={40} strokeWidth={3} className="text-exito" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-primario">
            ¡Presupuesto aceptado!
          </h1>
          <p className="max-w-xs text-[15px] leading-relaxed text-texto-secundario">
            {negocio} recibirá la confirmación al momento y se pondrá en contacto contigo.
          </p>
          {presupuesto.aceptado_por && presupuesto.aceptado_at && (
            <p className="text-xs text-[#8A8FA3]">
              Aceptado por {presupuesto.aceptado_por} el{" "}
              {formatearFecha(presupuesto.aceptado_at)}
            </p>
          )}
          <PiePrezu />
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3.5 p-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-primario">
              Presupuesto {etiquetaNumero}
            </h1>
            <div className="mt-0.5 text-[13px] text-texto-secundario">
              {presupuesto.clientes?.nombre ?? presupuesto.cliente_nombre}
              {presupuesto.fecha_emision &&
                ` · Emitido el ${formatearFecha(presupuesto.fecha_emision)}`}
              {presupuesto.valido_hasta &&
                ` · Válido hasta el ${formatearFecha(presupuesto.valido_hasta)}`}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-tarjeta">
            {(lineas ?? []).map((linea, indice) => (
              <div
                key={indice}
                className="flex items-center gap-3 border-b border-[#EEF0F6] px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-texto">{linea.concepto}</div>
                  <div className="tabular-nums text-xs text-[#8A8FA3]">
                    {linea.cantidad} {linea.unidad} ×{" "}
                    {formatearEuros(Number(linea.precio_unitario))}
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums text-texto">
                  {formatearEuros(Number(linea.importe))}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-1.5 bg-fondo p-4">
              <div className="flex justify-between text-[13px] text-texto-secundario">
                <span>Base imponible</span>
                <span className="tabular-nums text-texto">
                  {formatearEuros(Number(presupuesto.base_imponible))}
                </span>
              </div>
              <div className="flex justify-between text-[13px] text-texto-secundario">
                <span>IVA</span>
                <span className="tabular-nums text-texto">
                  {formatearEuros(Number(presupuesto.total_iva))}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-borde pt-2">
                <span className="text-sm font-semibold text-texto">Total</span>
                <span className="font-heading text-2xl font-bold tabular-nums text-primario">
                  {formatearEuros(Number(presupuesto.total))}
                </span>
              </div>
            </div>
          </div>

          {condiciones && (
            <div className="rounded-xl border border-borde bg-superficie p-4 text-xs leading-relaxed text-texto-secundario">
              <div className="mb-1 text-[13px] font-semibold text-texto">Condiciones</div>
              {condiciones}
            </div>
          )}

          <div className="flex-1" />

          <PiePrezu />
        </div>
      )}

      {!yaAceptado && (
        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-borde bg-superficie p-4">
          {yaResuelto ? (
            <p className="text-center text-sm text-texto-secundario">
              Este presupuesto ya no admite respuesta ({presupuesto.estado}).
            </p>
          ) : (
            <>
              <PanelAceptar token={token} />
              {enlaceProponerCambios && (
                <a href={enlaceProponerCambios} target="_blank" rel="noopener noreferrer">
                  <Boton variante="secundario" className="h-12 w-full">
                    Proponer cambios
                  </Boton>
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PiePrezu() {
  return (
    <div className="flex items-center justify-center gap-1.5 pb-2 text-xs text-[#8A8FA3]">
      Hecho con
      <Logo size={14} />
      <span className="font-semibold text-texto-secundario">Prezu</span>
    </div>
  );
}

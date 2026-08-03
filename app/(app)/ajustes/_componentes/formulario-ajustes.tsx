"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/browser";
import { useExigirSesion } from "@/lib/hooks/useExigirSesion";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Textarea } from "@/components/ui/Textarea";
import { LogoNegocio } from "@/components/ui/LogoNegocio";

const OPCIONES_IVA = [21, 10, 0];
const TIPOS_IMAGEN_PERMITIDOS = ["image/png", "image/jpeg"];
const TAMANO_MAXIMO_LOGO = 2 * 1024 * 1024;

export type EmpresaAjustes = {
  id: string;
  nombre: string;
  nif: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  iban: string | null;
  iva_defecto: number;
  condiciones_defecto: string | null;
  serie_presupuesto: string;
  serie_factura: string;
  serie_rectificativa: string;
};

type FormularioAjustesProps = {
  empresa: EmpresaAjustes;
  urlLogoInicial: string | null;
  proximoNumeroFacturaInicial: number;
};

export function FormularioAjustes({
  empresa,
  urlLogoInicial,
  proximoNumeroFacturaInicial,
}: FormularioAjustesProps) {
  const router = useRouter();
  const exigirSesion = useExigirSesion();
  const inputLogoRef = useRef<HTMLInputElement>(null);
  const [nombre, setNombre] = useState(empresa.nombre);
  const [nif, setNif] = useState(empresa.nif);
  const [direccion, setDireccion] = useState(empresa.direccion ?? "");
  const [telefono, setTelefono] = useState(empresa.telefono ?? "");
  const [email, setEmail] = useState(empresa.email ?? "");
  const [iban, setIban] = useState(empresa.iban ?? "");
  const [ivaDefecto, setIvaDefecto] = useState(empresa.iva_defecto);
  const [condiciones, setCondiciones] = useState(empresa.condiciones_defecto ?? "");
  const [seriePresupuesto, setSeriePresupuesto] = useState(empresa.serie_presupuesto);
  const [serieFactura, setSerieFactura] = useState(empresa.serie_factura);
  const [serieRectificativa, setSerieRectificativa] = useState(empresa.serie_rectificativa);
  const [proximoNumeroFactura, setProximoNumeroFactura] = useState(proximoNumeroFacturaInicial);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [logoLocal, setLogoLocal] = useState<string | null>(null);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [errorLogo, setErrorLogo] = useState<string | null>(null);

  async function subirLogo(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;

    if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
      setErrorLogo("Solo se admiten imágenes PNG o JPG");
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_LOGO) {
      setErrorLogo("La imagen no puede superar 2 MB");
      return;
    }

    setErrorLogo(null);

    if (!(await exigirSesion())) return;

    setSubiendoLogo(true);
    setLogoLocal(URL.createObjectURL(archivo));

    const supabase = crearClienteNavegador();
    const ruta = `${empresa.id}/logo`;

    const { error: errorSubida } = await supabase.storage
      .from("logos")
      .upload(ruta, archivo, { upsert: true, contentType: archivo.type });

    if (errorSubida) {
      setErrorLogo("No se ha podido subir el logo");
      setSubiendoLogo(false);
      return;
    }

    const { error: errorGuardado } = await supabase
      .from("empresas")
      .update({ logo_url: ruta })
      .eq("id", empresa.id);

    setSubiendoLogo(false);

    if (errorGuardado) {
      setErrorLogo("El logo se subió pero no se pudo guardar la referencia");
      return;
    }

    router.refresh();
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setMensaje(null);

    if (!(await exigirSesion())) return;

    setGuardando(true);

    const seriePresupuestoLimpia = seriePresupuesto.trim().toUpperCase();
    const serieFacturaLimpia = serieFactura.trim().toUpperCase();
    const serieRectificativaLimpia = serieRectificativa.trim().toUpperCase();

    if (!seriePresupuestoLimpia || !serieFacturaLimpia || !serieRectificativaLimpia) {
      setError("Las series de presupuestos, facturas y rectificativas no pueden estar vacías");
      setGuardando(false);
      return;
    }

    if (!Number.isInteger(proximoNumeroFactura) || proximoNumeroFactura < 1) {
      setError("El próximo número de factura debe ser un entero de al menos 1");
      setGuardando(false);
      return;
    }

    const supabase = crearClienteNavegador();
    const anioActual = new Date().getFullYear();

    // No dejar fijar un número que ya colisionaría con una factura
    // emitida este año con esa misma serie (regla de negocio 2:
    // numeración correlativa).
    const { data: ultimaFacturaDB } = await supabase
      .from("facturas")
      .select("numero")
      .eq("empresa_id", empresa.id)
      .eq("serie", serieFacturaLimpia)
      .eq("anio", anioActual)
      .order("numero", { ascending: false })
      .limit(1)
      .maybeSingle();

    const minimoPermitido = (ultimaFacturaDB?.numero ?? 0) + 1;

    if (proximoNumeroFactura < minimoPermitido) {
      setError(
        `Ya hay una factura ${serieFacturaLimpia}-${anioActual}-${String(minimoPermitido - 1).padStart(3, "0")}. El próximo número no puede ser menor que ${minimoPermitido}`,
      );
      setGuardando(false);
      return;
    }

    const { error: errorGuardado } = await supabase
      .from("empresas")
      .update({
        nombre,
        nif,
        direccion: direccion || null,
        telefono: telefono || null,
        email: email || null,
        iban: iban.trim().toUpperCase() || null,
        iva_defecto: ivaDefecto,
        condiciones_defecto: condiciones || null,
        serie_presupuesto: seriePresupuestoLimpia,
        serie_factura: serieFacturaLimpia,
        serie_rectificativa: serieRectificativaLimpia,
      })
      .eq("id", empresa.id);

    if (errorGuardado) {
      setError("No se han podido guardar los cambios");
      setGuardando(false);
      return;
    }

    const { error: errorSerie } = await supabase.from("series").upsert(
      {
        empresa_id: empresa.id,
        tipo: "factura",
        codigo: serieFacturaLimpia,
        anio: anioActual,
        ultimo_numero: proximoNumeroFactura - 1,
      },
      { onConflict: "empresa_id,tipo,codigo,anio" },
    );

    setGuardando(false);

    if (errorSerie) {
      setError("Los datos se guardaron pero no se pudo fijar el próximo número de factura");
      return;
    }

    setSeriePresupuesto(seriePresupuestoLimpia);
    setSerieFactura(serieFacturaLimpia);
    setSerieRectificativa(serieRectificativaLimpia);
    setMensaje("Cambios guardados");
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <div className="flex flex-col gap-3.5 rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta">
        <div className="text-[15px] font-semibold text-texto">Datos del negocio</div>

        <div className="flex items-center gap-3.5">
          <LogoNegocio nombre={nombre || "?"} urlLogo={logoLocal ?? urlLogoInicial} size={64} />
          <div>
            <input
              ref={inputLogoRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={subirLogo}
              className="hidden"
            />
            <Boton
              type="button"
              variante="secundario"
              onClick={() => inputLogoRef.current?.click()}
              disabled={subiendoLogo}
            >
              {subiendoLogo ? "Subiendo…" : "Subir logo"}
            </Boton>
            <p className="mt-1.5 text-xs text-texto-secundario">
              PNG o JPG, máx. 2 MB. Aparecerá en tus PDF.
            </p>
            {errorLogo && <p className="mt-1 text-xs text-peligro">{errorLogo}</p>}
          </div>
        </div>

        <Campo
          id="nombre"
          label="Nombre del negocio"
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Campo
            id="nif"
            label="NIF"
            value={nif}
            onChange={(evento) => setNif(evento.target.value)}
            required
          />
          <Campo
            id="telefono"
            label="Teléfono"
            value={telefono}
            onChange={(evento) => setTelefono(evento.target.value)}
          />
        </div>
        <Campo
          id="direccion"
          label="Dirección"
          value={direccion}
          onChange={(evento) => setDireccion(evento.target.value)}
        />
        <Campo
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3.5 rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta">
        <div className="text-[15px] font-semibold text-texto">Facturación</div>

        <div>
          <div className="mb-1.5 text-sm font-medium text-texto">IVA por defecto</div>
          <div className="flex gap-2.5">
            {OPCIONES_IVA.map((opcion) => (
              <button
                key={opcion}
                type="button"
                onClick={() => setIvaDefecto(opcion)}
                className={`h-10 flex-1 rounded-lg border text-sm font-medium transition-colors ${
                  ivaDefecto === opcion
                    ? "border-secundario bg-secundario text-white"
                    : "border-borde bg-superficie text-texto hover:bg-fondo"
                }`}
              >
                {opcion} %
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-texto-secundario">
            El 10 % aplica a obras en vivienda cuando corresponde.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Campo
            id="serie-presupuesto"
            label="Serie de presupuestos"
            value={seriePresupuesto}
            onChange={(evento) => setSeriePresupuesto(evento.target.value)}
            maxLength={4}
            required
          />
          <Campo
            id="serie-factura"
            label="Serie de facturas"
            value={serieFactura}
            onChange={(evento) => setSerieFactura(evento.target.value)}
            maxLength={4}
            required
          />
        </div>
        <p className="-mt-2.5 text-xs text-texto-secundario">
          Ejemplo con &quot;{serieFactura.trim().toUpperCase() || "F"}&quot;: {serieFactura.trim().toUpperCase() || "F"}-{new Date().getFullYear()}-001
        </p>

        <Campo
          id="serie-rectificativa"
          label="Serie de rectificativas"
          value={serieRectificativa}
          onChange={(evento) => setSerieRectificativa(evento.target.value)}
          maxLength={4}
          required
        />
        <p className="-mt-2.5 text-xs text-texto-secundario">
          Para corregir una factura ya emitida. Ejemplo: {serieRectificativa.trim().toUpperCase() || "R"}-{new Date().getFullYear()}-001
        </p>

        <Campo
          id="proximo-numero-factura"
          label="Próximo número de factura"
          type="number"
          min={1}
          step={1}
          value={proximoNumeroFactura}
          onChange={(evento) => setProximoNumeroFactura(Number(evento.target.value))}
          required
        />
        <p className="-mt-2.5 text-xs text-texto-secundario">
          Súbelo si ya has emitido facturas fuera de Prezu este año: la próxima que emitas
          desde aquí llevará este número.
        </p>

        <Campo
          id="iban"
          label="IBAN para transferencias"
          value={iban}
          onChange={(evento) => setIban(evento.target.value)}
          placeholder="ES00 0000 0000 0000 0000 0000"
        />
        <p className="-mt-2.5 text-xs text-texto-secundario">
          Si lo rellenas, saldrá impreso en tus facturas.
        </p>

        <Textarea
          id="condiciones"
          label="Condiciones por defecto"
          value={condiciones}
          onChange={(evento) => setCondiciones(evento.target.value)}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        {error && <p className="text-sm text-peligro">{error}</p>}
        {mensaje && <p className="text-sm text-exito">{mensaje}</p>}
        <Boton type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </Boton>
      </div>
    </form>
  );
}

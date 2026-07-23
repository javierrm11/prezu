import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { ListaCatalogo, type ItemCatalogo } from "./_componentes/lista-catalogo";

export default async function CatalogoPage() {
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  if (!empresaId) {
    return (
      <p className="text-sm text-texto-secundario">
        No se ha encontrado tu negocio.
      </p>
    );
  }

  const { data: catalogoDB } = await supabase
    .from("catalogo")
    .select("id, concepto, unidad, precio_unitario, tipo_iva, veces_usado")
    .eq("empresa_id", empresaId)
    .order("concepto");

  const { data: empresa } = await supabase
    .from("empresas")
    .select("iva_defecto")
    .eq("id", empresaId)
    .single();

  const items: ItemCatalogo[] = (catalogoDB ?? []).map((item) => ({
    id: item.id,
    concepto: item.concepto,
    unidad: item.unidad,
    precioUnitario: Number(item.precio_unitario),
    tipoIva: Number(item.tipo_iva),
    vecesUsado: item.veces_usado,
  }));

  return (
    <ListaCatalogo
      empresaId={empresaId}
      ivaDefecto={Number(empresa?.iva_defecto ?? 21)}
      items={items}
    />
  );
}

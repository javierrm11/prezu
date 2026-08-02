import { Suspense } from "react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerEmpresaId } from "@/lib/supabase/empresa";
import { EsqueletoLista } from "@/components/ui/EsqueletoLista";
import { ListaCatalogo, type ItemCatalogo } from "./_componentes/lista-catalogo";

export default function CatalogoPage() {
  return (
    <div>
      <h1 className="mb-3 font-heading text-2xl font-bold text-primario">
        Catálogo de precios
      </h1>

      <Suspense fallback={<EsqueletoLista />}>
        <ListaCatalogoDatos />
      </Suspense>
    </div>
  );
}

async function ListaCatalogoDatos() {
  const supabase = await crearClienteServidor();
  const empresaId = await obtenerEmpresaId(supabase);

  let items: ItemCatalogo[] = [];
  let ivaDefecto = 21;

  if (empresaId) {
    const [{ data: catalogoDB }, { data: empresa }] = await Promise.all([
      supabase
        .from("catalogo")
        .select("id, concepto, unidad, precio_unitario, tipo_iva, veces_usado")
        .eq("empresa_id", empresaId)
        .order("concepto"),
      supabase.from("empresas").select("iva_defecto").eq("id", empresaId).single(),
    ]);

    items = (catalogoDB ?? []).map((item) => ({
      id: item.id,
      concepto: item.concepto,
      unidad: item.unidad,
      precioUnitario: Number(item.precio_unitario),
      tipoIva: Number(item.tipo_iva),
      vecesUsado: item.veces_usado,
    }));
    ivaDefecto = Number(empresa?.iva_defecto ?? 21);
  }

  return <ListaCatalogo empresaId={empresaId} ivaDefecto={ivaDefecto} items={items} />;
}

-- ============================================================
-- ESQUEMA BD — App de presupuestos y facturas por voz
-- Postgres / Supabase
--
-- Decisiones de diseño:
--  1. Multi-tenant desde el día 1: todo cuelga de `empresas`
--     (hoy solo la de tu padre, mañana cada cliente que vendas).
--  2. Facturas INMUTABLES: al emitir se hace snapshot de todo.
--     Los errores se corrigen con rectificativas, nunca editando.
--  3. Numeración correlativa por serie+año, asignada de forma
--     atómica al emitir (los borradores no tienen número).
--  4. Importes en numeric(12,2). Nunca float.
--  5. Campos VeriFactu (vf_*) ya en el esquema, sin uso hasta
--     que actives la API (Invopop/Verifacti). Enchufar = rellenar.
--  6. Las líneas del presupuesto se COPIAN a la factura al
--     convertir; nunca se comparten filas.
--  7. RLS por empresa para que un tenant jamás vea a otro.
-- ============================================================
 
create extension if not exists "pgcrypto";
 
-- ------------------------------------------------------------
-- EMPRESAS (tenant = cada negocio que usa la app)
-- ------------------------------------------------------------
create table empresas (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  nif             text not null,
  direccion       text,
  codigo_postal   text,
  ciudad          text,
  provincia       text,
  telefono        text,
  email           text,
  logo_url        text,
  iva_defecto     numeric(5,2) not null default 21.00,
  irpf_defecto    numeric(5,2) not null default 0.00, -- retención solo si su actividad lo exige (consultar gestor)
  condiciones_defecto text,        -- texto legal/condiciones que va al pie de los presupuestos
  created_at      timestamptz not null default now()
);
 
-- ------------------------------------------------------------
-- PERFILES (vincula usuarios de Supabase Auth con su empresa)
-- ------------------------------------------------------------
create table perfiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  empresa_id  uuid not null references empresas(id) on delete cascade,
  nombre      text,
  rol         text not null default 'admin' check (rol in ('admin','empleado')),
  created_at  timestamptz not null default now()
);
 
-- Helper para las políticas RLS: empresa del usuario logueado
create or replace function empresa_actual()
returns uuid
language sql stable security definer
as $$
  select empresa_id from perfiles where user_id = auth.uid()
$$;
 
-- ------------------------------------------------------------
-- CLIENTES (los clientes de cada empresa)
-- ------------------------------------------------------------
create table clientes (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references empresas(id) on delete cascade,
  nombre        text not null,
  nif           text,
  direccion     text,
  codigo_postal text,
  ciudad        text,
  provincia     text,
  email         text,
  telefono      text,          -- para envío por WhatsApp
  notas         text,
  created_at    timestamptz not null default now()
);
create index idx_clientes_empresa on clientes (empresa_id);
 
-- ------------------------------------------------------------
-- CATÁLOGO (la "memoria de precios": la IA tira de aquí para
-- rellenar precios habituales al dictar un presupuesto)
-- ------------------------------------------------------------
create table catalogo (
  id              uuid primary key default gen_random_uuid(),
  empresa_id      uuid not null references empresas(id) on delete cascade,
  concepto        text not null,
  descripcion     text,
  unidad          text not null default 'ud',  -- ud, h, m, m2, m3, kg, pa (partida alzada)...
  precio_unitario numeric(12,2) not null,
  tipo_iva        numeric(5,2) not null default 21.00,
  veces_usado     int not null default 0,      -- para ordenar sugerencias de la IA
  updated_at      timestamptz not null default now()
);
create index idx_catalogo_empresa on catalogo (empresa_id);
 
-- ------------------------------------------------------------
-- SERIES (contador de numeración correlativa por tipo/serie/año)
-- ------------------------------------------------------------
create table series (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references empresas(id) on delete cascade,
  tipo          text not null check (tipo in ('presupuesto','factura','rectificativa')),
  codigo        text not null default '',   -- ej. 'P', 'F', 'R'
  anio          int  not null,
  ultimo_numero int  not null default 0,
  unique (empresa_id, tipo, codigo, anio)
);
 
-- Numeración atómica: llamar SOLO en el momento de emitir
create or replace function siguiente_numero(
  p_empresa uuid, p_tipo text, p_codigo text, p_anio int
) returns int
language plpgsql
as $$
declare n int;
begin
  insert into series (empresa_id, tipo, codigo, anio, ultimo_numero)
  values (p_empresa, p_tipo, p_codigo, p_anio, 1)
  on conflict (empresa_id, tipo, codigo, anio)
  do update set ultimo_numero = series.ultimo_numero + 1
  returning ultimo_numero into n;
  return n;
end;
$$;
 
-- ------------------------------------------------------------
-- PRESUPUESTOS
-- ------------------------------------------------------------
create table presupuestos (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null references empresas(id) on delete cascade,
  cliente_id     uuid references clientes(id),
  -- numeración (null mientras es borrador)
  numero         int,
  serie          text default '',
  anio           int,
  estado         text not null default 'borrador'
                 check (estado in ('borrador','enviado','visto','aceptado','rechazado','caducado','facturado')),
  fecha_emision  date,
  valido_hasta   date,
  -- origen del presupuesto (tu diferencial)
  origen         text not null default 'formulario' check (origen in ('audio','texto','formulario')),
  audio_url      text,                 -- audio original dictado
  -- totales (calculados por la app y guardados)
  base_imponible numeric(12,2) not null default 0,
  total_iva      numeric(12,2) not null default 0,
  total_irpf     numeric(12,2) not null default 0,
  total          numeric(12,2) not null default 0,
  notas          text,
  condiciones    text,
  -- enlace público de visualización/aceptación (página sin login)
  token_publico  uuid not null unique default gen_random_uuid(),
  enviado_at     timestamptz,
  visto_at       timestamptz,
  aceptado_at    timestamptz,
  aceptado_por   text,                 -- nombre de quien acepta en la página pública
  factura_id     uuid,                 -- se rellena al convertir en factura
  pdf_url        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (empresa_id, serie, anio, numero)
);
create index idx_presupuestos_empresa on presupuestos (empresa_id, estado);
 
create table presupuesto_lineas (
  id              uuid primary key default gen_random_uuid(),
  presupuesto_id  uuid not null references presupuestos(id) on delete cascade,
  orden           int not null default 0,
  catalogo_id     uuid references catalogo(id),  -- si la IA la casó con el catálogo
  concepto        text not null,
  descripcion     text,
  cantidad        numeric(12,3) not null default 1,
  unidad          text not null default 'ud',
  precio_unitario numeric(12,2) not null,
  descuento_pct   numeric(5,2) not null default 0,
  tipo_iva        numeric(5,2) not null default 21.00,
  importe         numeric(12,2) not null   -- cantidad * precio * (1 - dto/100), sin IVA
);
create index idx_plineas_presupuesto on presupuesto_lineas (presupuesto_id);
 
-- ------------------------------------------------------------
-- FACTURAS (inmutables una vez emitidas)
-- ------------------------------------------------------------
create table facturas (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null references empresas(id) on delete cascade,
  cliente_id     uuid references clientes(id),
  presupuesto_id uuid references presupuestos(id),
  numero         int  not null,
  serie          text not null default '',
  anio           int  not null,
  tipo           text not null default 'completa'
                 check (tipo in ('completa','simplificada','rectificativa')),
  rectifica_a    uuid references facturas(id),   -- solo si tipo = rectificativa
  fecha_emision  date not null,
  -- snapshot fiscal del cliente (queda congelado aunque cambie su ficha)
  cliente_nombre    text not null,
  cliente_nif       text,
  cliente_direccion text,
  -- totales
  base_imponible numeric(12,2) not null,
  total_iva      numeric(12,2) not null,
  total_irpf     numeric(12,2) not null default 0,
  total          numeric(12,2) not null,
  forma_pago     text,                 -- transferencia, bizum, efectivo...
  vencimiento    date,
  estado_cobro   text not null default 'pendiente'
                 check (estado_cobro in ('pendiente','cobrada','vencida')),
  notas          text,
  -- ---- VeriFactu-ready (sin uso hasta activar la API) ----
  vf_estado          text not null default 'no_aplicable'
                     check (vf_estado in ('no_aplicable','pendiente','enviada','aceptada','error')),
  vf_huella          text,     -- hash del registro de facturación
  vf_huella_anterior text,     -- encadenamiento con la factura anterior
  vf_qr_url          text,     -- URL/imagen del QR tributario
  vf_id_externo      text,     -- id de la factura en el proveedor (Invopop/Verifacti)
  vf_respuesta       jsonb,    -- respuesta completa del proveedor, por si acaso
  -- --------------------------------------------------------
  pdf_url        text,
  created_at     timestamptz not null default now(),
  unique (empresa_id, serie, anio, numero)
);
create index idx_facturas_empresa on facturas (empresa_id, estado_cobro);
 
create table factura_lineas (
  id              uuid primary key default gen_random_uuid(),
  factura_id      uuid not null references facturas(id) on delete restrict,
  orden           int not null default 0,
  concepto        text not null,
  descripcion     text,
  cantidad        numeric(12,3) not null default 1,
  unidad          text not null default 'ud',
  precio_unitario numeric(12,2) not null,
  descuento_pct   numeric(5,2) not null default 0,
  tipo_iva        numeric(5,2) not null default 21.00,
  importe         numeric(12,2) not null
);
create index idx_flineas_factura on factura_lineas (factura_id);
 
-- ------------------------------------------------------------
-- EVENTOS (auditoría de todo lo que pasa; te servirá también
-- de cara a VeriFactu y para el seguimiento comercial)
-- ------------------------------------------------------------
create table eventos (
  id          bigint generated always as identity primary key,
  empresa_id  uuid not null references empresas(id) on delete cascade,
  entidad     text not null,   -- 'presupuesto' | 'factura' | 'cliente' | ...
  entidad_id  uuid not null,
  tipo        text not null,   -- 'creado','enviado','visto','aceptado','emitida','rectificada','cobrada','error_vf'...
  datos       jsonb,
  created_at  timestamptz not null default now()
);
create index idx_eventos_entidad on eventos (entidad, entidad_id);
 
-- ------------------------------------------------------------
-- INMUTABILIDAD DE FACTURAS
-- Solo se permiten cambios de estado de cobro, PDF y campos vf_*.
-- Importes, número, fechas y datos del cliente: intocables.
-- ------------------------------------------------------------
create or replace function facturas_proteger()
returns trigger language plpgsql as $$
begin
  if new.numero         is distinct from old.numero
  or new.serie          is distinct from old.serie
  or new.anio           is distinct from old.anio
  or new.tipo           is distinct from old.tipo
  or new.fecha_emision  is distinct from old.fecha_emision
  or new.cliente_nombre is distinct from old.cliente_nombre
  or new.cliente_nif    is distinct from old.cliente_nif
  or new.base_imponible is distinct from old.base_imponible
  or new.total_iva      is distinct from old.total_iva
  or new.total_irpf     is distinct from old.total_irpf
  or new.total          is distinct from old.total
  then
    raise exception 'Las facturas emitidas son inmutables. Usa una rectificativa.';
  end if;
  return new;
end;
$$;
 
create trigger trg_facturas_inmutables
  before update on facturas
  for each row execute function facturas_proteger();
 
create or replace function factura_lineas_proteger()
returns trigger language plpgsql as $$
begin
  raise exception 'Las líneas de una factura emitida no se modifican. Usa una rectificativa.';
end;
$$;
 
create trigger trg_flineas_inmutables
  before update or delete on factura_lineas
  for each row execute function factura_lineas_proteger();
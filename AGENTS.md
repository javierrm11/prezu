# Prezu

PWA de presupuestos y facturas por voz para autónomos de oficios (fontaneros, electricistas, talleres, reformas). El usuario dicta un trabajo, la IA lo convierte en partidas, el presupuesto sale por WhatsApp y el cliente final lo acepta desde una página pública sin login. Multi-tenant desde el día 1 (hoy un solo negocio piloto real: un autónomo con ~1 factura/día).

**Stack:** Next.js App Router + TypeScript estricto + Tailwind + Supabase (Postgres con RLS, Auth, Storage). Deploy en Vercel. Idioma del producto y del código: español.

## Comandos

- `npm run dev` — desarrollo
- `npm run build` — compilar; ejecutar antes de dar una tarea por terminada
- `npm run lint` y `npm run typecheck` — SIEMPRE tras cada tanda de cambios
- Migraciones: SQL en `supabase/migrations/` (numeradas `0001_`, `0002_`…). Las ya aplicadas NUNCA se editan: los cambios de esquema van en una migración nueva.

## Estructura

- `app/(app)/` — rutas autenticadas: dashboard, presupuestos, facturas, clientes, catalogo, ajustes
- `app/p/[token]/` — página pública de aceptación del presupuesto (server-only)
- `app/api/` — route handlers (PDF, webhooks)
- `components/ui/` — sistema de diseño (Boton, Badge, Tarjeta, Tabla…); usar SIEMPRE estos, no estilos ad-hoc
- `lib/supabase/` — clientes `browser.ts`, `server.ts`, `admin.ts` (service role)
- `lib/importes.ts` — ÚNICA fuente de cálculo de totales
- `lib/ia/extraccion.ts` — prompt + esquema Zod del flujo de voz
- `lib/pdf/` — generación de PDF
- `supabase/migrations/0001_schema.sql` — esquema completo con comentarios de diseño; leerlo antes de tocar la BD
- `docs/diseno.md` — sistema de diseño completo (paleta Azul Oficio, componentes, pantallas)

## Reglas de negocio INVIOLABLES

1. **Las facturas emitidas son inmutables.** Hay triggers en BD que lo impiden; no intentes rodearlos ni pedir desactivarlos. Errores → factura rectificativa (`tipo='rectificativa'`, `rectifica_a`). Solo mutan: `estado_cobro`, `pdf_url` y campos `vf_*`.
2. **Numeración correlativa solo al emitir**, vía la función SQL `siguiente_numero()`. Los borradores no tienen número. Jamás generar números en la app.
3. **Dinero:** en BD `numeric(12,2)`; en TypeScript los cálculos se hacen en céntimos enteros dentro de `lib/importes.ts`. Redondeo a 2 decimales por línea; los totales son la suma de líneas ya redondeadas. Prohibido operar con floats sueltos o duplicar la lógica de totales fuera de ese módulo.
4. **RLS es la frontera de seguridad.** Queries de usuario siempre con el cliente de sesión (browser/server). El cliente `admin.ts` (service role) SOLO en servidor y SOLO para: página pública por `token_publico` y jobs internos. Nunca importarlo en código cliente ni exponer la key.
5. **La página pública** localiza el presupuesto únicamente por `token_publico` (uuid), registra `visto`/`aceptado` en `eventos` y no revela ningún otro dato del tenant.
6. **Campos `vf_*` de facturas:** reservados para la futura integración VeriFactu (Invopop/Verifacti). Mantenerlos en el flujo de emisión (a null) pero no implementar la integración sin que se pida.
7. **Toda acción relevante escribe en `eventos`** (creado, enviado, visto, aceptado, emitida, cobrada…). Es la base del timeline y de la auditoría.
8. **Formato es-ES en toda la UI:** `Intl.NumberFormat('es-ES')` → `1.234,56 €`; fechas `DD/MM/AAAA`; documentos `P-2026-001` / `F-2026-001`. Nada de texto en inglés de cara al usuario.
9. **Conversión presupuesto → factura:** las líneas se COPIAN (snapshot), igual que los datos fiscales del cliente. Nunca referencias compartidas.

## Flujo de voz (el corazón de la app)

Audio → transcripción → extracción a JSON **validado con Zod** (rechazar y reintentar si no valida) → casar partidas con `catalogo` (marcar cuáles vienen del catálogo) → tabla de revisión editable. La IA propone, el usuario confirma: nunca se guarda ni envía nada sin pasar por la pantalla de revisión.

## Diseño (resumen; detalle en docs/diseno.md)

- Tokens: primario `#1A2B6D` · secundario `#2F4FB5` · acento `#F4A623` · fondo `#F8F9FF` · éxito `#16A34A` · peligro `#DC2626` · aviso `#D97706`
- Tipos: DM Sans 700 (títulos) + Inter (cuerpo); importes con `tabular-nums`
- UN solo CTA ámbar por vista; sobre ámbar el texto va en `#1A2B6D`, nunca blanco
- Radios 12/8/999 px; sombra única `0 2px 8px rgba(26,43,109,0.08)`; iconos Lucide (nunca emojis)
- Táctil ≥ 48 px en móvil; server components por defecto, `'use client'` solo si hace falta

## Qué NO hacer

- No añadir dependencias ni ORMs sin preguntar (usamos `@supabase/supabase-js` directo)
- No crear tests, docs o refactors que no se hayan pedido
- No editar migraciones aplicadas ni tocar datos de producción
- No implementar dark mode, i18n ni la integración VeriFactu en v1
- No inventar estados de documento: los válidos son los CHECK del esquema
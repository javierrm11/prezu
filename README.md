# Prezu

PWA de presupuestos y facturas por voz para autónomos de oficios (fontaneros, electricistas, talleres, reformas). Ver [AGENTS.md](./AGENTS.md) para las reglas de negocio inviolables, la estructura del proyecto y el sistema de diseño.

## Empezar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Migraciones

El SQL de `supabase/migrations/` (`0001` a `0006`, en orden) hay que ejecutarlo a mano en el editor SQL de Supabase — no se aplican solas. Sin ellas, gran parte de la app falla en silencio por falta de políticas RLS.

## Próximos pasos

- **Página pública de aceptación** (`app/p/[token]/`) — el cliente final acepta el presupuesto sin login; todavía no existe, así que hoy un presupuesto solo llega a `aceptado`/`rechazado` si lo marcas tú a mano desde el panel.
- **Flujo de voz con IA real** (`lib/ia/extraccion.ts`) — la cajita de "Nuevo presupuesto" ya dicta y captura texto, pero interpreta con reglas + coincidencia contra el catálogo, no con un modelo de lenguaje. Falta transcripción + extracción real cuando se decida incorporar esa dependencia.
- **Numerar y enviar presupuestos** — falta el paso `borrador → enviado`, que asignaría `P-2026-XXX` vía `siguiente_numero()`. Hoy los presupuestos pasan directo a `facturado`, o se marcan `aceptado`/`rechazado` manualmente.
- **Envío real por WhatsApp** — el botón actual abre un enlace `wa.me` con mensaje predefinido; falta integrar la API de WhatsApp Business para mandar el PDF adjunto automáticamente (`WHATSAPP_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` en `.env`).
- **Guardar el PDF generado** — cada descarga se regenera al vuelo; falta subirlo a Supabase Storage y rellenar `pdf_url` para tener un enlace persistente. "Ver PDF" ya existe en facturas, falta añadirlo también en presupuestos.
- **Subir logo del negocio** — el campo `logo_url` ya existe en `empresas`, pero hace falta configurar Supabase Storage.
- **Facturas rectificativas** — la vía correcta para corregir una factura ya emitida (las facturas son inmutables por regla de negocio).
- **Series de presupuestos/facturas personalizables** — hoy la numeración usa siempre el código fijo `P`/`F`; permitir personalizarlas necesitaría columnas nuevas en `empresas`.

## Aprender más sobre Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deploy

Pensado para desplegar en [Vercel](https://vercel.com/new). Ver la [documentación de deploy de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.

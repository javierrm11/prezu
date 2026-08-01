# Prezu

PWA de presupuestos y facturas por voz para autónomos de oficios (fontaneros, electricistas, talleres, reformas). Ver [AGENTS.md](./AGENTS.md) para las reglas de negocio inviolables, la estructura del proyecto y el sistema de diseño.

## Empezar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Migraciones

El SQL de `supabase/migrations/` (`0001` a `0015`, en orden) hay que ejecutarlo a mano en el editor SQL de Supabase — no se aplican solas. Sin ellas, gran parte de la app falla en silencio por falta de políticas RLS. La `0007` además necesita que exista un bucket privado llamado `logos` en Storage.

## Planes

Prezu tiene tres planes (`empresas.plan`): **Gratis** (0 €, hasta 5 presupuestos/facturas al mes — límite reforzado con un trigger en BD, no solo en la app), **Básico** (9 €/mes, ilimitado) y **Pro** (19 €/mes, ilimitado). El plan Pro anuncia "multiusuario" y "recordatorios de cobro automáticos" en el marketing, pero **ninguna de las dos existe todavía**: no hay tabla de invitaciones, roles diferenciados en RLS, cron jobs ni envío automático de nada. Son funcionalidades pendientes de construir del todo, no solo de destapar.

## Antes de sacarlo a producción

- **Precios de Stripe en Live** — hay que crear en modo Live los dos precios recurrentes (Básico 9 €/mes, Pro 19 €/mes) y cargarlos como `STRIPE_PRICE_ID_BASICO` / `STRIPE_PRICE_ID_PRO` en las variables de entorno de producción de Vercel, además de `STRIPE_SECRET_KEY`/`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` en modo live y el `STRIPE_WEBHOOK_SECRET` del endpoint de producción (no el de `stripe listen`). El modelo ya no usa cupón ni trial (`STRIPE_COUPON_ID` no se usa).
- **Email transaccional propio** — Supabase Auth manda los correos de confirmación y recuperación de contraseña con su servicio compartido, que tiene límites bajos de envío y con frecuencia cae en spam. Antes de depender de esto con clientes reales, configurar SMTP propio (Resend, Postmark…) en Supabase → Auth → Email templates.
- **Monitorización de errores** — no hay Sentry ni nada equivalente. Ahora mismo, si algo revienta en producción (el flujo de voz, el webhook de Stripe, la generación de PDF...) no habría forma de enterarse salvo que un cliente lo reporte.
- **Backups de Supabase** — confirmar que el plan de Supabase tiene point-in-time recovery o backups automáticos activados; es la única copia de presupuestos, facturas y clientes de cada negocio.
- **Sin tests automatizados** — decisión consciente hasta ahora (así lo pide `AGENTS.md`), pero merece la pena revisarlo una vez haya varios negocios reales usando la app a diario: sobre todo `lib/importes.ts` (cálculo de totales) y el trigger de inmutabilidad de facturas son los puntos donde un fallo silencioso saldría más caro.

## Próximos pasos

- **Multiusuario (plan Pro)** — invitar a un segundo usuario a una empresa, con roles (el esquema ya tiene `perfiles.rol IN ('admin','empleado')`, pero no hay ninguna UI ni política RLS que distinga por rol).
- **Recordatorios de cobro automáticos (plan Pro)** — job programado (Vercel Cron) que avise de facturas pendientes/vencidas. Falta decidir el canal (WhatsApp Business API, que requiere aprobación de Meta y hoy tiene las variables `WHATSAPP_*` vacías; o email, que requiere el proveedor SMTP del punto anterior).

## Aprender más sobre Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deploy

Pensado para desplegar en [Vercel](https://vercel.com/new). Ver la [documentación de deploy de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.

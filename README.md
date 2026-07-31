# Prezu

PWA de presupuestos y facturas por voz para autónomos de oficios (fontaneros, electricistas, talleres, reformas). Ver [AGENTS.md](./AGENTS.md) para las reglas de negocio inviolables, la estructura del proyecto y el sistema de diseño.

## Empezar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Migraciones

El SQL de `supabase/migrations/` (`0001` a `0014`, en orden) hay que ejecutarlo a mano en el editor SQL de Supabase — no se aplican solas. Sin ellas, gran parte de la app falla en silencio por falta de políticas RLS. La `0007` además necesita que exista un bucket privado llamado `logos` en Storage.

## Antes de sacarlo a producción


- **Email transaccional propio** — Supabase Auth manda los correos de confirmación y recuperación de contraseña con su servicio compartido, que tiene límites bajos de envío y con frecuencia cae en spam. Antes de depender de esto con clientes reales, configurar SMTP propio (Resend, Postmark…) en Supabase → Auth → Email templates.
- **Monitorización de errores** — no hay Sentry ni nada equivalente. Ahora mismo, si algo revienta en producción (el flujo de voz, el webhook de Stripe, la generación de PDF...) no habría forma de enterarse salvo que un cliente lo reporte.
- **Variables de entorno de Stripe en Live** — repasar la checklist ya hablada: producto/precio y cupón recreados en modo Live, claves `sk_live_`/`pk_live_`, webhook de producción con su `whsec_` propio, todo cargado como variables de entorno de producción en Vercel (nunca en el `.env` local).
- **Backups de Supabase** — confirmar que el plan de Supabase tiene point-in-time recovery o backups automáticos activados; es la única copia de presupuestos, facturas y clientes de cada negocio.
- **Sin tests automatizados** — decisión consciente hasta ahora (así lo pide `AGENTS.md`), pero merece la pena revisarlo una vez haya varios negocios reales usando la app a diario: sobre todo `lib/importes.ts` (cálculo de totales) y el trigger de inmutabilidad de facturas son los puntos donde un fallo silencioso saldría más caro.

## Aprender más sobre Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deploy

Pensado para desplegar en [Vercel](https://vercel.com/new). Ver la [documentación de deploy de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.

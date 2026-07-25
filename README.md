# Prezu

PWA de presupuestos y facturas por voz para autónomos de oficios (fontaneros, electricistas, talleres, reformas). Ver [AGENTS.md](./AGENTS.md) para las reglas de negocio inviolables, la estructura del proyecto y el sistema de diseño.

## Empezar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Migraciones

El SQL de `supabase/migrations/` (`0001` a `0009`, en orden) hay que ejecutarlo a mano en el editor SQL de Supabase — no se aplican solas. Sin ellas, gran parte de la app falla en silencio por falta de políticas RLS. La `0007` además necesita que exista un bucket privado llamado `logos` en Storage.

## Próximos pasos

- **Numerar y enviar presupuestos** — falta el paso `borrador → enviado`, que asignaría `P-2026-XXX` vía `siguiente_numero()`. Hoy los presupuestos pasan directo a `facturado`, o se marcan `aceptado`/`rechazado` manualmente.

## Aprender más sobre Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deploy

Pensado para desplegar en [Vercel](https://vercel.com/new). Ver la [documentación de deploy de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.

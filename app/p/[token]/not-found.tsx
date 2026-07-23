export default function PresupuestoNoEncontrado() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[560px] flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="font-heading text-xl font-bold text-primario">
        Presupuesto no encontrado
      </h1>
      <p className="text-sm text-texto-secundario">
        Este enlace no es válido o el presupuesto ya no está disponible.
      </p>
    </div>
  );
}

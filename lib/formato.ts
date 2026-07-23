const formateadorEuros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const formateadorFecha = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formateadorFechaHora = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatearEuros(valor: number) {
  return formateadorEuros.format(valor);
}

export function formatearFecha(fecha: string | Date) {
  const valor = typeof fecha === "string" ? new Date(fecha) : fecha;
  return formateadorFecha.format(valor);
}

export function formatearFechaHora(fecha: string | Date) {
  const valor = typeof fecha === "string" ? new Date(fecha) : fecha;
  return formateadorFechaHora.format(valor);
}

const formateadorRelativo = new Intl.RelativeTimeFormat("es-ES", { numeric: "auto" });

export function formatearTiempoRelativo(fecha: string | Date) {
  const valor = typeof fecha === "string" ? new Date(fecha) : fecha;
  const diffMs = valor.getTime() - Date.now();
  const diffHoras = Math.round(diffMs / (1000 * 60 * 60));

  if (Math.abs(diffHoras) < 1) {
    const diffMinutos = Math.round(diffMs / (1000 * 60));
    return formateadorRelativo.format(diffMinutos, "minute");
  }
  if (Math.abs(diffHoras) < 24) {
    return formateadorRelativo.format(diffHoras, "hour");
  }
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return formateadorRelativo.format(diffDias, "day");
}

export function formatearNumeroDocumento(
  prefijo: string,
  numero: number | null,
  anio: number | null,
) {
  if (numero == null || anio == null) return `${prefijo} (borrador)`;
  return `${prefijo}-${anio}-${String(numero).padStart(3, "0")}`;
}

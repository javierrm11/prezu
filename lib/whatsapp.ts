const PREFIJO_ESPANA = "34";

export function construirEnlaceWhatsApp(telefono: string, mensaje: string) {
  const soloDigitos = telefono.replace(/\D/g, "");
  const conPrefijo = soloDigitos.startsWith(PREFIJO_ESPANA)
    ? soloDigitos
    : `${PREFIJO_ESPANA}${soloDigitos}`;

  return `https://wa.me/${conPrefijo}?text=${encodeURIComponent(mensaje)}`;
}

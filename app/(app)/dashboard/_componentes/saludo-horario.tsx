"use client";

import { useEffect, useState } from "react";

function calcularSaludo() {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function SaludoHorario() {
  // Empieza neutro y se ajusta tras montar: la hora del servidor
  // (normalmente UTC) no coincide con la hora local del usuario.
  const [saludo, setSaludo] = useState("Hola");

  useEffect(() => {
    // No hay mismatch que evitar de otro modo: la hora del servidor
    // y la del navegador difieren, así que el ajuste tiene que
    // pasar después de montar en cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaludo(calcularSaludo());
  }, []);

  return <>{saludo}</>;
}

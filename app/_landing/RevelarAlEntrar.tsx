"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// El contenido siempre está en el DOM desde el primer render (nada
// que ocultar a un crawler): solo se anima la opacidad tras montar,
// y solo si el bloque empieza fuera de la pantalla.
export function RevelarAlEntrar({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    const rect = nodo.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.9) return;

    setVisible(false);
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px -40px 0px" },
    );
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-500 ease-out"
      style={visible ? undefined : { opacity: 0, transform: "translateY(18px)" }}
    >
      {children}
    </div>
  );
}

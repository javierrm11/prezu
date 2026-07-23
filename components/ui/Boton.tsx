import { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "peligro";

const ESTILOS_VARIANTE: Record<Variante, string> = {
  primario:
    "h-12 bg-acento px-5 text-[15px] font-semibold text-primario hover:bg-acento-hover active:scale-[0.99]",
  secundario:
    "h-11 border-[1.5px] border-secundario bg-transparent px-4 text-sm font-medium text-secundario hover:bg-[#E8EDFB]",
  peligro:
    "h-11 border-[1.5px] border-peligro bg-transparent px-4 text-sm font-medium text-peligro hover:bg-[#FCEAEA]",
};

type BotonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
};

export function Boton({
  variante = "primario",
  className = "",
  ...resto
}: BotonProps) {
  return (
    <button
      className={`rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${ESTILOS_VARIANTE[variante]} ${className}`}
      {...resto}
    />
  );
}

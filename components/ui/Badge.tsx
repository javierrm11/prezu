type Tono = "exito" | "aviso" | "peligro" | "neutro";

const ESTILOS_TONO: Record<Tono, string> = {
  exito: "bg-[#E7F6EC] text-[#128A3E]",
  aviso: "bg-[#FDF3DF] text-[#B87A0E]",
  peligro: "bg-[#FCEAEA] text-peligro",
  neutro: "bg-[#EEF0F6] text-texto-secundario",
};

type BadgeProps = {
  tono?: Tono;
  children: React.ReactNode;
};

export function Badge({ tono = "neutro", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-[3px] text-xs font-medium ${ESTILOS_TONO[tono]}`}
    >
      {children}
    </span>
  );
}

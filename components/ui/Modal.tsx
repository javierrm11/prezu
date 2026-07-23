"use client";

import { type ReactNode } from "react";

type ModalProps = {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
};

export function Modal({ titulo, onCerrar, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(13,27,75,0.45)] p-6"
      onClick={onCerrar}
    >
      <div
        className="flex w-full max-w-[420px] flex-col gap-3.5 rounded-xl bg-superficie p-6 shadow-[0_12px_40px_rgba(26,43,109,0.3)]"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 className="font-heading text-lg font-bold text-primario">
          {titulo}
        </h2>
        {children}
      </div>
    </div>
  );
}

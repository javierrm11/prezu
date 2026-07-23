import { InputHTMLAttributes } from "react";

type CampoProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Campo({ label, id, className = "", ...resto }: CampoProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-texto">
        {label}
      </label>
      <input
        id={id}
        className={`h-12 rounded-lg border border-borde bg-superficie px-3.5 text-[15px] text-texto placeholder:text-texto-secundario focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario ${className}`}
        {...resto}
      />
    </div>
  );
}

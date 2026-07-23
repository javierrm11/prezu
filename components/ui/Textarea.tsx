import { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function Textarea({ label, id, className = "", ...resto }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-texto">
        {label}
      </label>
      <textarea
        id={id}
        className={`rounded-lg border border-borde bg-superficie px-3.5 py-2.5 text-[15px] leading-relaxed text-texto placeholder:text-texto-secundario focus:border-secundario focus:outline-none focus:ring-1 focus:ring-secundario ${className}`}
        {...resto}
      />
    </div>
  );
}

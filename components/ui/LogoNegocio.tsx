import { obtenerIniciales } from "@/lib/texto";

type LogoNegocioProps = {
  nombre: string;
  urlLogo: string | null;
  size: number;
  className?: string;
};

export function LogoNegocio({ nombre, urlLogo, size, className = "" }: LogoNegocioProps) {
  if (urlLogo) {
    return (
      // URL firmada y temporal de Storage: next/image no aplica bien
      // aquí (no puede cachear/optimizar algo que caduca en segundos).
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={urlLogo}
        alt={nombre}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`flex-shrink-0 rounded-xl object-cover ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`flex flex-shrink-0 items-center justify-center rounded-xl bg-primario font-heading font-bold text-acento ${className}`}
    >
      <span style={{ fontSize: size * 0.4 }}>{obtenerIniciales(nombre)}</span>
    </div>
  );
}

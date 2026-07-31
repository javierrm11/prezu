import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-fondo">
      <header className="border-b border-borde bg-superficie">
        <div className="mx-auto flex h-[68px] max-w-[760px] items-center px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="font-heading text-[22px] font-bold text-primario">Prezu</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] flex-1 px-5 py-10 sm:py-14">{children}</main>

      <footer className="border-t border-borde bg-superficie px-5 py-6 text-center">
        <Link href="/" className="text-sm font-medium text-secundario hover:underline">
          Volver a Prezu
        </Link>
      </footer>
    </div>
  );
}

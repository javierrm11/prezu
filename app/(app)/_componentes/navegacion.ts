import {
  BookOpen,
  FileText,
  House,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type ElementoNav = {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
};

export const NAV_PRINCIPAL: ElementoNav[] = [
  { href: "/dashboard", etiqueta: "Inicio", icono: House },
  { href: "/presupuestos", etiqueta: "Presupuestos", icono: FileText },
  { href: "/facturas", etiqueta: "Facturas", icono: Receipt },
  { href: "/clientes", etiqueta: "Clientes", icono: Users },
];

export const NAV_NEGOCIO: ElementoNav[] = [
  { href: "/catalogo", etiqueta: "Catálogo", icono: BookOpen },
  { href: "/ajustes", etiqueta: "Ajustes", icono: Settings },
];

export const NAV_MOVIL: ElementoNav[] = [
  { href: "/dashboard", etiqueta: "Inicio", icono: House },
  { href: "/presupuestos", etiqueta: "Presup.", icono: FileText },
  { href: "/facturas", etiqueta: "Facturas", icono: Receipt },
  { href: "/clientes", etiqueta: "Clientes", icono: Users },
  { href: "/ajustes", etiqueta: "Ajustes", icono: Settings },
];

export function esRutaActiva(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

import { Loader2 } from "lucide-react";

export default function CargandoPanel() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Loader2 size={28} className="animate-spin text-secundario" />
    </div>
  );
}

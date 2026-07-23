"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Send, Square } from "lucide-react";

type ResultadoVoz = {
  isFinal: boolean;
  [indice: number]: { transcript: string };
};

type EventoResultadoVoz = {
  results: { length: number; [indice: number]: ResultadoVoz };
};

type ReconocimientoVoz = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((evento: EventoResultadoVoz) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => ReconocimientoVoz;
    webkitSpeechRecognition?: new () => ReconocimientoVoz;
  }
}

type CajaVozProps = {
  value: string;
  onChange: (valor: string) => void;
  onEnviar?: () => void;
  placeholder?: string;
};

// Dictado por voz vía Web Speech API del navegador: nativa, sin
// key ni SDK externo. Firefox no la implementa y en iOS Safari es
// poco fiable, así que el botón de micrófono solo se muestra si
// el navegador la soporta; si no, la cajita sigue funcionando como
// simple cuadro de texto.
export function CajaVoz({ value, onChange, onEnviar, placeholder }: CajaVozProps) {
  const [grabando, setGrabando] = useState(false);
  const [soportado, setSoportado] = useState(false);
  const reconocimientoRef = useRef<ReconocimientoVoz | null>(null);
  const valorAlEmpezarRef = useRef("");

  useEffect(() => {
    // window.SpeechRecognition solo existe en cliente: hay que
    // comprobarlo después de montar para no desajustar la hidratación.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSoportado(Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition));
    return () => {
      reconocimientoRef.current?.stop();
    };
  }, []);

  function alternarGrabacion() {
    if (grabando) {
      reconocimientoRef.current?.stop();
      return;
    }

    const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Constructor) return;

    const reconocimiento = new Constructor();
    reconocimiento.lang = "es-ES";
    reconocimiento.continuous = true;
    reconocimiento.interimResults = true;
    valorAlEmpezarRef.current = value;

    reconocimiento.onresult = (evento) => {
      let textoFinal = "";
      let textoParcial = "";

      for (let i = 0; i < evento.results.length; i++) {
        const resultado = evento.results[i];
        if (resultado.isFinal) {
          textoFinal += resultado[0].transcript;
        } else {
          textoParcial += resultado[0].transcript;
        }
      }

      const base = valorAlEmpezarRef.current;
      const separador = base && !base.endsWith(" ") ? " " : "";
      onChange(`${base}${separador}${textoFinal}${textoParcial}`);
    };

    reconocimiento.onerror = () => setGrabando(false);
    reconocimiento.onend = () => setGrabando(false);

    reconocimientoRef.current = reconocimiento;
    reconocimiento.start();
    setGrabando(true);
  }

  return (
    <div className="rounded-xl border border-borde bg-superficie shadow-tarjeta focus-within:border-secundario focus-within:ring-1 focus-within:ring-secundario">
      <textarea
        value={value}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder ?? "Describe el trabajo…"}
        rows={3}
        className={`w-full resize-none bg-transparent px-4 py-3 text-[15px] text-texto placeholder:text-texto-secundario focus:outline-none ${
          soportado ? "rounded-t-xl" : "rounded-xl"
        }`}
      />
      {(soportado || onEnviar) && (
        <div className="flex items-center justify-between border-t border-[#EEF0F6] px-3 py-2">
          <span className="text-xs text-secundario">{grabando ? "Escuchando…" : ""}</span>
          <div className="flex items-center gap-2">
            {soportado && (
              <button
                type="button"
                onClick={alternarGrabacion}
                aria-label={grabando ? "Detener dictado" : "Dictar por voz"}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                  grabando
                    ? "animate-pulse bg-peligro text-white"
                    : "bg-fondo text-secundario hover:bg-[#E8EDFB]"
                }`}
              >
                {grabando ? <Square size={15} fill="currentColor" /> : <Mic size={17} />}
              </button>
            )}
            {onEnviar && (
              <button
                type="button"
                onClick={onEnviar}
                disabled={!value.trim()}
                aria-label="Enviar"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-acento text-primario transition-colors hover:bg-acento-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export function WhatsAppFlotante({ enlace }: { enlace: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function alScroll() {
      setVisible(window.scrollY > 420 && window.innerWidth < 860);
    }
    function alRedimensionar() {
      setVisible(window.scrollY > 420 && window.innerWidth < 860);
    }
    window.addEventListener("scroll", alScroll, { passive: true });
    window.addEventListener("resize", alRedimensionar);
    return () => {
      window.removeEventListener("scroll", alScroll);
      window.removeEventListener("resize", alRedimensionar);
    };
  }, []);

  if (!visible) return null;

  return (
    <a
      href={enlace}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed right-[18px] bottom-[18px] z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_6px_20px_rgba(13,27,75,0.28)]"
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2z" />
      </svg>
    </a>
  );
}

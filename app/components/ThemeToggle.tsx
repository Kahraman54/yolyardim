"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ThemeToggle() {
  const pathname = usePathname();
  const [acik, setAcik] = useState(false);
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    // Tema durumu yalnızca tarayıcıda bilinir; mount sonrası DOM'dan okunur
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAcik(document.documentElement.getAttribute("data-theme") === "light");
    setHazir(true);
  }, []);

  function degistir() {
    const yeni = !acik;
    setAcik(yeni);
    if (yeni) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("tema", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("tema", "dark");
    }
  }

  // Uygulama panellerinde alt navigasyonla çakışmasın diye gizle —
  // tema yine uygulanır, düğme genel sayfalarda erişilebilir
  const gizli = ["/musteri", "/sofor/panel", "/firma/panel", "/admin/panel"].some(p => pathname?.startsWith(p));
  if (!hazir || gizli) return null;

  return (
    <button
      onClick={degistir}
      title={acik ? "Koyu temaya geç" : "Açık temaya geç"}
      aria-label="Tema değiştir"
      className="fixed bottom-4 right-4 z-[200] w-11 h-11 rounded-full bg-[var(--surface)] border border-[var(--border-2)] shadow-lg flex items-center justify-center text-lg hover:scale-110 transition"
    >
      {acik ? "🌙" : "☀️"}
    </button>
  );
}

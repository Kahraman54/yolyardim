"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [panellerAcik, setPanellerAcik] = useState(false);
  const [firmaCount, setFirmaCount] = useState<number | null>(null);
  const panellerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("firmalar").select("id", { count: "exact", head: true }).eq("durum", "aktif")
      .then(({ count }) => setFirmaCount(count));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panellerRef.current && !panellerRef.current.contains(e.target as Node)) {
        setPanellerAcik(false);
      }
    }
    if (panellerAcik) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [panellerAcik]);

  return (
    <main className="bg-[#0D0D0D] text-white flex flex-col" style={{ height: "100dvh", minHeight: "100vh" }}>

      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#1A1A1A] border-b border-white/5 flex-shrink-0 z-40">
        <div className="font-black text-xl tracking-tight">
          Tulpar<span className="text-[#FF4D00]"> Assist</span>
        </div>
        <div ref={panellerRef} className="relative">
          <button
            onClick={() => setPanellerAcik(p => !p)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold transition ${panellerAcik ? "bg-[#FF4D00]/10 border-[#FF4D00]/30 text-[#FF4D00]" : "bg-[#2A2A2A] border-white/10 text-white"}`}
          >
            <span className="text-base">{panellerAcik ? "✕" : "≡"}</span> Paneller
          </button>

          {panellerAcik && (
            <div className="absolute right-0 top-12 w-60 bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden z-50">
              <div className="px-4 py-2.5 border-b border-white/5">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Panel Girişleri</div>
              </div>
              <Link href="/sofor" onClick={() => setPanellerAcik(false)}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition border-b border-white/5">
                <div className="w-9 h-9 bg-[#FF4D00]/10 border border-[#FF4D00]/20 rounded-xl flex items-center justify-center text-base flex-shrink-0">🚛</div>
                <div>
                  <div className="text-sm font-bold">Şoför Girişi</div>
                  <div className="text-xs text-gray-500">Atanan görevleri gör</div>
                </div>
              </Link>
              <Link href="/firma/giris" onClick={() => setPanellerAcik(false)}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition">
                <div className="w-9 h-9 bg-[#00C853]/8 border border-[#00C853]/20 rounded-xl flex items-center justify-center text-base flex-shrink-0">🏢</div>
                <div>
                  <div className="text-sm font-bold">Tedarikçi Girişi</div>
                  <div className="text-xs text-gray-500">Firma panelini aç</div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* HARİTA / HERO ALANI */}
      <div className="flex-1 relative bg-[#1a2332] overflow-hidden flex flex-col items-center justify-center">
        {/* Dekoratif yol çizgileri */}
        <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          <line x1="0" y1="250" x2="400" y2="220" stroke="#2a3a4a" strokeWidth="18"/>
          <line x1="100" y1="0" x2="130" y2="500" stroke="#2d4a6a" strokeWidth="12"/>
          <line x1="270" y1="0" x2="310" y2="500" stroke="#2a3a4a" strokeWidth="8"/>
          <line x1="0" y1="100" x2="400" y2="80" stroke="#222" strokeWidth="6"/>
          <line x1="0" y1="380" x2="400" y2="360" stroke="#222" strokeWidth="5"/>
          <line x1="50" y1="0" x2="30" y2="500" stroke="#1e2e3e" strokeWidth="5"/>
        </svg>

        {/* Firma marker'ları */}
        {firmaCount !== null && firmaCount > 0 && (
          <div className="absolute top-5 left-5 bg-[#1A1A1A]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white">
            🚛 {firmaCount} aktif firma
          </div>
        )}

        {/* Merkez içerik */}
        <div className="relative z-10 text-center px-6 py-4">
          <div className="inline-flex items-center gap-2 bg-[#FF4D00]/10 border border-[#FF4D00]/25 text-[#FF4D00] rounded-full px-4 py-1.5 text-xs font-bold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] animate-pulse"></span>
            7/24 Aktif Hizmet
          </div>
          <h1 className="font-black text-3xl leading-tight mb-3">
            Yolda kaldın mı?<br />
            <span className="text-[#FF4D00]">Biz zaten yoldayız.</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
            Türkiye genelinde çekici ve yol yardım firmalarını saniyeler içinde bulun.
          </p>
        </div>
      </div>

      {/* ALT BÖLÜM */}
      <div className="bg-[#1A1A1A] border-t border-white/5 px-4 py-5 flex-shrink-0">
        <Link href="/giris"
          className="block w-full bg-[#FF4D00] hover:bg-[#CC3D00] active:bg-[#993000] text-white font-black py-4 rounded-2xl text-center text-base transition">
          🆘 Giriş Yap
        </Link>
        <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-white/5">
          {[
            { val: firmaCount !== null ? `${firmaCount}+` : "...", label: "Aktif Firma" },
            { val: "81 İl", label: "Türkiye Geneli" },
            { val: "4.8 ★", label: "Kullanıcı Puanı" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-black text-base">{s.val}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <Link href="/firma/kayit" className="text-xs text-gray-600 hover:text-gray-400 transition">
            Tedarikçi olmak ister misiniz? →
          </Link>
        </div>
      </div>

    </main>
  );
}

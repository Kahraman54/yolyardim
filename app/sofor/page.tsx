"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function SoforGiris() {
  const router = useRouter();
  const [tel, setTel] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function giris() {
    const temiz = tel.replace(/\D/g, "").slice(-10);
    if (temiz.length < 10) { setHata("Geçerli bir telefon numarası gir."); return; }
    setHata("");
    setYukleniyor(true);
    const { data } = await supabase
      .from("soforler")
      .select("id, ad, soyad, tel, firma_id")
      .ilike("tel", `%${temiz}`);
    setYukleniyor(false);
    if (!data || data.length === 0) {
      setHata("Bu numara ile kayıtlı şoför bulunamadı. Firmanızla iletişime geçin.");
      return;
    }
    localStorage.setItem("sofor", JSON.stringify(data[0]));
    router.push("/sofor/panel");
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-black italic tracking-tight mb-6 flex items-center gap-4" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          <img src="/tulpar-logo-v3.png" alt="" className="w-auto object-contain flex-shrink-0" style={{ height: "clamp(4rem, 12vw, 6rem)" }} />
          <span>Tulpar<span className="text-[#00D4FF]">Assist</span></span>
        </Link>

        <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-7">
          <h1 className="font-black text-xl mb-1">Şoför Paneli Girişi</h1>
          <p className="text-gray-500 text-sm mb-6">Kayıtlı telefon numaranızla giriş yapın.</p>

          {hata && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4">
              ⚠️ {hata}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-400 mb-2">Telefon *</label>
            <div className="flex">
              <div className="bg-[#2A2A2A] border border-white/8 border-r-0 rounded-l-lg px-3 flex items-center text-sm font-bold flex-shrink-0">🇹🇷 +90</div>
              <input
                type="tel"
                value={tel}
                onChange={e => { let v = e.target.value.replace(/\D/g, ""); if (v.startsWith("0")) v = v.slice(1); setTel(v.slice(0, 10)); setHata(""); }}
                onKeyDown={e => e.key === "Enter" && giris()}
                placeholder="5XX XXX XX XX"
                className="flex-1 bg-[#2A2A2A] border border-white/8 rounded-r-lg px-3 py-3 text-sm text-white outline-none focus:border-[#00D4FF] transition"
              />
            </div>
          </div>

          <button
            onClick={giris}
            disabled={yukleniyor || tel.replace(/\D/g, "").length < 10}
            className="w-full bg-[#00D4FF] hover:bg-[#0099BB] disabled:opacity-40 text-[#0B0F14] font-bold py-3 rounded-xl transition text-sm"
          >
            {yukleniyor ? "Giriş yapılıyor..." : "Devam Et →"}
          </button>

          <div className="text-center mt-4">
            <Link href="/" className="text-xs text-gray-500 hover:text-white transition">← Ana sayfaya dön</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

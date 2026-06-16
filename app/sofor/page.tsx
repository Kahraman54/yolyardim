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
      <div className="w-full max-w-xs">
        <Link href="/" className="font-black text-2xl mb-1 block">
          Tulpar<span className="text-[#FF4D00]"> Assist</span>
        </Link>
        <div className="text-gray-500 text-sm mb-8">Şoför Girişi</div>
        {hata && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4">
            ⚠️ {hata}
          </div>
        )}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-400 mb-2">Telefon Numaranız</label>
          <div className="flex">
            <div className="bg-[#1A1A1A] border border-white/8 border-r-0 rounded-l-xl px-3 flex items-center text-sm font-bold text-gray-400">🇹🇷 +90</div>
            <input
              type="tel"
              value={tel}
              onChange={e => { setTel(e.target.value.replace(/\D/g, "").slice(0, 10)); setHata(""); }}
              onKeyDown={e => e.key === "Enter" && giris()}
              placeholder="5XX XXX XX XX"
              className="flex-1 bg-[#1A1A1A] border border-white/8 rounded-r-xl px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition"
            />
          </div>
        </div>
        <button
          onClick={giris}
          disabled={yukleniyor || tel.replace(/\D/g, "").length < 10}
          className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm"
        >
          {yukleniyor ? "Giriş yapılıyor..." : "Devam Et →"}
        </button>
        <div className="text-center mt-5">
          <Link href="/" className="text-xs text-gray-600 hover:text-white transition">← Ana sayfaya dön</Link>
        </div>
      </div>
    </main>
  );
}

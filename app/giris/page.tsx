"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function Giris() {
  const [adim, setAdim] = useState<"tel" | "bilgi">("tel");
  const [tel, setTel] = useState("");
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [email, setEmail] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState(false);

  async function telKontrol() {
    if (tel.length < 10) { setHata("Geçerli bir telefon numarası girin."); return; }
    setHata("");
    setYukleniyor(true);
    const { data } = await supabase
      .from("kullanicilar")
      .select("id")
      .eq("tel", tel)
      .single();
    setYukleniyor(false);
    if (data) {
      setBasari(true);
    } else {
      setAdim("bilgi");
    }
  }

  async function kayitOl() {
    if (!ad || !soyad) { setHata("Ad ve soyad zorunlu."); return; }
    setHata("");
    setYukleniyor(true);
    const { error } = await supabase
      .from("kullanicilar")
      .insert({ tel, ad, soyad, email: email || null });
    setYukleniyor(false);
    if (error) {
      setHata("Hata: " + error.message);
    } else {
      setBasari(true);
    }
  }

  if (basari) {
    return (
      <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-5">
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-4">🎉</div>
          <div className="font-black text-2xl mb-2">Hoş geldin!</div>
          <p className="text-gray-500 text-sm mb-8">Hesabın hazır.</p>
          <Link href="/" className="block w-full bg-[#FF4D00] text-white font-bold py-3.5 rounded-xl text-center hover:bg-[#CC3D00] transition">
            Ana Sayfaya Git →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-black text-2xl">
            Yol<span className="text-[#FF4D00]">Yardım</span>
          </Link>
        </div>
        <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-7">
          {adim === "tel" && (
            <div>
              <h1 className="font-black text-xl mb-1">Hoş geldin 👋</h1>
              <p className="text-gray-500 text-sm mb-6">Telefon numaranı gir, devam edelim.</p>
              {hata && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4">⚠️ {hata}</div>}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-400 mb-2">Telefon *</label>
                <div className="flex">
                  <div className="bg-[#2A2A2A] border border-white/8 border-r-0 rounded-l-lg px-3 flex items-center text-sm font-bold">🇹🇷 +90</div>
                  <input type="tel" value={tel} onChange={e => setTel(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="5XX XXX XX XX" className="flex-1 bg-[#2A2A2A] border border-white/8 rounded-r-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" />
                </div>
              </div>
              <button onClick={telKontrol} disabled={tel.length < 10 || yukleniyor} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm">
                {yukleniyor ? "Kontrol ediliyor..." : "Devam Et →"}
              </button>
              <div className="text-center mt-4">
                <Link href="/" className="text-xs text-gray-500 hover:text-white transition">← Ana sayfaya dön</Link>
              </div>
            </div>
          )}
          {adim === "bilgi" && (
            <div>
              <button onClick={() => setAdim("tel")} className="text-xs text-gray-500 hover:text-white transition mb-4 block">← Geri</button>
              <h1 className="font-black text-xl mb-1">Seni tanıyalım ✨</h1>
              <p className="text-gray-500 text-sm mb-6"><span className="text-white font-semibold">+90 {tel}</span> numaralı yeni hesap.</p>
              {hata && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4">⚠️ {hata}</div>}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Ad *</label>
                  <input type="text" value={ad} onChange={e => setAd(e.target.value)} placeholder="Adınız" className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Soyad *</label>
                  <input type="text" value={soyad} onChange={e => setSoyad(e.target.value)} placeholder="Soyadınız" className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" />
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-400 mb-2">E-posta <span className="text-gray-600 font-normal">(opsiyonel)</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mail@ornek.com" className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" />
              </div>
              <div className="flex items-start gap-2 mb-5">
                <input type="checkbox" id="kvkk" defaultChecked className="mt-1 accent-[#FF4D00]" />
                <label htmlFor="kvkk" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                  <span className="text-[#FF4D00]">Kullanım Koşulları</span>&apos;nı kabul ediyorum.
                </label>
              </div>
              <button onClick={kayitOl} disabled={!ad || !soyad || yukleniyor} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm">
                {yukleniyor ? "Kaydediliyor..." : "Hesabımı Oluştur →"}
              </button>
            </div>
          )}
        </div>
        <div className="text-center mt-5 text-xs text-gray-600">
          Firma mısın? <Link href="/firma/kayit" className="text-[#FF4D00] font-semibold">Firma paneline git</Link>
        </div>
      </div>
    </main>
  );
}
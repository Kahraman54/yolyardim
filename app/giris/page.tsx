"use client";
import { useState, useRef } from "react";
import Link from "next/link";

export default function Giris() {
  const [adim, setAdim] = useState<"tel" | "otp" | "bilgi">("tel");
  const [tel, setTel] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  function telGonder() {
    if (tel.length < 10) return;
    setYukleniyor(true);
    setTimeout(() => { setYukleniyor(false); setAdim("otp"); }, 1200);
  }

  function otpGir(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const yeni = [...otp];
    yeni[idx] = val;
    setOtp(yeni);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (yeni.every(d => d)) {
      setTimeout(() => {
        if (yeni.join("") === "123456") setAdim("bilgi");
      }, 300);
    }
  }

  function kayitOl() {
    if (!ad || !soyad) return;
    setYukleniyor(true);
    setTimeout(() => { window.location.href = "/musteri"; }, 1200);
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-5">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/" className="font-black text-2xl tracking-tight">
            Yol<span className="text-[#FF4D00]">Yardım</span>
          </Link>
        </div>

        <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-7">

          {adim === "tel" && (
            <div>
              <h1 className="font-black text-xl mb-1">Hoş geldin 👋</h1>
              <p className="text-gray-500 text-sm mb-6">Telefon numaranı gir, sana kod gönderelim.</p>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-400 mb-2">Telefon Numarası</label>
                <div className="flex">
                  <div className="bg-[#2A2A2A] border border-white/8 border-r-0 rounded-l-lg px-3 flex items-center text-sm font-bold text-white">🇹🇷 +90</div>
                  <input type="tel" value={tel} onChange={e => setTel(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="5XX XXX XX XX" className="flex-1 bg-[#2A2A2A] border border-white/8 rounded-r-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" />
                </div>
                <p className="text-xs text-gray-600 mt-2">Sonraki girişlerde tekrar sorulmaz</p>
              </div>
              <button onClick={telGonder} disabled={tel.length < 10 || yukleniyor} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm">
                {yukleniyor ? "Gönderiliyor..." : "Kod Gönder"}
              </button>
              <div className="text-center mt-4">
                <Link href="/" className="text-xs text-gray-500 hover:text-white transition">← Ana sayfaya dön</Link>
              </div>
            </div>
          )}

          {adim === "otp" && (
            <div>
              <button onClick={() => setAdim("tel")} className="text-xs text-gray-500 hover:text-white transition mb-4">← Geri</button>
              <h1 className="font-black text-xl mb-1">Kodu gir 🔢</h1>
              <p className="text-gray-500 text-sm mb-1"><span className="text-white font-semibold">+90 {tel}</span> numarasına kod gönderdik.</p>
              <p className="text-xs text-[#FF4D00] mb-6">Demo için: 1 2 3 4 5 6</p>
              <div className="flex gap-2 justify-center mb-6">
                {otp.map((d, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el; }} type="text" maxLength={1} value={d}
                    onChange={e => otpGir(i, e.target.value)}
                    onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) otpRefs.current[i - 1]?.focus(); }}
                    className="w-11 text-center text-xl font-black bg-[#2A2A2A] border border-white/8 rounded-xl text-white outline-none focus:border-[#FF4D00] transition py-3" />
                ))}
              </div>
              <p className="text-center text-xs text-gray-500">Kod gelmedi mi? <button onClick={telGonder} className="text-[#FF4D00] font-semibold">Tekrar gönder</button></p>
            </div>
          )}

          {adim === "bilgi" && (
            <div>
              <h1 className="font-black text-xl mb-1">Son bir adım ✨</h1>
              <p className="text-gray-500 text-sm mb-6">Adını ve soyadını ekle.</p>
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
                <input type="email" placeholder="mail@ornek.com" className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" />
              </div>
              <div className="flex items-start gap-2 mb-5">
                <input type="checkbox" id="kvkk" className="mt-1 accent-[#FF4D00]" />
                <label htmlFor="kvkk" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                  <span className="text-[#FF4D00]">Kullanım Koşulları</span>&apos;nı kabul ediyorum.
                </label>
              </div>
              <button onClick={kayitOl} disabled={!ad || !soyad || yukleniyor} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm">
                {yukleniyor ? "Oluşturuluyor..." : "Hesabımı Oluştur →"}
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
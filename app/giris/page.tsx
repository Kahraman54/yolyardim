"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Giris() {
  const router = useRouter();
  const [adim, setAdim] = useState<"tel" | "bilgi">("tel");
  const [tel, setTel] = useState("");
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function telKontrol() {
    const temizTel = tel.replace(/\D/g, "").slice(-10);
    if (temizTel.length < 10) { setHata("Geçerli bir telefon numarası gir."); return; }
    setHata("");
    setYukleniyor(true);

    const { data } = await supabase
      .from("musteriler")
      .select("id, tel, ad, soyad, arac_marka, arac_model, arac_plaka, cekis_turu, yakit_tipi")
      .ilike("tel", `%${temizTel}`);

    setYukleniyor(false);

    if (data && data.length > 0) {
      localStorage.setItem("musteri", JSON.stringify(data[0]));
      router.push("/musteri");
    } else {
      setAdim("bilgi");
    }
  }

  async function kayitOl() {
    if (!ad) { setHata("Ad zorunlu."); return; }
    setHata("");
    setYukleniyor(true);
    const fullTel = tel.replace(/\s/g, "");
    const { data: newMusteri, error } = await supabase
      .from("musteriler")
      .insert({ tel: fullTel, ad, soyad: soyad || null })
      .select()
      .single();
    setYukleniyor(false);
    if (error || !newMusteri) {
      setHata("Kayıt hatası: " + (error?.message || "Bilinmeyen hata"));
      return;
    }
    localStorage.setItem("musteri", JSON.stringify(newMusteri));
    router.push("/musteri");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-black italic tracking-tight mb-6 flex items-center gap-4" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          <img src="/tulpar-logo-v3.png" alt="" className="w-auto object-contain flex-shrink-0" style={{ height: "clamp(4rem, 12vw, 6rem)" }} />
          <span>Tulpar<span className="text-[var(--accent-text)]">Assist</span></span>
        </Link>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7">
          {adim === "tel" && (
            <div>
              <h1 className="font-black text-xl mb-1">Hoş geldin 👋</h1>
              <p className="text-[var(--text-3)] text-sm mb-6">Telefon numaranı gir, devam edelim.</p>
              {hata && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4">⚠️ {hata}</div>}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[var(--text-2)] mb-2">Telefon *</label>
                <div className="flex">
                  <div className="bg-[var(--surface-2)] border border-[var(--border)] border-r-0 rounded-l-lg px-3 flex items-center text-sm font-bold">🇹🇷 +90</div>
                  <input
                    type="tel"
                    value={tel}
                    onChange={e => { let v = e.target.value.replace(/\D/g, ""); if (v.startsWith("0")) v = v.slice(1); setTel(v.slice(0, 10)); setHata(""); }}
                    onKeyDown={e => e.key === "Enter" && telKontrol()}
                    placeholder="5XX XXX XX XX"
                    className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-r-lg px-3 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition"
                  />
                </div>
              </div>
              <button onClick={telKontrol} disabled={tel.replace(/\D/g,"").length < 10 || yukleniyor}
                className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[var(--text)] font-bold py-3 rounded-xl transition text-sm">
                {yukleniyor ? "Kontrol ediliyor..." : "Devam Et →"}
              </button>
              <div className="text-center mt-4">
                <Link href="/" className="text-xs text-[var(--text-3)] hover:text-[var(--text)] transition">← Ana sayfaya dön</Link>
              </div>
            </div>
          )}
          {adim === "bilgi" && (
            <div>
              <button onClick={() => setAdim("tel")} className="text-xs text-[var(--text-3)] hover:text-[var(--text)] transition mb-4 block">← Geri</button>
              <h1 className="font-black text-xl mb-1">Seni tanıyalım ✨</h1>
              <p className="text-[var(--text-3)] text-sm mb-6">İlk kez giriyorsun, hızlıca kaydedelim.</p>
              {hata && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4">⚠️ {hata}</div>}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-2">Ad *</label>
                  <input type="text" value={ad} onChange={e => setAd(e.target.value)} onKeyDown={e => e.key === "Enter" && kayitOl()} placeholder="Adın" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-2">Soyad</label>
                  <input type="text" value={soyad} onChange={e => setSoyad(e.target.value)} onKeyDown={e => e.key === "Enter" && kayitOl()} placeholder="Soyadın" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition" />
                </div>
              </div>
              <button onClick={kayitOl} disabled={!ad || yukleniyor}
                className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[var(--text)] font-bold py-3 rounded-xl transition text-sm">
                {yukleniyor ? "Kaydediliyor..." : "Devam Et →"}
              </button>
            </div>
          )}
        </div>
        <div className="text-center mt-5 text-xs text-[var(--text-3)]">
          Tedarikçimiz misin? <Link href="/firma/giris" className="text-[var(--accent-text)] font-semibold">Tedarikçi paneline git</Link>
        </div>
      </div>
    </main>
  );
}

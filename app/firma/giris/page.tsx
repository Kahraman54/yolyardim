"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function FirmaGiris() {
  const router = useRouter();
  const [tel, setTel] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function girisYap() {
    if (!tel.trim()) { setHata("Telefon numaranızı girin."); return; }
    setHata("");
    setYukleniyor(true);

    // Sadece rakamları al, format farkı olsa da eşleştir
    const sadeceSayi = tel.replace(/\D/g, "");
    const sonOnHane = sadeceSayi.slice(-10);

    const { data: adaylar } = await supabase
      .from("firmalar")
      .select("id, firma_ad, tel, durum")
      .ilike("tel", `%${sonOnHane}`);

    const data = (adaylar || []).find(f =>
      f.tel.replace(/\D/g, "").slice(-10) === sonOnHane
    );

    setYukleniyor(false);

    if (!data) {
      setHata("Bu telefon numarasıyla kayıtlı firma bulunamadı.");
      return;
    }

    if (data.durum === "bekliyor") {
      setHata("Başvurunuz henüz inceleniyor. Onay sonrası giriş yapabilirsiniz.");
      return;
    }

    if (data.durum === "reddedildi") {
      setHata("Başvurunuz reddedildi. Destek için iletişime geçin.");
      return;
    }

    localStorage.setItem("firma", JSON.stringify({ id: data.id, firma_ad: data.firma_ad, tel: data.tel }));
    router.push("/firma/panel");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-black italic tracking-tight mb-6 flex items-center gap-4" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          <img src="/tulpar-logo-v3.png" alt="" className="w-auto object-contain flex-shrink-0" style={{ height: "clamp(4rem, 12vw, 6rem)" }} />
          <span>Tulpar<span className="text-[var(--accent-text)]">Assist</span></span>
        </Link>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7">
          <h1 className="font-black text-xl mb-1">Tedarikçi Paneli Girişi</h1>
          <p className="text-[var(--text-3)] text-sm mb-6">Kayıtlı telefon numaranızla giriş yapın.</p>

          {hata && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4">
              ⚠️ {hata}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[var(--text-2)] mb-2">Telefon *</label>
            <div className="flex">
              <div className="bg-[var(--surface-2)] border border-[var(--border)] border-r-0 rounded-l-lg px-3 flex items-center text-sm font-bold flex-shrink-0">🇹🇷 +90</div>
              <input
                value={tel}
                onChange={e => { let v = e.target.value.replace(/\D/g, ""); if (v.startsWith("0")) v = v.slice(1); setTel(v.slice(0, 10)); }}
                onKeyDown={e => e.key === "Enter" && girisYap()}
                placeholder="5XX XXX XX XX"
                className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-r-lg px-3 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition"
              />
            </div>
          </div>

          <button
            onClick={girisYap}
            disabled={yukleniyor}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[#0B0F14] font-bold py-3 rounded-xl transition text-sm"
          >
            {yukleniyor ? "Kontrol ediliyor..." : "Giriş Yap →"}
          </button>

          <div className="text-center mt-4">
            <Link href="/" className="text-xs text-[var(--text-3)] hover:text-[var(--text)] transition">← Ana sayfaya dön</Link>
          </div>
        </div>

        <div className="text-center mt-5 text-xs text-[var(--text-3)]">
          Henüz aramıza katılmadın mı?{" "}
          <Link href="/firma/kayit" className="text-[var(--accent-text)] font-semibold">Hemen Tedarikçimiz Ol</Link>
        </div>
      </div>
    </main>
  );
}

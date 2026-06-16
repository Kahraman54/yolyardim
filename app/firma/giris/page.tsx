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

    const { data: tumFirmalar } = await supabase
      .from("firmalar")
      .select("id, firma_ad, tel, durum");

    const data = (tumFirmalar || []).find(f =>
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
    <main className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-black text-xl tracking-tight mb-8 block">
          Tulpar<span className="text-[#FF4D00]"> Assist</span>
        </Link>

        <h1 className="font-black text-2xl mb-1">Firma Girişi</h1>
        <p className="text-gray-500 text-sm mb-8">Kayıtlı telefon numaranızla giriş yapın.</p>

        {hata && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-5">
            ⚠️ {hata}
          </div>
        )}

        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-400 mb-2">Telefon Numarası</label>
          <input
            value={tel}
            onChange={e => setTel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && girisYap()}
            placeholder="0532 xxx xx xx"
            className="w-full bg-[#1A1A1A] border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition"
          />
        </div>

        <button
          onClick={girisYap}
          disabled={yukleniyor}
          className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm"
        >
          {yukleniyor ? "Kontrol ediliyor..." : "Giriş Yap →"}
        </button>

        <div className="mt-6 text-center">
          <Link href="/firma/kayit" className="text-xs text-gray-600 hover:text-white transition">
            Henüz kayıt olmadın mı? Firma Ol →
          </Link>
        </div>
      </div>
    </main>
  );
}

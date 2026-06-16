"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type SoforKayit = { id: string; ad: string; soyad: string; tel: string; firma_id: string; };
type MusteriDetay = { arac_marka?: string; arac_model?: string; cekis_turu?: string; yakit_tipi?: string; };
type Talep = {
  id: string; tip: string; durum: string; created_at: string;
  musteri_id?: string; musteri_ad?: string; musteri_tel?: string;
  arac_plaka?: string; konum_lat?: number; konum_lng?: number; konum_adres?: string;
  hedef_adres?: string; aciklama?: string;
  atanan_arac?: string;
};

export default function SoforPanel() {
  const router = useRouter();
  const [sofor, setSofor] = useState<SoforKayit | null>(null);
  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [seciliTalep, setSeciliTalep] = useState<Talep | null>(null);
  const [musteriDetay, setMusteriDetay] = useState<MusteriDetay | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [takipAktif, setTakipAktif] = useState(false);
  const [sonKonum, setSonKonum] = useState<{ lat: number; lng: number } | null>(null);
  const [islemYapiliyor, setIslemYapiliyor] = useState(false);
  const [hata, setHata] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auth check
  useEffect(() => {
    const kayit = localStorage.getItem("sofor");
    if (!kayit) { router.replace("/sofor"); return; }
    try { setSofor(JSON.parse(kayit)); }
    catch { router.replace("/sofor"); }
  }, [router]);

  const taleplerYukle = useCallback(async (soforId: string) => {
    const { data } = await supabase
      .from("talepler")
      .select("id, tip, durum, created_at, musteri_id, musteri_ad, musteri_tel, arac_plaka, konum_lat, konum_lng, konum_adres, hedef_adres, aciklama, atanan_arac")
      .eq("atanan_sofor", soforId)
      .in("durum", ["kabul", "yolda"])
      .order("created_at", { ascending: false });
    setTalepler(data || []);
    setYukleniyor(false);
  }, []);

  useEffect(() => {
    if (!sofor) return;
    taleplerYukle(sofor.id);
  }, [sofor, taleplerYukle]);

  // Müşteri araç detayını getir
  async function musteriDetayYukle(musteriId: string) {
    const { data } = await supabase
      .from("musteriler")
      .select("arac_marka, arac_model, cekis_turu, yakit_tipi")
      .eq("id", musteriId)
      .single();
    setMusteriDetay(data || null);
  }

  function talepSec(t: Talep) {
    setSeciliTalep(t);
    if (t.musteri_id) musteriDetayYukle(t.musteri_id);
    else setMusteriDetay(null);
    // If this talep is already yolda, mark tracking as active
    if (t.durum === "yolda") setTakipAktif(true);
    else setTakipAktif(false);
  }

  // Şoförün GPS konumunu yükle ve gönder
  function konumGuncelle(talepId: string) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setSonKonum({ lat, lng });
        await supabase.from("talepler").update({
          sofor_konum_lat: lat,
          sofor_konum_lng: lng,
          sofor_konum_updated_at: new Date().toISOString(),
        }).eq("id", talepId);
      },
      () => {},
      { timeout: 10000, maximumAge: 5000 }
    );
  }

  async function iseBasla() {
    if (!seciliTalep || !sofor) return;
    setIslemYapiliyor(true);
    setHata("");
    // Set durum to yolda
    const { error } = await supabase.from("talepler")
      .update({ durum: "yolda" })
      .eq("id", seciliTalep.id);
    if (error) { setHata("Hata: " + error.message); setIslemYapiliyor(false); return; }

    setSeciliTalep(prev => prev ? { ...prev, durum: "yolda" } : prev);
    setTakipAktif(true);
    setIslemYapiliyor(false);

    // İlk konumu hemen gönder
    konumGuncelle(seciliTalep.id);
    // Sonra her 15 saniyede bir gönder
    const talepId = seciliTalep.id;
    intervalRef.current = setInterval(() => konumGuncelle(talepId), 15000);
  }

  async function isiTamamla() {
    if (!seciliTalep || !sofor) return;
    setIslemYapiliyor(true);
    // Stop interval
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setTakipAktif(false);
    const { error } = await supabase.from("talepler")
      .update({ durum: "tamamlandi" })
      .eq("id", seciliTalep.id);
    setIslemYapiliyor(false);
    if (!error) {
      setSeciliTalep(null);
      setMusteriDetay(null);
      taleplerYukle(sofor.id);
    } else setHata("Hata: " + error.message);
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // If tracking is already active (page refresh on yolda talep), resume interval
  useEffect(() => {
    if (takipAktif && seciliTalep && !intervalRef.current) {
      const talepId = seciliTalep.id;
      konumGuncelle(talepId);
      intervalRef.current = setInterval(() => konumGuncelle(talepId), 15000);
    }
  }, [takipAktif, seciliTalep]); // eslint-disable-line

  function cikisYap() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    localStorage.removeItem("sofor");
    router.push("/sofor");
  }

  if (!sofor) return null;

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex flex-col max-w-md mx-auto">
      {/* HEADER */}
      <header className="h-14 flex items-center justify-between px-4 bg-[#1A1A1A] border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FF4D00] flex items-center justify-center text-xs font-black">
            {sofor.ad[0]}{sofor.soyad?.[0] || ""}
          </div>
          <div>
            <div className="text-xs font-bold">{sofor.ad} {sofor.soyad}</div>
            <div className="text-[10px] text-gray-500">Şoför Paneli</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {takipAktif && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              Takip Açık
            </div>
          )}
          <button onClick={cikisYap} className="text-[10px] text-gray-500 bg-[#2A2A2A] border border-white/8 px-2.5 py-1.5 rounded-lg">Çıkış</button>
        </div>
      </header>

      {hata && (
        <div className="mx-4 mt-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl">
          ⚠️ {hata} <button onClick={() => setHata("")} className="ml-2 underline">Kapat</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 pb-6">

        {/* Talep seçilmemişse — talep listesi */}
        {!seciliTalep && (
          <div>
            <div className="font-black text-base mb-1">Atanan Görevler</div>
            <div className="text-xs text-gray-500 mb-4">Aktif görevleriniz aşağıda listelenmiştir.</div>

            {yukleniyor ? (
              <div className="text-center py-16 text-gray-500 text-sm">Yükleniyor...</div>
            ) : talepler.length === 0 ? (
              <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-10 text-center">
                <div className="text-4xl mb-3">📋</div>
                <div className="text-gray-500 text-sm">Şu an atanmış görev yok</div>
                <div className="text-gray-600 text-xs mt-1">Firma talep atadığında burada görünecek</div>
              </div>
            ) : talepler.map(t => (
              <div
                key={t.id}
                onClick={() => talepSec(t)}
                className={`bg-[#1A1A1A] border rounded-2xl p-4 mb-3 cursor-pointer transition hover:border-[#FF4D00]/40 ${t.durum === "yolda" ? "border-blue-500/30" : "border-white/8"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FF4D00]/10 flex items-center justify-center text-base">🚛</div>
                    <div>
                      <div className="font-bold text-sm">{t.tip} Talebi</div>
                      <div className="text-[11px] text-gray-500">{new Date(t.created_at).toLocaleString("tr-TR")}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                    t.durum === "yolda" ? "bg-blue-500/10 text-blue-400 border-blue-500/25 animate-pulse" :
                    "bg-[#00C853]/10 text-[#00C853] border-[#00C853]/25"
                  }`}>
                    {t.durum === "yolda" ? "🚛 YOLDA" : "✓ KABUL"}
                  </span>
                </div>
                {t.musteri_ad && <div className="text-xs text-gray-400">👤 {t.musteri_ad}</div>}
                {t.arac_plaka && <div className="text-xs text-gray-500 mt-0.5">🚗 {t.arac_plaka}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Talep detay görünümü */}
        {seciliTalep && (
          <div>
            <button onClick={() => { setSeciliTalep(null); setMusteriDetay(null); if (!takipAktif && intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } }} className="text-xs text-gray-500 hover:text-white transition mb-4 block">
              ← Geri
            </button>

            <div className="flex items-center justify-between mb-4">
              <div className="font-black text-base">{seciliTalep.tip} Talebi</div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                seciliTalep.durum === "yolda" ? "bg-blue-500/10 text-blue-400 border-blue-500/25" :
                "bg-[#00C853]/10 text-[#00C853] border-[#00C853]/25"
              }`}>
                {seciliTalep.durum === "yolda" ? "🚛 YOLDA" : "✓ KABUL"}
              </span>
            </div>

            {/* Müşteri bilgileri */}
            <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-4 mb-3">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Müşteri Bilgileri</div>

              {seciliTalep.musteri_ad && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center text-base font-bold">
                    {seciliTalep.musteri_ad[0] || "?"}
                  </div>
                  <div className="font-bold">{seciliTalep.musteri_ad}</div>
                </div>
              )}

              {seciliTalep.musteri_tel && (
                <a
                  href={`tel:${seciliTalep.musteri_tel}`}
                  className="flex items-center gap-3 bg-blue-500/8 border border-blue-500/20 rounded-xl p-3 mb-3"
                >
                  <span className="text-xl">📞</span>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Telefon — aramak için tıkla</div>
                    <div className="font-bold text-blue-400 text-sm mt-0.5">{seciliTalep.musteri_tel}</div>
                  </div>
                </a>
              )}

              {/* Araç bilgileri */}
              <div className="bg-[#2A2A2A] border border-white/5 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚗</span>
                  <div>
                    {seciliTalep.arac_plaka ? (
                      <div className="font-black text-sm tracking-wider">{seciliTalep.arac_plaka}</div>
                    ) : (
                      <div className="text-xs text-gray-500">Plaka belirtilmemiş</div>
                    )}
                    {musteriDetay && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {[musteriDetay.arac_marka, musteriDetay.arac_model, musteriDetay.yakit_tipi, musteriDetay.cekis_turu].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Konum bilgileri */}
            <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-4 mb-3">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Konum Bilgileri</div>

              {seciliTalep.konum_lat && seciliTalep.konum_lng ? (
                <a
                  href={`https://maps.google.com/?q=${seciliTalep.konum_lat},${seciliTalep.konum_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 bg-[#2A2A2A] border border-white/5 rounded-xl p-3 mb-3"
                >
                  <span className="text-xl mt-0.5">📍</span>
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Aracın Bulunduğu Yer — haritada aç</div>
                    <div className="text-sm font-semibold mt-0.5 text-[#FF4D00]">
                      {seciliTalep.konum_adres || `${seciliTalep.konum_lat.toFixed(5)}, ${seciliTalep.konum_lng.toFixed(5)}`}
                    </div>
                    <div className="text-[10px] text-gray-600 mt-0.5">
                      {seciliTalep.konum_lat.toFixed(6)}, {seciliTalep.konum_lng.toFixed(6)}
                    </div>
                  </div>
                  <span className="text-gray-500">→</span>
                </a>
              ) : (
                <div className="text-xs text-gray-500 p-3">Müşteri konum paylaşmamış</div>
              )}

              {seciliTalep.hedef_adres && (
                <div className="flex items-start gap-3 bg-[#2A2A2A] border border-white/5 rounded-xl p-3">
                  <span className="text-xl mt-0.5">🎯</span>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Hedef Adres</div>
                    <div className="text-sm font-semibold mt-0.5">{seciliTalep.hedef_adres}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Not */}
            {seciliTalep.aciklama && (
              <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-3 text-xs text-yellow-200 mb-3">
                💬 &ldquo;{seciliTalep.aciklama}&rdquo;
              </div>
            )}

            {/* Şoförün son konum bilgisi */}
            {sonKonum && takipAktif && (
              <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-3 mb-3 text-xs text-blue-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  <span className="font-bold">Konum aktarılıyor</span>
                </div>
                <div className="text-blue-400/70 mt-0.5">
                  {sonKonum.lat.toFixed(5)}, {sonKonum.lng.toFixed(5)} · Müşteri ekranında görünüyor
                </div>
              </div>
            )}

            {/* Aksiyon butonları */}
            <div className="space-y-2 mt-4">
              {seciliTalep.durum === "kabul" && (
                <button
                  onClick={iseBasla}
                  disabled={islemYapiliyor}
                  className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-4 rounded-xl transition text-sm"
                >
                  {islemYapiliyor ? "Başlatılıyor..." : "🚛 İşe Başla — Konumumu Paylaş"}
                </button>
              )}
              {(seciliTalep.durum === "yolda" || takipAktif) && (
                <button
                  onClick={isiTamamla}
                  disabled={islemYapiliyor}
                  className="w-full bg-[#00C853] hover:bg-[#00a844] disabled:opacity-40 text-black font-bold py-4 rounded-xl transition text-sm"
                >
                  {islemYapiliyor ? "İşleniyor..." : "✔ İşi Tamamla"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

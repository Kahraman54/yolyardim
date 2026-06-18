"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function formatSure(ms: number): string {
  const sn = Math.floor(ms / 1000), dk = Math.floor(sn / 60), sa = Math.floor(dk / 60);
  return sa > 0 ? `${sa}s ${dk % 60}dk` : `${dk}dk ${sn % 60}sn`;
}

type SoforKayit = { id: string; ad: string; soyad: string; tel: string; firma_id: string; };
type MusteriDetay = { arac_marka?: string; arac_model?: string; cekis_turu?: string; yakit_tipi?: string; };
type Talep = {
  id: string; tip: string; durum: string; is_adim?: string; created_at: string;
  musteri_id?: string; musteri_ad?: string; musteri_tel?: string;
  arac_plaka?: string; konum_lat?: number; konum_lng?: number; konum_adres?: string;
  hedef_adres?: string; aciklama?: string;
  ise_baslama_zamani?: string; ise_bitis_zamani?: string; toplam_km?: number;
  foto_teslim_alma?: string[]; foto_yukleme?: string[]; foto_teslim?: string[]; foto_tutanak?: string[];
};
type Adim = "liste" | "detay" | "yolda" | "teslim_alma" | "yukleme" | "teslimat" | "teslim_foto" | "tutanak" | "ozet";
type FotoStep = "teslim_alma" | "yukleme" | "teslim" | "tutanak";

const DB_TO_ADIM: Record<string, Adim> = {
  yolda: "yolda", arac_yaninda: "teslim_alma", yukleniyor: "yukleme",
  teslimat_yolunda: "teslimat", teslimatta: "teslim_foto",
  tutanak: "tutanak", tamamlandi: "ozet",
};
const ADIM_SIRALAMA: Adim[] = ["yolda", "teslim_alma", "yukleme", "teslimat", "teslim_foto", "tutanak"];
const ADIM_ETIKET: Record<string, string> = {
  yolda: "Yolda", teslim_alma: "Teslim", yukleme: "Yükleme",
  teslimat: "Teslimat", teslim_foto: "Teslim Foto", tutanak: "Tutanak",
};

export default function SoforPanel() {
  const router = useRouter();
  const [sofor, setSofor] = useState<SoforKayit | null>(null);
  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [seciliTalep, setSeciliTalep] = useState<Talep | null>(null);
  const [musteriDetay, setMusteriDetay] = useState<MusteriDetay | null>(null);
  const [adim, setAdim] = useState<Adim>("liste");
  const [fotolar, setFotolar] = useState<Record<FotoStep, string[]>>({
    teslim_alma: [], yukleme: [], teslim: [], tutanak: [],
  });
  const [toplamKm, setToplamKm] = useState(0);
  const [gecenSure, setGecenSure] = useState("00:00");
  const [sonKonum, setSonKonum] = useState<{ lat: number; lng: number } | null>(null);
  const [fotoHata, setFotoHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemYapiliyor, setIslemYapiliyor] = useState(false);
  const [fotoYukleniyor, setFotoYukleniyor] = useState(false);
  const [fotoProgress, setFotoProgress] = useState({ done: 0, total: 0 });
  const [lightbox, setLightbox] = useState<{ urls: string[]; idx: number } | null>(null);
  const aktifFotoStepRef = useRef<FotoStep | null>(null);

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPosRef   = useRef<{ lat: number; lng: number } | null>(null);
  const toplamKmRef  = useRef(0);
  const kmAktifRef   = useRef(false);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const k = localStorage.getItem("sofor");
    if (!k) { router.replace("/sofor"); return; }
    try { setSofor(JSON.parse(k)); } catch { router.replace("/sofor"); }
  }, [router]);

  const taleplerYukle = useCallback(async (soforId: string) => {
    const { data } = await supabase
      .from("talepler")
      .select("id, tip, durum, is_adim, created_at, musteri_id, musteri_ad, musteri_tel, arac_plaka, konum_lat, konum_lng, konum_adres, hedef_adres, aciklama, ise_baslama_zamani, ise_bitis_zamani, toplam_km, foto_teslim_alma, foto_yukleme, foto_teslim, foto_tutanak")
      .eq("atanan_sofor", soforId)
      .in("durum", ["kabul", "yolda"])
      .order("created_at", { ascending: false });
    setTalepler(data || []);
    setYukleniyor(false);
  }, []);

  useEffect(() => { if (sofor) taleplerYukle(sofor.id); }, [sofor, taleplerYukle]);

  function talepSec(t: Talep) {
    setSeciliTalep(t);
    if (t.musteri_id) supabase.from("musteriler").select("arac_marka, arac_model, cekis_turu, yakit_tipi").eq("id", t.musteri_id).single().then(({ data }) => setMusteriDetay(data));
    const km = t.toplam_km || 0;
    setToplamKm(km); toplamKmRef.current = km;
    setFotolar({
      teslim_alma: (t.foto_teslim_alma as string[] || []).filter(Boolean),
      yukleme:     (t.foto_yukleme     as string[] || []).filter(Boolean),
      teslim:      (t.foto_teslim      as string[] || []).filter(Boolean),
      tutanak:     (t.foto_tutanak     as string[] || []).filter(Boolean),
    });
    setFotoHata("");
    if (t.durum === "tamamlandi" || t.is_adim === "tamamlandi") { setAdim("ozet"); return; }
    const yerelAdim = t.is_adim ? (DB_TO_ADIM[t.is_adim] || "detay") : "detay";
    setAdim(yerelAdim);
    if (yerelAdim === "yolda" || yerelAdim === "teslimat") { kmAktifRef.current = true; startGPS(t.id); }
  }

  function startGPS(talepId: string) {
    if (intervalRef.current) return;
    konumGuncelle(talepId);
    intervalRef.current = setInterval(() => konumGuncelle(talepId), 15000);
  }
  function stopGPS() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    kmAktifRef.current = false; prevPosRef.current = null;
  }
  function konumGuncelle(talepId: string) {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      setSonKonum({ lat, lng });
      let km = toplamKmRef.current;
      if (kmAktifRef.current && prevPosRef.current) {
        const d = haversine(prevPosRef.current.lat, prevPosRef.current.lng, lat, lng);
        if (d < 0.5) { km += d; toplamKmRef.current = km; setToplamKm(km); }
      }
      prevPosRef.current = { lat, lng };
      await supabase.from("talepler").update({
        sofor_konum_lat: lat, sofor_konum_lng: lng,
        sofor_konum_updated_at: new Date().toISOString(), toplam_km: km,
      }).eq("id", talepId);
    }, () => {
      // Sessizce yoksay, interval bir sonraki denemede tekrar çalışacak
    }, { timeout: 10000, maximumAge: 5000 });
  }

  useEffect(() => {
    if (!seciliTalep?.ise_baslama_zamani || ["ozet","liste","detay"].includes(adim)) return;
    const timer = setInterval(() => {
      const ms = Date.now() - new Date(seciliTalep.ise_baslama_zamani!).getTime();
      const sn = Math.floor(ms/1000), dk = Math.floor(sn/60), sa = Math.floor(dk/60);
      setGecenSure(sa > 0 ? `${sa}:${String(dk%60).padStart(2,"0")}:${String(sn%60).padStart(2,"0")}` : `${String(dk).padStart(2,"0")}:${String(sn%60).padStart(2,"0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [seciliTalep?.ise_baslama_zamani, adim]);

  useEffect(() => () => stopGPS(), []);

  // === Fotoğraf yükleme — tek input, birden fazla dosya ===
  function fotoSec(step: FotoStep) {
    aktifFotoStepRef.current = step;
    if (fotoInputRef.current) { fotoInputRef.current.value = ""; fotoInputRef.current.click(); }
  }

  async function handleFotoSecme(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !seciliTalep) return;
    const step = aktifFotoStepRef.current;
    if (!step) return;
    setFotoHata("");
    setFotoYukleniyor(true);
    setFotoProgress({ done: 0, total: files.length });
    const yeniUrller: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mevcut = fotolar[step].length + yeniUrller.length;
      const path = `talepler/${seciliTalep.id}/${step}/${Date.now()}_${mevcut}.jpg`;
      const { data, error } = await supabase.storage.from("belgeler").upload(path, file, { contentType: file.type || "image/jpeg", upsert: true });
      if (error) { setFotoHata(`Fotoğraf ${i+1} yüklenemedi: ${error.message}`); }
      else { yeniUrller.push(supabase.storage.from("belgeler").getPublicUrl(data.path).data.publicUrl); }
      setFotoProgress({ done: i + 1, total: files.length });
    }
    setFotolar(prev => ({ ...prev, [step]: [...prev[step], ...yeniUrller] }));
    setFotoYukleniyor(false);
    if (fotoInputRef.current) fotoInputRef.current.value = "";
  }

  function fotoCikar(step: FotoStep, idx: number) {
    setFotolar(prev => ({ ...prev, [step]: prev[step].filter((_, i) => i !== idx) }));
  }

  // === İş akışı ===
  async function iseBasla() {
    if (!seciliTalep) return;
    setIslemYapiliyor(true);
    let lat = 0, lng = 0;
    try { const p = await new Promise<GeolocationPosition>((r,j) => navigator.geolocation.getCurrentPosition(r,j,{timeout:10000})); lat=p.coords.latitude; lng=p.coords.longitude; } catch {}
    const { error } = await supabase.from("talepler").update({
      durum:"yolda", is_adim:"yolda", ise_baslama_zamani: new Date().toISOString(),
      baslangic_lat: lat||null, baslangic_lng: lng||null,
      sofor_konum_lat: lat||null, sofor_konum_lng: lng||null, sofor_konum_updated_at: new Date().toISOString(),
    }).eq("id", seciliTalep.id);
    setIslemYapiliyor(false);
    if (error) { setFotoHata(error.message); return; }
    setSeciliTalep(p => p ? { ...p, durum:"yolda", is_adim:"yolda", ise_baslama_zamani: new Date().toISOString() } : p);
    setAdim("yolda"); kmAktifRef.current = true; startGPS(seciliTalep.id);
  }

  async function dbAdimGec(dbAdim: string, yerelAdim: Adim, extra?: Record<string,unknown>) {
    if (!seciliTalep) return;
    await supabase.from("talepler").update({ is_adim: dbAdim, ...extra }).eq("id", seciliTalep.id);
    setAdim(yerelAdim);
  }

  async function araciYukle() {
    stopGPS();
    await dbAdimGec("yukleniyor", "yukleme", { foto_teslim_alma: fotolar.teslim_alma });
  }
  async function teslimatYoluna() {
    await dbAdimGec("teslimat_yolunda", "teslimat", { foto_yukleme: fotolar.yukleme });
    kmAktifRef.current = true; startGPS(seciliTalep!.id);
  }
  async function teslimEttim() {
    stopGPS();
    await dbAdimGec("teslimatta", "teslim_foto");
  }
  async function devamTutanak() {
    await dbAdimGec("tutanak", "tutanak", { foto_teslim: fotolar.teslim });
  }
  async function isiTamamla() {
    if (!seciliTalep) return;
    setIslemYapiliyor(true);
    const bitisTarih = new Date().toISOString();
    await supabase.from("talepler").update({
      durum:"tamamlandi", is_adim:"tamamlandi", ise_bitis_zamani: bitisTarih,
      foto_tutanak: fotolar.tutanak, toplam_km: toplamKmRef.current,
    }).eq("id", seciliTalep.id);
    setIslemYapiliyor(false);
    setSeciliTalep(p => p ? { ...p, ise_bitis_zamani: bitisTarih } : p);
    setAdim("ozet");
    if (sofor) taleplerYukle(sofor.id);
  }

  const tel = (t?: string) => { if (!t) return ""; const n = t.replace(/\D/g,""); return n.startsWith("0") ? n : "0"+n; };
  function cikis() { stopGPS(); localStorage.removeItem("sofor"); router.push("/sofor"); }

  const kmAktif = adim === "yolda" || adim === "teslimat";
  const adimSira = ADIM_SIRALAMA.indexOf(adim);

  // Fotoğraf bölümü bileşeni
  function FotoBlok({ step, baslik, aciklama, devamButon, devamAksiyon, devamDisabled }: {
    step: FotoStep; baslik: string; aciklama: string;
    devamButon: string; devamAksiyon: () => void; devamDisabled?: boolean;
  }) {
    const arr = fotolar[step];
    return (
      <div>
        <div className="font-black text-lg mb-1">{baslik}</div>
        <div className="text-gray-500 text-xs mb-5">{aciklama}</div>

        {fotoHata && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-3 flex items-center justify-between">
            <span>⚠️ {fotoHata}</span>
            <button onClick={() => setFotoHata("")} className="underline ml-2">Kapat</button>
          </div>
        )}

        {/* Yükleme butonu */}
        <button
          onClick={() => fotoSec(step)}
          disabled={fotoYukleniyor}
          className="w-full flex items-center justify-center gap-3 bg-[#FF4D00]/10 hover:bg-[#FF4D00]/20 border-2 border-dashed border-[#FF4D00]/50 hover:border-[#FF4D00] text-[#FF4D00] font-bold py-4 rounded-2xl transition disabled:opacity-40 mb-4"
        >
          {fotoYukleniyor ? (
            <><span className="animate-spin">⏳</span> Yükleniyor {fotoProgress.done}/{fotoProgress.total}...</>
          ) : (
            <><span className="text-xl">📷</span> {arr.length > 0 ? "Daha Fazla Fotoğraf Ekle" : "Fotoğraf Seç"}</>
          )}
        </button>

        {/* Yüklenen fotoğraflar */}
        {arr.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {arr.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[#00C853]/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`foto-${i+1}`} className="w-full h-full object-cover cursor-pointer" onClick={() => setLightbox({ urls: arr, idx: i })} />
                <button
                  onClick={() => fotoCikar(step, i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center hover:bg-red-500 transition"
                >✕</button>
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-[9px] text-center py-0.5 text-[#00C853] font-bold">{i+1}</div>
              </div>
            ))}
          </div>
        )}

        {arr.length > 0 && (
          <div className="flex items-center justify-between text-xs mb-5">
            <span className="text-[#00C853] font-bold">✓ {arr.length} fotoğraf yüklendi</span>
            <span className="text-gray-500">İstediğiniz kadar ekleyebilirsiniz</span>
          </div>
        )}

        <button
          onClick={devamAksiyon}
          disabled={devamDisabled || islemYapiliyor || arr.length === 0}
          className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-4 rounded-xl transition text-sm"
        >
          {islemYapiliyor ? "Kaydediliyor..." : devamButon}
        </button>
        {arr.length === 0 && <p className="text-center text-xs text-gray-600 mt-2">Devam etmek için en az 1 fotoğraf ekleyin</p>}
      </div>
    );
  }

  if (!sofor) return null;

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#1A1A1A] border-b border-white/5 flex-shrink-0">
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
          {kmAktif && sonKonum && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>GPS
            </div>
          )}
          <button onClick={cikis} className="text-[10px] text-gray-500 bg-[#2A2A2A] border border-white/8 px-2.5 py-1.5 rounded-lg">Çıkış</button>
        </div>
      </header>


      {/* Adım göstergesi */}
      {!["liste","detay","ozet"].includes(adim) && (
        <div className="px-4 pt-3 pb-2 bg-[#1A1A1A] border-b border-white/5">
          <div className="flex items-center">
            {ADIM_SIRALAMA.map((s, i) => {
              const gecildi = i < adimSira, aktif = i === adimSira;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${gecildi ? "bg-[#00C853] border-[#00C853] text-black" : aktif ? "border-[#FF4D00] text-[#FF4D00] bg-[#FF4D00]/10" : "border-white/10 text-gray-600"}`}>
                      {gecildi ? "✓" : i+1}
                    </div>
                    <div className={`text-[8px] font-bold mt-0.5 ${aktif ? "text-[#FF4D00]" : gecildi ? "text-[#00C853]" : "text-gray-600"}`}>{ADIM_ETIKET[s]}</div>
                  </div>
                  {i < ADIM_SIRALAMA.length-1 && <div className={`flex-1 h-0.5 mx-0.5 mb-3 ${gecildi ? "bg-[#00C853]" : "bg-white/10"}`}></div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tek gizli input — multiple */}
      <input ref={fotoInputRef} type="file" accept="image/*" multiple onChange={handleFotoSecme} className="hidden" />

      <div className="flex-1 overflow-y-auto p-4 pb-10">

        {/* LİSTE */}
        {adim === "liste" && (
          <div>
            <div className="font-black text-base mb-1">Atanan Görevler</div>
            <div className="text-xs text-gray-500 mb-4">Aktif görevleriniz aşağıda listelenmektedir.</div>
            {yukleniyor ? (
              <div className="text-center py-16 text-gray-500 text-sm">Yükleniyor...</div>
            ) : talepler.length === 0 ? (
              <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-10 text-center">
                <div className="text-4xl mb-3">📋</div>
                <div className="text-gray-500 text-sm">Atanmış görev yok</div>
              </div>
            ) : talepler.map(t => (
              <div key={t.id} onClick={() => talepSec(t)} className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-4 mb-3 cursor-pointer hover:border-[#FF4D00]/40 transition">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FF4D00]/10 flex items-center justify-center">🚛</div>
                    <div>
                      <div className="font-bold text-sm">{t.tip} Talebi</div>
                      <div className="text-[11px] text-gray-500">{new Date(t.created_at).toLocaleString("tr-TR")}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${t.durum==="yolda"?"bg-blue-500/10 text-blue-400 border-blue-500/25 animate-pulse":"bg-[#00C853]/10 text-[#00C853] border-[#00C853]/25"}`}>
                    {t.durum==="yolda"?"🚛 YOLDA":"✓ KABUL"}
                  </span>
                </div>
                {t.musteri_ad && <div className="text-xs text-gray-400">👤 {t.musteri_ad}</div>}
                {(t.toplam_km||0)>0 && <div className="text-xs text-gray-500 mt-0.5">📍 {(t.toplam_km||0).toFixed(1)} km</div>}
              </div>
            ))}
          </div>
        )}

        {/* DETAY */}
        {adim === "detay" && seciliTalep && (
          <div>
            <button onClick={() => { setSeciliTalep(null); setAdim("liste"); }} className="text-xs text-gray-500 hover:text-white mb-4 block">← Geri</button>
            <div className="font-black text-base mb-4">{seciliTalep.tip} Talebi</div>
            <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-4 mb-3">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Müşteri Bilgileri</div>
              {seciliTalep.musteri_ad && <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center font-bold">{seciliTalep.musteri_ad[0]}</div><div className="font-bold">{seciliTalep.musteri_ad}</div></div>}
              {seciliTalep.musteri_tel && (
                <a href={`tel:${tel(seciliTalep.musteri_tel)}`} className="flex items-center gap-3 bg-blue-500/8 border border-blue-500/20 rounded-xl p-3 mb-3">
                  <span className="text-xl">📞</span>
                  <div className="flex-1"><div className="text-[10px] text-gray-500 uppercase font-bold">Telefon</div><div className="font-bold text-blue-400 text-sm">{tel(seciliTalep.musteri_tel)}</div></div>
                  <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-1 rounded-lg font-bold">Ara →</span>
                </a>
              )}
              <div className="bg-[#2A2A2A] rounded-xl p-3 flex items-center gap-3">
                <span className="text-2xl">🚗</span>
                <div>
                  <div className="font-black text-sm">{seciliTalep.arac_plaka || "Plaka belirtilmemiş"}</div>
                  {musteriDetay && <div className="text-xs text-gray-500">{[musteriDetay.arac_marka, musteriDetay.arac_model, musteriDetay.yakit_tipi, musteriDetay.cekis_turu].filter(Boolean).join(" · ")}</div>}
                </div>
              </div>
            </div>
            {seciliTalep.konum_lat && (
              <a href={`https://maps.google.com/?q=${seciliTalep.konum_lat},${seciliTalep.konum_lng}`} target="_blank" rel="noopener noreferrer" className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-4 mb-3 flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div className="flex-1"><div className="text-[10px] text-gray-500 uppercase font-bold">Aracın Yeri</div><div className="text-sm font-semibold text-[#FF4D00]">{seciliTalep.konum_adres || `${seciliTalep.konum_lat?.toFixed(5)}, ${seciliTalep.konum_lng?.toFixed(5)}`}</div></div>
                <span className="text-gray-400">→</span>
              </a>
            )}
            {seciliTalep.hedef_adres && <div className="bg-[#1A1A1A] border border-white/8 rounded-xl p-3 mb-3 flex items-center gap-2"><span>🎯</span><div><div className="text-[10px] text-gray-500 uppercase font-bold">Hedef</div><div className="text-sm font-semibold">{seciliTalep.hedef_adres}</div></div></div>}
            {seciliTalep.aciklama && <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-3 text-xs text-yellow-200 mb-4">💬 &ldquo;{seciliTalep.aciklama}&rdquo;</div>}
            {fotoHata && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-3">⚠️ {fotoHata}</div>}
            <button onClick={iseBasla} disabled={islemYapiliyor} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-4 rounded-xl transition text-sm">
              {islemYapiliyor ? "Başlatılıyor..." : "🚛 İşe Başla — Yola Çık"}
            </button>
          </div>
        )}

        {/* YOLDA */}
        {adim === "yolda" && seciliTalep && (
          <div>
            <div className="font-black text-2xl mb-1">Yolda 🚛</div>
            <div className="text-gray-500 text-xs mb-5">Müşteriye gidiyorsunuz. GPS ve KM takibi aktif.</div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#1A1A1A] border border-white/8 rounded-xl p-4 text-center"><div className="text-2xl font-black text-[#FF4D00]">{gecenSure}</div><div className="text-[10px] text-gray-500 mt-1">Geçen Süre</div></div>
              <div className="bg-[#1A1A1A] border border-white/8 rounded-xl p-4 text-center"><div className="text-2xl font-black">{toplamKm.toFixed(1)}<span className="text-sm font-normal text-gray-500"> km</span></div><div className="text-[10px] text-gray-500 mt-1">Kilometre</div></div>
            </div>
            {sonKonum && <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-3 mb-4 text-xs text-blue-300 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0"></span>Konumunuz müşteriye iletiliyor</div>}
            {seciliTalep.musteri_tel && <a href={`tel:${tel(seciliTalep.musteri_tel)}`} className="flex items-center gap-3 bg-[#1A1A1A] border border-white/8 rounded-xl p-3 mb-3"><span className="text-xl">📞</span><div><div className="text-[10px] text-gray-500">Müşteri</div><div className="font-bold text-blue-400">{seciliTalep.musteri_ad} · {tel(seciliTalep.musteri_tel)}</div></div></a>}
            {seciliTalep.konum_lat && <a href={`https://maps.google.com/?q=${seciliTalep.konum_lat},${seciliTalep.konum_lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#1A1A1A] border border-white/8 rounded-xl p-3 mb-6"><span className="text-xl">📍</span><div className="flex-1"><div className="text-[10px] text-gray-500">Müşterinin Konumu</div><div className="text-sm font-semibold text-[#FF4D00]">{seciliTalep.konum_adres || "Haritada Aç"}</div></div><span className="text-gray-400">→</span></a>}
            <button onClick={() => dbAdimGec("arac_yaninda","teslim_alma")} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold py-4 rounded-xl transition text-sm">📍 Araç Yanına Vardım</button>
          </div>
        )}

        {/* TESLİM ALMA */}
        {adim === "teslim_alma" && seciliTalep && (
          <FotoBlok
            step="teslim_alma"
            baslik="📸 Teslim Alma Fotoğrafları"
            aciklama="Araç çekilmeden önce fotoğraf çekin. İstediğiniz kadar ekleyebilirsiniz."
            devamButon="🔗 Aracı Yükle →"
            devamAksiyon={araciYukle}
          />
        )}

        {/* YÜKLEME */}
        {adim === "yukleme" && seciliTalep && (
          <FotoBlok
            step="yukleme"
            baslik="🔗 Yükleme Fotoğrafları"
            aciklama="Araç bağlandıktan sonra fotoğraf çekin."
            devamButon="🚛 Teslimata Git →"
            devamAksiyon={teslimatYoluna}
          />
        )}

        {/* TESLİMAT YOLUNDA */}
        {adim === "teslimat" && seciliTalep && (
          <div>
            <div className="font-black text-2xl mb-1">Teslimata Gidiliyor 🎯</div>
            <div className="text-gray-500 text-xs mb-5">Araç yüklendi, hedefe gidiyorsunuz.</div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#1A1A1A] border border-white/8 rounded-xl p-4 text-center"><div className="text-2xl font-black text-[#FF4D00]">{gecenSure}</div><div className="text-[10px] text-gray-500 mt-1">Toplam Süre</div></div>
              <div className="bg-[#1A1A1A] border border-white/8 rounded-xl p-4 text-center"><div className="text-2xl font-black">{toplamKm.toFixed(1)}<span className="text-sm font-normal text-gray-500"> km</span></div><div className="text-[10px] text-gray-500 mt-1">Kilometre</div></div>
            </div>
            {seciliTalep.hedef_adres && <div className="bg-[#1A1A1A] border border-white/8 rounded-xl p-3 mb-4 flex items-center gap-2"><span>🎯</span><div><div className="text-[10px] text-gray-500 uppercase font-bold">Hedef</div><div className="text-sm font-semibold">{seciliTalep.hedef_adres}</div></div></div>}
            {sonKonum && <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-3 mb-6 text-xs text-blue-300 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0"></span>GPS aktif</div>}
            <button onClick={teslimEttim} className="w-full bg-[#00C853] hover:bg-[#00a844] text-black font-bold py-4 rounded-xl transition text-sm">✅ Teslim Ettim</button>
          </div>
        )}

        {/* TESLİM FOTOĞRAFLARI */}
        {adim === "teslim_foto" && seciliTalep && (
          <FotoBlok
            step="teslim"
            baslik="🏁 Teslim Fotoğrafları"
            aciklama="Araç teslim edildi. Fotoğraf çekin."
            devamButon="Devam Et →"
            devamAksiyon={devamTutanak}
          />
        )}

        {/* TUTANAK */}
        {adim === "tutanak" && seciliTalep && (
          <div>
            <div className="font-black text-lg mb-1">📄 Teslim Tutanağı</div>
            <div className="text-gray-500 text-xs mb-5">Müşteri teslim tutanağı imzaladıysa fotoğrafını ekleyin. İsteğe bağlıdır.</div>

            {fotoHata && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-3 flex items-center justify-between">
                <span>⚠️ {fotoHata}</span>
                <button onClick={() => setFotoHata("")} className="underline ml-2">Kapat</button>
              </div>
            )}

            <button
              onClick={() => fotoSec("tutanak")}
              disabled={fotoYukleniyor}
              className="w-full flex items-center justify-center gap-3 bg-[#FF4D00]/10 hover:bg-[#FF4D00]/20 border-2 border-dashed border-[#FF4D00]/50 hover:border-[#FF4D00] text-[#FF4D00] font-bold py-4 rounded-2xl transition disabled:opacity-40 mb-4"
            >
              {fotoYukleniyor ? <><span className="animate-spin">⏳</span> Yükleniyor...</> : <><span className="text-xl">📄</span> Tutanak Fotoğrafı Ekle</>}
            </button>

            {fotolar.tutanak.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {fotolar.tutanak.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[#00C853]/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="tutanak" className="w-full h-full object-cover cursor-pointer" onClick={() => setLightbox({ urls: fotolar.tutanak, idx: i })} />
                    <button onClick={() => fotoCikar("tutanak", i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center hover:bg-red-500">✕</button>
                  </div>
                ))}
              </div>
            )}

            {fotolar.tutanak.length > 0 && <div className="text-xs text-[#00C853] font-bold mb-4">✓ {fotolar.tutanak.length} tutanak fotoğrafı eklendi</div>}

            <button onClick={isiTamamla} disabled={islemYapiliyor}
              className="w-full bg-[#00C853] hover:bg-[#00a844] disabled:opacity-40 text-black font-bold py-4 rounded-xl transition text-sm">
              {islemYapiliyor ? "Kaydediliyor..." : "✔ İşi Tamamla"}
            </button>
          </div>
        )}

        {/* ÖZET */}
        {adim === "ozet" && seciliTalep && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="font-black text-2xl mb-2">İş Tamamlandı!</div>
            <div className="text-gray-500 text-sm mb-8">Tüm bilgiler sisteme kaydedildi.</div>
            <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-5 text-left space-y-3 mb-6">
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <span className="text-xl">👤</span><div className="flex-1"><div className="text-xs text-gray-500">Müşteri</div><div className="font-bold">{seciliTalep.musteri_ad || "—"}</div></div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <span className="text-xl">🚗</span><div className="flex-1"><div className="text-xs text-gray-500">Araç</div><div className="font-bold">{seciliTalep.arac_plaka || "—"}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-white/5">
                <div><div className="text-xs text-gray-500">Toplam KM</div><div className="font-black text-xl text-[#FF4D00]">{toplamKm.toFixed(1)} km</div></div>
                <div><div className="text-xs text-gray-500">Süre</div><div className="font-black text-xl">{seciliTalep.ise_baslama_zamani && seciliTalep.ise_bitis_zamani ? formatSure(new Date(seciliTalep.ise_bitis_zamani).getTime() - new Date(seciliTalep.ise_baslama_zamani).getTime()) : gecenSure}</div></div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-2">Fotoğraflar</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {([["Teslim Alma","teslim_alma"],["Yükleme","yukleme"],["Teslim","teslim"],["Tutanak","tutanak"]] as [string, FotoStep][]).map(([l, k]) => (
                    <div key={k} className="bg-[#2A2A2A] rounded-xl p-2">
                      <div className="font-black text-lg text-[#00C853]">{fotolar[k].length}</div>
                      <div className="text-[9px] text-gray-500 mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => { setSeciliTalep(null); setAdim("liste"); if (sofor) taleplerYukle(sofor.id); }}
              className="w-full bg-[#1A1A1A] border border-white/10 hover:border-white/30 text-white font-bold py-3 rounded-xl transition">
              Ana Sayfaya Dön
            </button>
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col" onClick={() => setLightbox(null)}>
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <span className="text-sm text-gray-400">{lightbox.idx + 1} / {lightbox.urls.length}</span>
            <button onClick={() => setLightbox(null)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-lg">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center px-2 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.urls[lightbox.idx]} alt="tam ekran" className="max-w-full max-h-full object-contain rounded-xl" />
          </div>
          {lightbox.urls.length > 1 && (
            <div className="flex justify-center gap-4 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
              <button onClick={() => setLightbox(l => l && l.idx > 0 ? { ...l, idx: l.idx - 1 } : l)}
                disabled={lightbox.idx === 0}
                className="w-12 h-12 rounded-full bg-white/10 disabled:opacity-20 flex items-center justify-center text-xl">‹</button>
              <div className="flex items-center gap-1.5">
                {lightbox.urls.map((_, i) => (
                  <button key={i} onClick={() => setLightbox(l => l ? { ...l, idx: i } : l)}
                    className={`w-2 h-2 rounded-full transition ${i === lightbox.idx ? "bg-white" : "bg-white/30"}`} />
                ))}
              </div>
              <button onClick={() => setLightbox(l => l && l.idx < l.urls.length - 1 ? { ...l, idx: l.idx + 1 } : l)}
                disabled={lightbox.idx === lightbox.urls.length - 1}
                className="w-12 h-12 rounded-full bg-white/10 disabled:opacity-20 flex items-center justify-center text-xl">›</button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { supabase } from "../../lib/supabase";
import { apiPost, apiPatch } from "../../lib/api";

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1a2332" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a9bb0" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a2332" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a3a4a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#2d4a6a" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3a5a8a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d1b2a" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

type Musteri = {
  id: string; tel: string; ad?: string; soyad?: string;
  arac_marka?: string; arac_model?: string; arac_plaka?: string;
  cekis_turu?: string; yakit_tipi?: string;
};
type Firma = { id: string; firma_ad: string; lat?: number; lng?: number; il?: string; ilce?: string; hizmet_tipi?: string; tel?: string; adres?: string; };
type Talep = {
  id: string; created_at: string; tip: string; durum: string;
  firma_id?: string; hedef_adres?: string; aciklama?: string;
  konum_lat?: number; konum_lng?: number;
  sofor_konum_lat?: number; sofor_konum_lng?: number; sofor_konum_updated_at?: string;
  fiyat_teklifi?: number;
  musteri_puani?: number; musteri_yorumu?: string;
  toplam_km?: number; ise_baslama_zamani?: string; ise_bitis_zamani?: string;
  foto_teslim_alma?: string[]; foto_yukleme?: string[]; foto_teslim?: string[]; foto_tutanak?: string[];
};
type Toast = { id: string; mesaj: string; tip: "bilgi" | "basari" | "uyari"; };

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function formatSure(ms: number): string {
  const sn = Math.floor(ms/1000), dk = Math.floor(sn/60), sa = Math.floor(dk/60);
  return sa > 0 ? `${sa}s ${dk%60}dk` : `${dk}dk`;
}

const DURUM_RENK: Record<string, string> = {
  yeni: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  teklif: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  kabul: "text-green-400 bg-green-500/10 border-green-500/20",
  yolda: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  tamamlandi: "text-[var(--text-2)] bg-gray-500/10 border-gray-500/20",
  reddedildi: "text-red-400 bg-red-500/10 border-red-500/20",
};
const DURUM_LABEL: Record<string, string> = {
  yeni: "⏳ Bekliyor",
  teklif: "💰 Fiyat Teklifi",
  kabul: "✅ Kabul Edildi",
  yolda: "🚛 Yolda",
  tamamlandi: "✔ Tamamlandı",
  reddedildi: "✕ Reddedildi",
};

function FlatIcon({ src, size = 24 }: { src: string; size?: number }) {
  return (
    <span
      className="flex-shrink-0 bg-current block"
      style={{
        width: size, height: size,
        maskImage: `url('${src}')`, maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center",
        WebkitMaskImage: `url('${src}')`, WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center",
      }}
    />
  );
}

export default function MusteriAna() {
  const router = useRouter();
  const [sayfa, setSayfa] = useState<"ana" | "talepler" | "gecmis" | "profil">("ana");
  const [musteri, setMusteri] = useState<Musteri | null>(null);
  const [firmalar, setFirmalar] = useState<Firma[]>([]);
  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [appHeight, setAppHeight] = useState("100dvh");
  const [gorunum, setGorunum] = useState<"harita" | "liste">("harita");
  const [seciliFirma, setSeciliFirma] = useState<Firma | null>(null);
  const [seciliHizmet, setSeciliHizmet] = useState<"cekici" | "lastikci" | null>(null);

  // Harita
  const [mapCenter, setMapCenter] = useState({ lat: 39.9334, lng: 32.8597 }); // Türkiye merkezi
  const [userKonum, setUserKonum] = useState<{ lat: number; lng: number } | null>(null);
  const [konumYukleniyor, setKonumYukleniyor] = useState(false);
  const [konumHata, setKonumHata] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const pendingCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  // SOS modal
  const [sosModal, setSosModal] = useState(false);
  const [sorunTip, setSorunTip] = useState("");
  const [hedef, setHedef] = useState("bilmiyorum");
  const [hedefAdres, setHedefAdres] = useState("");
  const [sosNot, setSosNot] = useState("");
  const [gonderildi, setGonderildi] = useState(false);
  const [enYakinFirma, setEnYakinFirma] = useState<Firma | null>(null);
  const [sosYukleniyor, setSosYukleniyor] = useState(false);

  // Puan modal
  const [puanModal, setPuanModal] = useState<Talep | null>(null);
  const [puan, setPuan] = useState(0);
  const [yorum, setYorum] = useState("");
  const [puanYukleniyor, setPuanYukleniyor] = useState(false);

  // İş özeti modal
  const [ozetModal, setOzetModal] = useState<Talep | null>(null);
  const [firmaDetayModal, setFirmaDetayModal] = useState<Firma | null>(null);
  const [lightbox, setLightbox] = useState<{ urls: string[]; idx: number } | null>(null);

  // Toast bildirimleri
  const [toastlar, setToastlar] = useState<Toast[]>([]);
  const prevTaleplerRef = useRef<Talep[]>([]);

  // Profil düzenleme
  const [profilForm, setProfilForm] = useState<Musteri>({ id: "", tel: "" });
  const [profilKayit, setProfilKayit] = useState(false);
  const [profilBasari, setProfilBasari] = useState("");

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
  });

  function addToast(mesaj: string, tip: Toast["tip"] = "bilgi") {
    const id = Date.now().toString();
    setToastlar(prev => [...prev, { id, mesaj, tip }]);
    setTimeout(() => setToastlar(prev => prev.filter(t => t.id !== id)), 5000);
  }

  useEffect(() => {
    const update = () => setAppHeight(`${window.innerHeight}px`);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Açık temada Google Haritalar varsayılan (gündüz) stiliyle gösterilir
  const [temaAcik, setTemaAcik] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTemaAcik(document.documentElement.getAttribute("data-theme") === "light");
  }, []);

  useEffect(() => {
    const kayit = localStorage.getItem("musteri");
    if (!kayit) { router.replace("/giris"); return; }
    try { const m = JSON.parse(kayit); setMusteri(m); setProfilForm(m); } catch { router.replace("/giris"); }
  }, [router]);

  useEffect(() => {
    supabase.from("firmalar").select("id, firma_ad, lat, lng, il, ilce, hizmet_tipi, tel, adres").eq("durum", "aktif")
      .then(({ data, error }) => {
        if (error) {
          // hizmet_tipi kolonu henüz DB'de yoksa onsuz dene
          supabase.from("firmalar").select("id, firma_ad, lat, lng, il, ilce").eq("durum", "aktif")
            .then(({ data: d2 }) => setFirmalar(d2 || []));
        } else {
          setFirmalar(data || []);
        }
      });
  }, []);

  const musteriIdRef = useRef<string | null>(null);
  useEffect(() => { musteriIdRef.current = musteri?.id || null; }, [musteri]);

  const taleplerYukle = useCallback(async (musteriId: string) => {
    const { data } = await supabase
      .from("talepler")
      .select("id, created_at, tip, durum, firma_id, hedef_adres, aciklama, konum_lat, konum_lng, sofor_konum_lat, sofor_konum_lng, sofor_konum_updated_at, fiyat_teklifi, musteri_puani, musteri_yorumu, toplam_km, ise_baslama_zamani, ise_bitis_zamani, foto_teslim_alma, foto_yukleme, foto_teslim, foto_tutanak")
      .eq("musteri_id", musteriId)
      .order("created_at", { ascending: false });
    const yeni = data || [];
    // Durum değişikliklerini tespit et → bildirim göster
    const prev = prevTaleplerRef.current;
    yeni.forEach(t => {
      const eskisi = prev.find(p => p.id === t.id);
      if (eskisi && eskisi.durum !== t.durum) {
        const mesajlar: Record<string, string> = {
          teklif: `💰 Fiyat teklifi geldi!${t.fiyat_teklifi ? ` ${t.fiyat_teklifi.toLocaleString("tr-TR")} ₺` : ""}`,
          kabul: "✅ Talebiniz kabul edildi!",
          yolda: "🚛 Şoför yola çıktı!",
          tamamlandi: "✔ İşiniz tamamlandı!",
          reddedildi: "✕ Talebiniz reddedildi.",
        };
        if (mesajlar[t.durum]) addToast(mesajlar[t.durum], t.durum === "reddedildi" ? "uyari" : "basari");
      }
    });
    prevTaleplerRef.current = yeni;
    setTalepler(yeni);
  }, []); // eslint-disable-line

  useEffect(() => { if (musteri?.id) taleplerYukle(musteri.id); }, [musteri, taleplerYukle]);

  // Otomatik yenile (aktif talepler varsa)
  useEffect(() => {
    const interval = setInterval(() => {
      if (musteriIdRef.current) taleplerYukle(musteriIdRef.current);
    }, 10000);
    return () => clearInterval(interval);
  }, [taleplerYukle]);

  // GPS
  function konumIste() {
    if (!navigator.geolocation) {
      setKonumHata("Tarayıcınız konum desteklemiyor.");
      return;
    }
    setKonumYukleniyor(true);
    setKonumHata(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserKonum(c);
        setMapCenter(c);
        if (mapRef.current) { mapRef.current.setCenter(c); mapRef.current.setZoom(14); }
        else pendingCenterRef.current = c;
        setKonumYukleniyor(false);
        setKonumHata(null);
      },
      (err) => {
        setKonumYukleniyor(false);
        if (err.code === 1) setKonumHata("Konum izni reddedildi. Tarayıcı ayarlarından izin verin.");
        else if (err.code === 3) setKonumHata("Konum alınamadı, zaman aşımı.");
        else setKonumHata("Konum alınamadı.");
      },
      { timeout: 12000, maximumAge: 10000, enableHighAccuracy: true }
    );
  }
  useEffect(() => { konumIste(); }, []); // eslint-disable-line

  const onLoad = useCallback((m: google.maps.Map) => {
    mapRef.current = m; setMap(m);
    if (pendingCenterRef.current) { m.setCenter(pendingCenterRef.current); pendingCenterRef.current = null; }
  }, []);
  const onUnmount = useCallback(() => { mapRef.current = null; setMap(null); }, []);

  // SOS
  function sosAc(belirli?: Firma) {
    if (belirli) { setEnYakinFirma(belirli); }
    else {
      const ref = userKonum || mapCenter;
      const lokasyonlu = firmalar
        .filter(f => {
          if (!f.lat || !f.lng) return false;
          if (seciliHizmet && f.hizmet_tipi && f.hizmet_tipi !== seciliHizmet && f.hizmet_tipi !== "her_ikisi") return false;
          if (userKonum && haversine(userKonum.lat, userKonum.lng, f.lat, f.lng) > 200) return false;
          return true;
        })
        .sort((a, b) =>
          haversine(ref.lat, ref.lng, a.lat!, a.lng!) - haversine(ref.lat, ref.lng, b.lat!, b.lng!)
        );
      setEnYakinFirma(lokasyonlu[0] || null);
    }
    setSeciliFirma(null); setSosModal(true);
  }

  async function sosGonder() {
    if (!sorunTip || !musteri) return;
    const konum = userKonum || mapCenter;
    if (!userKonum) {
      const devamEt = window.confirm("Konumunuz alınamadı. Yine de talebi göndermek istiyor musunuz?");
      if (!devamEt) return;
    }
    setSosYukleniyor(true);
    try {
      await apiPost("talepler", {
        musteri_id: musteri.id,
        musteri_ad: musteri.ad ? `${musteri.ad} ${musteri.soyad || ""}`.trim() : null,
        musteri_tel: musteri.tel,
        arac_plaka: musteri.arac_plaka || null,
        firma_id: enYakinFirma?.id || null,
        tip: sorunTip, durum: "yeni",
        hedef_adres: hedef === "belirli" ? (hedefAdres || null) : (hedef === "onersin" ? "Firma önersin" : null),
        aciklama: sosNot || null,
        konum_lat: konum.lat, konum_lng: konum.lng,
        konum_adres: `${konum.lat.toFixed(5)}, ${konum.lng.toFixed(5)}`,
      });
      setGonderildi(true); if (musteri.id) taleplerYukle(musteri.id);
    } catch (e) { alert("Hata: " + (e as Error).message); }
    setSosYukleniyor(false);
  }

  // Teklif onayla / reddet
  async function teklifOnayla(talepId: string) {
    await apiPatch("talepler", talepId, { durum: "kabul" });
    if (musteri?.id) taleplerYukle(musteri.id);
    addToast("✅ Teklif onaylandı!", "basari");
  }
  async function teklifReddet(talepId: string) {
    await apiPatch("talepler", talepId, { durum: "yeni", firma_id: null, atanan_sofor: null, atanan_arac: null, fiyat_teklifi: null });
    if (musteri?.id) taleplerYukle(musteri.id);
    addToast("Teklif reddedildi, yeni firma aranıyor.", "uyari");
  }

  // Puan ver
  async function puanVer() {
    if (!puanModal || puan === 0) return;
    setPuanYukleniyor(true);
    await apiPatch("talepler", puanModal.id, { musteri_puani: puan, musteri_yorumu: yorum || null });
    setPuanYukleniyor(false);
    setTalepler(prev => prev.map(t => t.id === puanModal.id ? { ...t, musteri_puani: puan, musteri_yorumu: yorum } : t));
    setPuanModal(null); setPuan(0); setYorum("");
    addToast("⭐ Değerlendirmeniz kaydedildi!", "basari");
  }

  // Profil kaydet
  async function profilKaydet() {
    if (!musteri?.id) return;
    setProfilKayit(true);
    try {
      await apiPatch("musteriler", musteri.id, {
        ad: profilForm.ad || null, soyad: profilForm.soyad || null,
        arac_marka: profilForm.arac_marka || null, arac_model: profilForm.arac_model || null,
        arac_plaka: profilForm.arac_plaka || null, cekis_turu: profilForm.cekis_turu || null,
        yakit_tipi: profilForm.yakit_tipi || null,
      });
      const updated = { ...musteri, ...profilForm };
      setMusteri(updated); localStorage.setItem("musteri", JSON.stringify(updated));
      setProfilBasari("Profil kaydedildi."); setTimeout(() => setProfilBasari(""), 3000);
    } catch { /* sessiz */ }
    setProfilKayit(false);
  }

  const aktivTalepler = talepler.filter(t => !["tamamlandi", "reddedildi"].includes(t.durum));
  const gecmisTalepler = talepler.filter(t => ["tamamlandi", "reddedildi"].includes(t.durum));
  const firmaAdi = (firmaId?: string) => firmaId ? (firmalar.find(f => f.id === firmaId)?.firma_ad || "—") : "—";
  const teklifBekleyen = aktivTalepler.filter(t => t.durum === "teklif").length;

  const ref = userKonum || mapCenter;
  const firmaFiltreli = firmalar
    .filter(f => {
      if (seciliHizmet && f.hizmet_tipi && f.hizmet_tipi !== seciliHizmet && f.hizmet_tipi !== "her_ikisi") return false;
      if (userKonum && f.lat && f.lng && haversine(userKonum.lat, userKonum.lng, f.lat, f.lng) > 200) return false;
      return true;
    })
    .sort((a, b) => {
      const kmA = a.lat && a.lng ? haversine(ref.lat, ref.lng, a.lat, a.lng) : 9999;
      const kmB = b.lat && b.lng ? haversine(ref.lat, ref.lng, b.lat, b.lng) : 9999;
      return kmA - kmB;
    });

  return (
    <main className="bg-[var(--bg)] text-[var(--text)] flex flex-col relative" style={{ height: appHeight }}>

      {/* Toast bildirimleri */}
      <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toastlar.map(t => (
          <div key={t.id} className={`w-full max-w-sm px-4 py-3 rounded-2xl text-sm font-bold shadow-2xl pointer-events-auto ${
            t.tip === "basari" ? "bg-[#00C853] text-black" :
            t.tip === "uyari" ? "bg-red-500 text-[var(--text)]" :
            "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]"
          }`}>
            {t.mesaj}
          </div>
        ))}
      </div>

      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)] flex-shrink-0 z-40">
        <div>
          <div className="text-xs text-[var(--text-3)]">Merhaba 👋</div>
          <div className="text-sm font-bold">
            {musteri?.ad ? `${musteri.ad}${musteri.soyad ? " " + musteri.soyad : ""}` : musteri?.tel || "Hoş geldin"}
          </div>
        </div>
        <Link href="/" className="w-10 h-10 bg-[var(--surface-2)] rounded-xl flex items-center justify-center flex-shrink-0 text-[var(--text-3)]">
          <FlatIcon src="/icons/svg/003-exit.svg" size={20} />
        </Link>
      </header>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">

        {/* ANA */}
        {sayfa === "ana" && (
          <div className="h-full flex flex-col">
            <div className="bg-[var(--surface)] border-b border-[var(--border)] flex-shrink-0 px-3 pt-2 pb-2.5 grid grid-cols-2 gap-2">
              <button onClick={() => setGorunum("harita")} className={`flex items-center justify-center gap-3 py-3 rounded-2xl transition font-semibold text-sm ${gorunum==="harita" ? "bg-[var(--accent)] text-[#0B0F14]" : "bg-[var(--surface-2)] text-[var(--text-2)]"}`}>
                <FlatIcon src="/icons/svg/002-map.svg" size={26} />
                Harita
              </button>
              <button onClick={() => setGorunum("liste")} className={`flex items-center justify-center gap-3 py-3 rounded-2xl transition font-semibold text-sm ${gorunum==="liste" ? "bg-[var(--accent)] text-[#0B0F14]" : "bg-[var(--surface-2)] text-[var(--text-2)]"}`}>
                <FlatIcon src="/icons/svg/007-business-and-trade.svg" size={26} />
                Firmalar ({firmaFiltreli.length})
              </button>
              <button onClick={() => setSeciliHizmet(s => s === "cekici" ? null : "cekici")} className={`flex items-center justify-center gap-3 py-3 rounded-2xl transition font-semibold text-sm ${seciliHizmet === "cekici" ? "bg-[var(--accent)] text-[#0B0F14]" : "bg-[var(--surface-2)] text-[var(--text-2)]"}`}>
                <FlatIcon src="/icons/svg/006-shipping.svg" size={26} />
                Çekici
              </button>
              <button onClick={() => setSeciliHizmet(s => s === "lastikci" ? null : "lastikci")} className={`flex items-center justify-center gap-3 py-3 rounded-2xl transition font-semibold text-sm ${seciliHizmet === "lastikci" ? "bg-[var(--accent)] text-[#0B0F14]" : "bg-[var(--surface-2)] text-[var(--text-2)]"}`}>
                <FlatIcon src="/icons/svg/004-car.svg" size={26} />
                Lastikçi
              </button>
            </div>
            <div className="flex-1 relative overflow-hidden">
              {gorunum === "harita" && (
                <>
                  {loadError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--panel)] gap-3 px-6 text-center">
                      <div className="text-4xl">🗺️</div><div className="text-[var(--text)] font-bold text-sm">Harita yüklenemedi</div>
                    </div>
                  ) : isLoaded ? (
                    <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={mapCenter} zoom={13} onLoad={onLoad} onUnmount={onUnmount} options={{ styles: temaAcik ? undefined : MAP_STYLE, disableDefaultUI: true }}>
                      {userKonum && <Marker position={userKonum} icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#0A84FF", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 3 }} />}
                      {firmaFiltreli.filter(f => f.lat && f.lng).map(f => {
                        const emoji = f.hizmet_tipi === "lastikci" ? "🔧" : "🚛";
                        return (
                          <Marker key={f.id} position={{ lat: f.lat!, lng: f.lng! }} onClick={() => setSeciliFirma(f)}
                            icon={{ url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="170" height="42"><rect x="0" y="0" width="170" height="34" rx="8" fill="${seciliFirma?.id === f.id ? '#00D4FF' : '#1A1A1A'}" stroke="#00D4FF" stroke-width="2"/><text x="10" y="22" font-family="Arial" font-size="12" font-weight="bold" fill="white">${emoji} ${f.firma_ad.split(' ').slice(0, 3).join(' ')}</text><polygon points="80,34 90,34 85,42" fill="#00D4FF"/></svg>`)}`, scaledSize: new google.maps.Size(170, 42), anchor: new google.maps.Point(85, 42) }} />
                        );
                      })}
                    </GoogleMap>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--panel)]"><div className="text-[var(--text-3)] text-sm">🗺️ Harita yükleniyor...</div></div>
                  )}
                  <div className="absolute right-3 top-3 flex flex-col gap-2 z-10">
                    <button onClick={() => map?.setZoom((map.getZoom() || 13) + 1)} className="w-9 h-9 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-lg shadow-lg">＋</button>
                    <button onClick={() => map?.setZoom((map.getZoom() || 13) - 1)} className="w-9 h-9 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-lg shadow-lg">－</button>
                    <button onClick={konumIste} className="w-9 h-9 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shadow-lg text-[var(--text)]">
                      {konumYukleniyor ? <span className="animate-spin text-sm">⏳</span> : <span className="block flex-shrink-0" style={{ width: 20, height: 20, backgroundImage: "url('/icons/svg/location.svg')", backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />}
                    </button>
                  </div>
                  <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] flex-shrink-0" style={{ boxShadow: "0 0 0 3px rgba(34,197,94,0.25)" }}></span>
                      <span className="text-[#111] font-semibold text-xs">
                        {firmaFiltreli.filter(f => f.lat && f.lng).length} {seciliHizmet === "cekici" ? "Çekici Firma" : seciliHizmet === "lastikci" ? "Lastikçi Firma" : "Aktif Firma"}
                      </span>
                    </div>
                    {konumHata && (
                      <div className="bg-black/70 border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-2)] max-w-[220px] flex items-center gap-2">
                        <span>📍 Konum izni yok</span>
                        <button onClick={() => setKonumHata(null)} className="text-[var(--text-3)] hover:text-[var(--text)] ml-1">✕</button>
                      </div>
                    )}
                  </div>
                  {seciliFirma && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] p-4 z-20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[var(--accent-soft)]/15 border border-[var(--accent-soft)]/20 flex items-center justify-center text-xl flex-shrink-0">🚛</div>
                          <div>
                            <div className="font-bold text-sm">{seciliFirma.firma_ad}</div>
                            {(seciliFirma.il || seciliFirma.ilce) && <div className="text-xs text-[var(--text-3)] mt-0.5">📍 {[seciliFirma.ilce, seciliFirma.il].filter(Boolean).join(" / ")}</div>}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25 px-2 py-0.5 rounded-full">✓ AKTİF</span>
                              {seciliFirma.lat && seciliFirma.lng && <span className="text-[10px] text-[var(--text-3)]">~{haversine(mapCenter.lat, mapCenter.lng, seciliFirma.lat, seciliFirma.lng).toFixed(1)} km</span>}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setSeciliFirma(null)} className="w-7 h-7 bg-[var(--surface-2)] rounded-lg text-[var(--text-2)] text-sm flex items-center justify-center flex-shrink-0">✕</button>
                      </div>
                      <button onClick={() => sosAc(seciliFirma)} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#0B0F14] font-bold py-3 rounded-xl transition text-sm">🆘 Bu Firmadan Yardım İste</button>
                    </div>
                  )}
                </>
              )}
              {gorunum === "liste" && (
                <div className="h-full overflow-y-auto p-3">
                  {userKonum && (
                    <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl px-3 py-2 mb-3 text-xs text-blue-300">
                      📍 Konumunuza en yakından en uzağa sıralandı · 200 km içi gösteriliyor
                    </div>
                  )}
                  {firmaFiltreli.length === 0 ? (
                    <div className="text-center py-14">
                      <div className="text-4xl mb-3">{seciliHizmet === "lastikci" ? "🔧" : "🚛"}</div>
                      <div className="text-[var(--text-3)] text-sm">{seciliHizmet ? `200 km içinde ${seciliHizmet === "lastikci" ? "lastikçi" : "çekici"} firma bulunamadı` : "Yakında aktif firma bulunamadı"}</div>
                    </div>
                  ) : firmaFiltreli.map(f => {
                    const km = f.lat && f.lng ? haversine(ref.lat, ref.lng, f.lat, f.lng) : null;
                    const emoji = f.hizmet_tipi === "lastikci" ? "🔧" : "🚛";
                    return (
                      <div key={f.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mb-3">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-[var(--accent-soft)]/10 border border-[var(--accent-soft)]/20 flex items-center justify-center text-xl flex-shrink-0">{emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm">{f.firma_ad}</div>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25 px-2 py-0.5 rounded-full">✓ AKTİF</span>
                              {f.hizmet_tipi && <span className="text-[10px] font-bold bg-[var(--hover)] text-[var(--text-2)] border border-[var(--border)] px-2 py-0.5 rounded-full">{f.hizmet_tipi === "lastikci" ? "Lastikçi" : f.hizmet_tipi === "her_ikisi" ? "Çekici & Lastikçi" : "Çekici"}</span>}
                              {(f.il || f.ilce) && <span className="text-[10px] text-[var(--text-3)]">📍 {[f.ilce, f.il].filter(Boolean).join(" / ")}</span>}
                            </div>
                          </div>
                          {km !== null && <div className="text-right flex-shrink-0"><div className="font-black text-lg">{km.toFixed(1)}</div><div className="text-[10px] text-[var(--text-3)]">km</div></div>}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => setFirmaDetayModal(f)} className="border border-[var(--border)] text-[var(--text-2)] font-bold py-2.5 rounded-xl text-sm">Detay</button>
                          <button onClick={() => sosAc(f)} className="bg-[var(--accent)] text-[#0B0F14] font-bold py-2.5 rounded-xl text-sm">🆘 Yardım İste</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AKTİF TALEPLER */}
        {sayfa === "talepler" && (
          <div className="h-full overflow-y-auto p-4">
            <h2 className="font-black text-lg mb-4">Aktif Talepler</h2>
            {aktivTalepler.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-4xl mb-3">📋</div>
                <div className="text-[var(--text-3)] text-sm">Aktif talebiniz yok</div>
                <div className="text-[var(--text-3)] text-xs mt-1">SOS butonuyla yardım talep edebilirsiniz</div>
              </div>
            ) : aktivTalepler.map(t => (
              <div key={t.id} className={`bg-[var(--surface)] border rounded-2xl p-4 mb-3 ${t.durum === "teklif" ? "border-purple-500/50" : "border-[var(--border)]"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-sm">{t.tip}</div>
                    <div className="text-xs text-[var(--text-3)] mt-0.5">{new Date(t.created_at).toLocaleString("tr-TR")}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${DURUM_RENK[t.durum] || "text-[var(--text-2)] bg-gray-500/10 border-gray-500/20"}`}>
                    {DURUM_LABEL[t.durum] || t.durum}
                  </span>
                </div>
                {t.firma_id && <div className="text-xs text-[var(--text-3)] mt-1">🚛 {firmaAdi(t.firma_id)}</div>}
                {t.hedef_adres && <div className="text-xs text-[var(--text-3)] mt-1">🎯 {t.hedef_adres}</div>}

                {/* Fiyat teklifi */}
                {t.durum === "teklif" && (
                  <div className="mt-3 bg-purple-500/8 border border-purple-500/20 rounded-2xl p-4">
                    <div className="text-xs text-purple-300 font-bold mb-2">💰 Firma Fiyat Teklifi Gönderdi</div>
                    {t.fiyat_teklifi ? (
                      <div className="font-black text-3xl text-[var(--text)] mb-3">{t.fiyat_teklifi.toLocaleString("tr-TR")} ₺</div>
                    ) : (
                      <div className="text-sm text-[var(--text-2)] mb-3">Fiyat belirtilmedi</div>
                    )}
                    <div className="text-[10px] text-[var(--text-3)] mb-3">🚛 {firmaAdi(t.firma_id)} tarafından gönderildi</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => teklifOnayla(t.id)} className="bg-[#00C853] hover:bg-[#00a844] text-black font-bold py-3 rounded-xl text-sm transition">✓ Onayla</button>
                      <button onClick={() => teklifReddet(t.id)} className="border border-red-500/30 text-red-400 hover:bg-red-500/8 font-bold py-3 rounded-xl text-sm transition">✕ Reddet</button>
                    </div>
                  </div>
                )}

                {/* Şoför canlı harita */}
                {t.durum === "yolda" && t.sofor_konum_lat && t.sofor_konum_lng && isLoaded && (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-blue-500/20">
                    <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-blue-400 uppercase">Şoför Canlı Konum</span>
                      {t.sofor_konum_updated_at && <span className="text-[10px] text-[var(--text-3)] ml-auto">⏱ {new Date(t.sofor_konum_updated_at).toLocaleTimeString("tr-TR")}</span>}
                    </div>
                    <GoogleMap mapContainerStyle={{ width: "100%", height: "200px" }} center={{ lat: t.sofor_konum_lat, lng: t.sofor_konum_lng }} zoom={14} options={{ styles: temaAcik ? undefined : MAP_STYLE, disableDefaultUI: true, zoomControl: false }}>
                      <Marker position={{ lat: t.sofor_konum_lat, lng: t.sofor_konum_lng }}
                        icon={{ url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><circle cx="18" cy="18" r="16" fill="#00D4FF" stroke="#fff" stroke-width="3"/><text x="18" y="24" text-anchor="middle" font-size="16">🚛</text></svg>')}`, scaledSize: new google.maps.Size(36, 36), anchor: new google.maps.Point(18, 18) }} />
                      {t.konum_lat && t.konum_lng && (
                        <Marker position={{ lat: t.konum_lat, lng: t.konum_lng }}
                          icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#0A84FF", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2 }} />
                      )}
                    </GoogleMap>
                  </div>
                )}
                {t.durum === "yolda" && !t.sofor_konum_lat && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-blue-400/70 bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>Şoför yola çıktı, konum bekleniyor...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* GEÇMİŞ */}
        {sayfa === "gecmis" && (
          <div className="h-full overflow-y-auto p-4">
            <h2 className="font-black text-lg mb-4">Geçmiş Talepler</h2>
            {gecmisTalepler.length === 0 ? (
              <div className="text-center py-14"><div className="text-4xl mb-3">🕐</div><div className="text-[var(--text-3)] text-sm">Geçmiş talep bulunmuyor</div></div>
            ) : gecmisTalepler.map(t => (
              <div key={t.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl mb-3 overflow-hidden">
                <div className="p-4" onClick={() => t.durum === "tamamlandi" && setOzetModal(t)} style={{ cursor: t.durum === "tamamlandi" ? "pointer" : "default" }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-sm">{t.tip}</div>
                      <div className="text-xs text-[var(--text-3)] mt-0.5">{new Date(t.created_at).toLocaleString("tr-TR")}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${DURUM_RENK[t.durum] || "text-[var(--text-2)] bg-gray-500/10 border-gray-500/20"}`}>
                      {DURUM_LABEL[t.durum] || t.durum}
                    </span>
                  </div>
                  {t.firma_id && <div className="text-xs text-[var(--text-3)]">🚛 {firmaAdi(t.firma_id)}</div>}
                  {t.fiyat_teklifi && <div className="text-xs text-[var(--accent-text)] font-bold mt-1">💰 {t.fiyat_teklifi.toLocaleString("tr-TR")} ₺</div>}
                  {t.durum === "tamamlandi" && <div className="text-[10px] text-[var(--text-3)] mt-1">Detaylar için tıklayın →</div>}
                </div>
                {/* Puan ver butonu */}
                {t.durum === "tamamlandi" && (
                  <div className="border-t border-[var(--border)] px-4 py-3">
                    {t.musteri_puani ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className={`text-base ${s <= t.musteri_puani! ? "text-yellow-400" : "text-[var(--text-3)]"}`}>★</span>)}</div>
                        <span className="text-xs text-[var(--text-3)]">{t.musteri_yorumu || "Değerlendirdiniz"}</span>
                      </div>
                    ) : (
                      <button onClick={() => { setPuanModal(t); setPuan(0); setYorum(""); }}
                        className="w-full text-xs font-bold text-yellow-400 bg-yellow-500/8 border border-yellow-500/20 py-2 rounded-xl">
                        ⭐ Firma Değerlendir
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PROFİL */}
        {sayfa === "profil" && (
          <div className="h-full overflow-y-auto p-4">
            <h2 className="font-black text-lg mb-4">Profilim</h2>
            {profilBasari && <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-3 rounded-xl mb-4">✓ {profilBasari}</div>}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mb-4">
              <div className="text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest mb-3">Kişisel Bilgiler</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-xs text-[var(--text-3)] mb-1">Ad</label><input value={profilForm.ad || ""} onChange={e => setProfilForm(p => ({ ...p, ad: e.target.value }))} placeholder="Adın" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" /></div>
                <div><label className="block text-xs text-[var(--text-3)] mb-1">Soyad</label><input value={profilForm.soyad || ""} onChange={e => setProfilForm(p => ({ ...p, soyad: e.target.value }))} placeholder="Soyadın" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" /></div>
              </div>
              <div><label className="block text-xs text-[var(--text-3)] mb-1">Telefon</label><input value={profilForm.tel || ""} disabled className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-3)] cursor-not-allowed" /></div>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mb-4">
              <div className="text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest mb-3">Araç Bilgileri</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-xs text-[var(--text-3)] mb-1">Marka</label><input value={profilForm.arac_marka || ""} onChange={e => setProfilForm(p => ({ ...p, arac_marka: e.target.value }))} placeholder="Ford..." className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" /></div>
                <div><label className="block text-xs text-[var(--text-3)] mb-1">Model</label><input value={profilForm.arac_model || ""} onChange={e => setProfilForm(p => ({ ...p, arac_model: e.target.value }))} placeholder="Focus..." className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" /></div>
              </div>
              <div className="mb-3"><label className="block text-xs text-[var(--text-3)] mb-1">Plaka</label><input value={profilForm.arac_plaka || ""} onChange={e => setProfilForm(p => ({ ...p, arac_plaka: e.target.value.toUpperCase() }))} placeholder="34 ABC 123" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" /></div>
              <div className="mb-3">
                <label className="block text-xs text-[var(--text-3)] mb-2">Çekiş Türü</label>
                <div className="grid grid-cols-2 gap-2">
                  {["4x4 / AWD","Önden Çekiş","Arkadan İtiş","Diğer"].map(v => (
                    <button key={v} onClick={() => setProfilForm(p => ({ ...p, cekis_turu: v }))} className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${profilForm.cekis_turu === v ? "border-[var(--accent)] bg-[var(--accent-soft)]/10 text-[var(--accent-text)]" : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-2)]"}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-3)] mb-2">Yakıt Tipi</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Benzin","Dizel","Benzin/LPG","Elektrik"].map(v => (
                    <button key={v} onClick={() => setProfilForm(p => ({ ...p, yakit_tipi: v }))} className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${profilForm.yakit_tipi === v ? "border-[var(--accent)] bg-[var(--accent-soft)]/10 text-[var(--accent-text)]" : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-2)]"}`}>{v}</button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={profilKaydet} disabled={profilKayit} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-[var(--text)] font-bold py-3 rounded-xl transition text-sm mb-3">{profilKayit ? "Kaydediliyor..." : "Kaydet"}</button>
            <button onClick={() => { localStorage.removeItem("musteri"); router.push("/"); }} className="w-full border border-[var(--border)] text-[var(--text-3)] py-3 rounded-xl text-sm">Çıkış Yap</button>
          </div>
        )}
      </div>

      {/* ALT NAVİGASYON */}
      <nav className="flex bg-[var(--surface)] border-t border-[var(--border)] flex-shrink-0 relative z-50" style={{ height: 68 }}>

        {/* Ana Sayfa */}
        <button onClick={() => setSayfa("ana")} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${sayfa === "ana" ? "text-[var(--accent-text)]" : "text-[var(--text-3)]"}`}>
          <FlatIcon src="/icons/svg/001-home.svg" size={24} />
          <span className="text-[10px] font-medium">Ana Sayfa</span>
        </button>

        {/* Talepler */}
        <button onClick={() => setSayfa("talepler")} className={`flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors ${sayfa === "talepler" ? "text-[var(--accent-text)]" : "text-[var(--text-3)]"}`}>
          <FlatIcon src="/icons/svg/008-approve.svg" size={24} />
          <span className="text-[10px] font-medium">Talepler</span>
          {(aktivTalepler.length > 0 || teklifBekleyen > 0) && (
            <span className={`absolute top-2 right-[calc(50%-14px)] w-2 h-2 rounded-full ${teklifBekleyen > 0 ? "bg-purple-400 animate-pulse" : "bg-[var(--accent)]"}`}></span>
          )}
        </button>

        {/* Yardım İste — Merkez */}
        <div className="flex-1 relative flex flex-col items-center justify-end pb-2">
          <button
            onClick={() => sosAc()}
            className="absolute w-[68px] h-[68px] rounded-full bg-[var(--accent)] overflow-hidden active:scale-95 transition-transform left-1/2 -translate-x-1/2"
            style={{ top: -34, boxShadow: "0 0 0 4px #111111, 0 0 0 6px rgba(0,212,255,0.5), 0 8px 24px rgba(0,212,255,0.4)" }}
          >
            <img src="/tulpar-logo-v3.png" alt="Tulpar" className="w-full h-full object-contain p-2.5" style={{ filter: "brightness(0)" }} />
          </button>
          <span className="text-[10px] font-medium text-[var(--text-3)]">Yardım İste</span>
        </div>

        {/* Geçmiş */}
        <button onClick={() => setSayfa("gecmis")} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${sayfa === "gecmis" ? "text-[var(--accent-text)]" : "text-[var(--text-3)]"}`}>
          <FlatIcon src="/icons/svg/009-time-past.svg" size={24} />
          <span className="text-[10px] font-medium">Geçmiş</span>
        </button>

        {/* Profil */}
        <button onClick={() => setSayfa("profil")} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${sayfa === "profil" ? "text-[var(--accent-text)]" : "text-[var(--text-3)]"}`}>
          <FlatIcon src="/icons/svg/010-user.svg" size={24} />
          <span className="text-[10px] font-medium">Profil</span>
        </button>

      </nav>

      {/* SOS MODAL */}
      {sosModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50" onClick={() => { setSosModal(false); setGonderildi(false); }}>
          <div className="bg-[var(--surface)] rounded-t-2xl w-full max-w-md p-5 pb-10 max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-[var(--surface-2)] rounded-full mx-auto mb-4"></div>
            {!gonderildi ? (
              <>
                <div className="font-black text-lg mb-1">🆘 Yardım İste</div>
                {enYakinFirma ? (
                  <div className="bg-[var(--accent-soft)]/10 border border-[var(--accent-soft)]/20 rounded-xl p-3 mb-4">
                    <div className="text-[10px] text-[var(--accent-text)] font-bold mb-0.5 uppercase">En Yakın Aktif Firma</div>
                    <div className="font-bold text-sm">{enYakinFirma.firma_ad}</div>
                    {enYakinFirma.lat && enYakinFirma.lng && <div className="text-xs text-[var(--text-3)] mt-0.5">~{haversine(mapCenter.lat, mapCenter.lng, enYakinFirma.lat, enYakinFirma.lng).toFixed(1)} km uzakta</div>}
                  </div>
                ) : <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4 text-xs text-yellow-300">⚠️ Yakında aktif firma bulunamadı. Talep yine de iletilecek.</div>}
                {(musteri?.arac_marka || musteri?.arac_plaka) && (
                  <div className="bg-[var(--surface-2)] rounded-xl p-3 mb-4 text-xs text-[var(--text-2)] flex items-center gap-2">
                    <span className="text-base">🚗</span><span>{[musteri?.arac_marka, musteri?.arac_model, musteri?.arac_plaka, musteri?.yakit_tipi].filter(Boolean).join(" · ")}</span>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-[var(--text-2)] mb-2">Ne yardımı istiyorsun? *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[["🚛","Çekici"],["🔧","Kurtarma"],["🔄","Lastik"],["🔋","Akü"],["⛽","Yakıt"],["🔑","Çilingir"]].map(([ic, lb]) => (
                      <button key={lb} onClick={() => setSorunTip(lb)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition ${sorunTip === lb ? "border-[var(--accent)] bg-[var(--accent-soft)]/8 text-[var(--accent-text)]" : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-2)]"}`}>
                        <span className="text-xl">{ic}</span><span className="text-[10px] font-bold">{lb}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-[var(--text-2)] mb-2">Araç nereye çekilsin?</label>
                  <div className="space-y-2">
                    {[["bilmiyorum","🤷","Henüz bilmiyorum","Sonradan düzenleyebilirsin"],["belirli","📍","Belirli bir adres","Servis veya ev adresi gir"],["onersin","💡","Firma önersin","En yakın servisi bulsun"]].map(([v, ic, lb, ac]) => (
                      <div key={v}>
                        <div onClick={() => setHedef(v)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${hedef === v ? "border-[var(--accent)] bg-[var(--accent-soft)]/6" : "border-[var(--border)] bg-[var(--surface-2)]"}`}>
                          <span className="text-lg">{ic}</span>
                          <div className="flex-1"><div className="text-sm font-bold">{lb}</div><div className="text-xs text-[var(--text-3)]">{ac}</div></div>
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${hedef === v ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border-2)]"}`} style={hedef === v ? { boxShadow: "inset 0 0 0 3px #2A2A2A" } : {}} />
                        </div>
                        {v === "belirli" && hedef === "belirli" && <input value={hedefAdres} onChange={e => setHedefAdres(e.target.value)} placeholder="Örn: Kadıköy Ford Servisi" className="w-full mt-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-xs font-bold text-[var(--text-2)] mb-2">Not</label>
                  <textarea value={sosNot} onChange={e => setSosNot(e.target.value)} placeholder="Araç sağ tarafında, lastik patlak..." rows={2} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] resize-none" />
                </div>
                <button onClick={sosGonder} disabled={!sorunTip || sosYukleniyor} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[var(--text)] font-bold py-3.5 rounded-xl transition text-sm">{sosYukleniyor ? "Gönderiliyor..." : "🚨 Talebi Gönder"}</button>
                <button onClick={() => setSosModal(false)} className="w-full mt-2 border border-[var(--border)] text-[var(--text-3)] py-3 rounded-xl text-sm">İptal</button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">✅</div>
                <div className="font-black text-xl mb-2">Talep Gönderildi!</div>
                {enYakinFirma && <p className="text-[var(--accent-text)] font-bold text-sm mb-2">{enYakinFirma.firma_ad}</p>}
                <p className="text-[var(--text-3)] text-sm mb-6 leading-relaxed">Firma fiyat teklifi gönderdiğinde bildirim alacaksınız.</p>
                <button onClick={() => { setSosModal(false); setGonderildi(false); setSorunTip(""); setSosNot(""); setHedefAdres(""); setHedef("bilmiyorum"); setSayfa("talepler"); }} className="w-full bg-[var(--accent)] text-[#0B0F14] font-bold py-3 rounded-xl">Talebi Görüntüle →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PUAN MODAL */}
      {puanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-5" onClick={() => setPuanModal(null)}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-black text-lg">Firmayı Değerlendir</div>
              <div className="text-xs text-[var(--text-3)] mt-1">🚛 {firmaAdi(puanModal.firma_id)}</div>
            </div>
            <div className="flex justify-center gap-3 mb-5">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setPuan(s)} className={`text-4xl transition-transform ${s <= puan ? "scale-110" : "opacity-30"}`}>★</button>
              ))}
            </div>
            <textarea value={yorum} onChange={e => setYorum(e.target.value)} placeholder="Yorumunuz (isteğe bağlı)..." rows={3} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] resize-none mb-4" />
            <button onClick={puanVer} disabled={puan === 0 || puanYukleniyor} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[var(--text)] font-bold py-3 rounded-xl transition text-sm">{puanYukleniyor ? "Kaydediliyor..." : "Değerlendirmeyi Gönder"}</button>
            <button onClick={() => setPuanModal(null)} className="w-full mt-2 border border-[var(--border)] text-[var(--text-3)] py-2.5 rounded-xl text-sm">Vazgeç</button>
          </div>
        </div>
      )}

      {/* İŞ ÖZETİ MODAL */}
      {ozetModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50" onClick={() => setOzetModal(null)}>
          <div className="bg-[var(--surface)] rounded-t-2xl w-full max-w-md p-5 pb-10 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-[var(--surface-2)] rounded-full mx-auto mb-5"></div>
            <div className="flex items-center gap-3 mb-5">
              <div className="text-4xl">✔</div>
              <div>
                <div className="font-black text-lg">İş Özeti</div>
                <div className="text-xs text-[var(--text-3)]">{new Date(ozetModal.created_at).toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" })}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-[var(--surface-2)] rounded-xl p-4">
                <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-2">Firma</div>
                <div className="font-bold">🚛 {firmaAdi(ozetModal.firma_id)}</div>
              </div>
              <div className="bg-[var(--surface-2)] rounded-xl p-4">
                <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-2">Hizmet</div>
                <div className="font-bold">{ozetModal.tip}</div>
                {ozetModal.hedef_adres && <div className="text-xs text-[var(--text-3)] mt-1">🎯 {ozetModal.hedef_adres}</div>}
              </div>
              {ozetModal.fiyat_teklifi && (
                <div className="bg-[var(--accent-soft)]/8 border border-[var(--accent-soft)]/20 rounded-xl p-4">
                  <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-1">Ücret</div>
                  <div className="font-black text-2xl text-[var(--accent-text)]">{ozetModal.fiyat_teklifi.toLocaleString("tr-TR")} ₺</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {ozetModal.toplam_km != null && ozetModal.toplam_km > 0 && (
                  <div className="bg-[var(--surface-2)] rounded-xl p-4 text-center">
                    <div className="font-black text-xl text-[var(--accent-text)]">{ozetModal.toplam_km.toFixed(1)}</div>
                    <div className="text-[10px] text-[var(--text-3)] mt-0.5">km çekildi</div>
                  </div>
                )}
                {ozetModal.ise_baslama_zamani && ozetModal.ise_bitis_zamani && (
                  <div className="bg-[var(--surface-2)] rounded-xl p-4 text-center">
                    <div className="font-black text-xl">{formatSure(new Date(ozetModal.ise_bitis_zamani).getTime() - new Date(ozetModal.ise_baslama_zamani).getTime())}</div>
                    <div className="text-[10px] text-[var(--text-3)] mt-0.5">süre</div>
                  </div>
                )}
              </div>
              {/* Fotoğraflar */}
              {(() => {
                const tumFotolar = [
                  ...(ozetModal.foto_teslim_alma || []),
                  ...(ozetModal.foto_yukleme || []),
                  ...(ozetModal.foto_teslim || []),
                  ...(ozetModal.foto_tutanak || []),
                ].filter(Boolean);
                return tumFotolar.length > 0 ? (
                  <div>
                    <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-2">{tumFotolar.length} Fotoğraf</div>
                    <div className="grid grid-cols-3 gap-2">
                      {tumFotolar.map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt={`foto-${i}`} className="aspect-square rounded-xl object-cover border border-[var(--border)] cursor-pointer" onClick={() => setLightbox({ urls: tumFotolar, idx: i })} />
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
              {/* Değerlendirme */}
              {ozetModal.musteri_puani ? (
                <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-xl p-4">
                  <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map(s => <span key={s} className={`text-lg ${s <= ozetModal.musteri_puani! ? "text-yellow-400" : "text-[var(--text-3)]"}`}>★</span>)}</div>
                  {ozetModal.musteri_yorumu && <div className="text-xs text-[var(--text-2)]">&ldquo;{ozetModal.musteri_yorumu}&rdquo;</div>}
                </div>
              ) : (
                <button onClick={() => { setOzetModal(null); setPuanModal(ozetModal); setPuan(0); setYorum(""); }}
                  className="w-full text-sm font-bold text-yellow-400 bg-yellow-500/8 border border-yellow-500/20 py-3 rounded-xl">
                  ⭐ Firma Değerlendir
                </button>
              )}
            </div>
            <button onClick={() => setOzetModal(null)} className="w-full mt-4 border border-[var(--border)] text-[var(--text-3)] py-3 rounded-xl text-sm">Kapat</button>
          </div>
        </div>
      )}

      {/* FİRMA DETAY MODALİ */}
      {firmaDetayModal && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-end" onClick={() => setFirmaDetayModal(null)}>
          <div className="w-full bg-[var(--surface)] rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)]/10 border border-[var(--accent-soft)]/20 flex items-center justify-center text-2xl flex-shrink-0">
                {firmaDetayModal.hizmet_tipi === "lastikci" ? "🔧" : firmaDetayModal.hizmet_tipi === "her_ikisi" ? "🚛" : "🚗"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-lg leading-tight">{firmaDetayModal.firma_ad}</div>
                <span className="text-[11px] font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25 px-2 py-0.5 rounded-full mt-1 inline-block">✓ AKTİF</span>
              </div>
              <button onClick={() => setFirmaDetayModal(null)} className="w-8 h-8 rounded-full bg-[var(--hover)] flex items-center justify-center text-[var(--text-2)] text-sm flex-shrink-0">✕</button>
            </div>

            <div className="space-y-3 mb-6">
              {firmaDetayModal.hizmet_tipi && (
                <div className="flex items-center gap-3 bg-[var(--hover)] rounded-xl px-4 py-3">
                  <span className="text-lg">🛠</span>
                  <div>
                    <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Hizmet Tipi</div>
                    <div className="text-sm font-semibold mt-0.5">
                      {firmaDetayModal.hizmet_tipi === "lastikci" ? "Lastikçi" : firmaDetayModal.hizmet_tipi === "her_ikisi" ? "Çekici & Lastikçi" : "Çekici"}
                    </div>
                  </div>
                </div>
              )}
              {(firmaDetayModal.il || firmaDetayModal.ilce) && (
                <div className="flex items-center gap-3 bg-[var(--hover)] rounded-xl px-4 py-3">
                  <span className="text-lg">📍</span>
                  <div>
                    <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Konum</div>
                    <div className="text-sm font-semibold mt-0.5">{[firmaDetayModal.ilce, firmaDetayModal.il].filter(Boolean).join(" / ")}</div>
                  </div>
                </div>
              )}
              {firmaDetayModal.adres && (
                <div className="flex items-start gap-3 bg-[var(--hover)] rounded-xl px-4 py-3">
                  <span className="text-lg">🏢</span>
                  <div>
                    <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Adres</div>
                    <div className="text-sm font-semibold mt-0.5">{firmaDetayModal.adres}</div>
                  </div>
                </div>
              )}
              {firmaDetayModal.tel && (
                <a href={`tel:${firmaDetayModal.tel}`} className="flex items-center gap-3 bg-[var(--hover)] rounded-xl px-4 py-3 active:bg-[var(--hover)] transition">
                  <span className="text-lg">📞</span>
                  <div className="flex-1">
                    <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Telefon</div>
                    <div className="text-sm font-semibold mt-0.5 text-[var(--accent-text)]">{firmaDetayModal.tel}</div>
                  </div>
                  <span className="text-[var(--text-3)] text-xs">Ara →</span>
                </a>
              )}
            </div>

            <button onClick={() => { setFirmaDetayModal(null); sosAc(firmaDetayModal); }} className="w-full bg-[var(--accent)] text-[#0B0F14] font-black py-3.5 rounded-xl text-sm">
              🆘 Bu Firmadan Yardım İste
            </button>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col" onClick={() => setLightbox(null)}>
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <span className="text-sm text-[var(--text-2)]">{lightbox.idx + 1} / {lightbox.urls.length}</span>
            <button onClick={() => setLightbox(null)} className="w-9 h-9 rounded-full bg-[var(--hover)] flex items-center justify-center text-[var(--text)] text-lg">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center px-2 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.urls[lightbox.idx]} alt="tam ekran" className="max-w-full max-h-full object-contain rounded-xl" />
          </div>
          {lightbox.urls.length > 1 && (
            <div className="flex justify-center gap-4 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
              <button onClick={() => setLightbox(l => l && l.idx > 0 ? { ...l, idx: l.idx - 1 } : l)}
                disabled={lightbox.idx === 0}
                className="w-12 h-12 rounded-full bg-[var(--hover)] disabled:opacity-20 flex items-center justify-center text-xl">‹</button>
              <div className="flex items-center gap-1.5">
                {lightbox.urls.map((_, i) => (
                  <button key={i} onClick={() => setLightbox(l => l ? { ...l, idx: i } : l)}
                    className={`w-2 h-2 rounded-full transition ${i === lightbox.idx ? "bg-white" : "bg-white/30"}`} />
                ))}
              </div>
              <button onClick={() => setLightbox(l => l && l.idx < l.urls.length - 1 ? { ...l, idx: l.idx + 1 } : l)}
                disabled={lightbox.idx === lightbox.urls.length - 1}
                className="w-12 h-12 rounded-full bg-[var(--hover)] disabled:opacity-20 flex items-center justify-center text-xl">›</button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

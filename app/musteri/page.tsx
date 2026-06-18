"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { supabase } from "../../lib/supabase";

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
type Firma = { id: string; firma_ad: string; lat?: number; lng?: number; il?: string; ilce?: string; };
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
  tamamlandi: "text-gray-400 bg-gray-500/10 border-gray-500/20",
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

export default function MusteriAna() {
  const router = useRouter();
  const [sayfa, setSayfa] = useState<"ana" | "talepler" | "gecmis" | "profil">("ana");
  const [musteri, setMusteri] = useState<Musteri | null>(null);
  const [firmalar, setFirmalar] = useState<Firma[]>([]);
  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [appHeight, setAppHeight] = useState("100dvh");
  const [gorunum, setGorunum] = useState<"harita" | "liste">("harita");
  const [seciliFirma, setSeciliFirma] = useState<Firma | null>(null);

  // Harita
  const [mapCenter, setMapCenter] = useState({ lat: 40.9837, lng: 29.021 });
  const [konumYukleniyor, setKonumYukleniyor] = useState(false);
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

  useEffect(() => {
    const kayit = localStorage.getItem("musteri");
    if (!kayit) { router.replace("/giris"); return; }
    try { const m = JSON.parse(kayit); setMusteri(m); setProfilForm(m); } catch { router.replace("/giris"); }
  }, [router]);

  useEffect(() => {
    supabase.from("firmalar").select("id, firma_ad, lat, lng, il, ilce").eq("durum", "aktif")
      .then(({ data }) => setFirmalar(data || []));
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
    if (!navigator.geolocation) return;
    setKonumYukleniyor(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapCenter(c);
        if (mapRef.current) mapRef.current.setCenter(c);
        else pendingCenterRef.current = c;
        setKonumYukleniyor(false);
      },
      () => setKonumYukleniyor(false),
      { timeout: 10000, maximumAge: 30000 }
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
      const lokasyonlu = firmalar.filter(f => f.lat && f.lng);
      if (lokasyonlu.length > 0) {
        setEnYakinFirma([...lokasyonlu].sort((a, b) =>
          haversine(mapCenter.lat, mapCenter.lng, a.lat!, a.lng!) - haversine(mapCenter.lat, mapCenter.lng, b.lat!, b.lng!))[0]);
      } else { setEnYakinFirma(null); }
    }
    setSeciliFirma(null); setSosModal(true);
  }

  async function sosGonder() {
    if (!sorunTip || !musteri) return;
    setSosYukleniyor(true);
    const { error } = await supabase.from("talepler").insert({
      musteri_id: musteri.id,
      musteri_ad: musteri.ad ? `${musteri.ad} ${musteri.soyad || ""}`.trim() : null,
      musteri_tel: musteri.tel,
      arac_plaka: musteri.arac_plaka || null,
      firma_id: enYakinFirma?.id || null,
      tip: sorunTip, durum: "yeni",
      hedef_adres: hedef === "belirli" ? (hedefAdres || null) : (hedef === "onersin" ? "Firma önersin" : null),
      aciklama: sosNot || null,
      konum_lat: mapCenter.lat, konum_lng: mapCenter.lng,
      konum_adres: `${mapCenter.lat.toFixed(5)}, ${mapCenter.lng.toFixed(5)}`,
    });
    setSosYukleniyor(false);
    if (!error) { setGonderildi(true); if (musteri.id) taleplerYukle(musteri.id); }
    else alert("Hata: " + error.message);
  }

  // Teklif onayla / reddet
  async function teklifOnayla(talepId: string) {
    await supabase.from("talepler").update({ durum: "kabul" }).eq("id", talepId);
    if (musteri?.id) taleplerYukle(musteri.id);
    addToast("✅ Teklif onaylandı!", "basari");
  }
  async function teklifReddet(talepId: string) {
    await supabase.from("talepler").update({ durum: "yeni", firma_id: null, atanan_sofor: null, atanan_arac: null, fiyat_teklifi: null }).eq("id", talepId);
    if (musteri?.id) taleplerYukle(musteri.id);
    addToast("Teklif reddedildi, yeni firma aranıyor.", "uyari");
  }

  // Puan ver
  async function puanVer() {
    if (!puanModal || puan === 0) return;
    setPuanYukleniyor(true);
    await supabase.from("talepler").update({ musteri_puani: puan, musteri_yorumu: yorum || null }).eq("id", puanModal.id);
    setPuanYukleniyor(false);
    setTalepler(prev => prev.map(t => t.id === puanModal.id ? { ...t, musteri_puani: puan, musteri_yorumu: yorum } : t));
    setPuanModal(null); setPuan(0); setYorum("");
    addToast("⭐ Değerlendirmeniz kaydedildi!", "basari");
  }

  // Profil kaydet
  async function profilKaydet() {
    if (!musteri?.id) return;
    setProfilKayit(true);
    const { error } = await supabase.from("musteriler").update({
      ad: profilForm.ad || null, soyad: profilForm.soyad || null,
      arac_marka: profilForm.arac_marka || null, arac_model: profilForm.arac_model || null,
      arac_plaka: profilForm.arac_plaka || null, cekis_turu: profilForm.cekis_turu || null,
      yakit_tipi: profilForm.yakit_tipi || null,
    }).eq("id", musteri.id);
    setProfilKayit(false);
    if (!error) {
      const updated = { ...musteri, ...profilForm };
      setMusteri(updated); localStorage.setItem("musteri", JSON.stringify(updated));
      setProfilBasari("Profil kaydedildi."); setTimeout(() => setProfilBasari(""), 3000);
    }
  }

  const aktivTalepler = talepler.filter(t => !["tamamlandi", "reddedildi"].includes(t.durum));
  const gecmisTalepler = talepler.filter(t => ["tamamlandi", "reddedildi"].includes(t.durum));
  const firmaAdi = (firmaId?: string) => firmaId ? (firmalar.find(f => f.id === firmaId)?.firma_ad || "—") : "—";
  const teklifBekleyen = aktivTalepler.filter(t => t.durum === "teklif").length;

  return (
    <main className="bg-[#0D0D0D] text-white flex flex-col relative overflow-hidden" style={{ height: appHeight }}>

      {/* Toast bildirimleri */}
      <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toastlar.map(t => (
          <div key={t.id} className={`w-full max-w-sm px-4 py-3 rounded-2xl text-sm font-bold shadow-2xl pointer-events-auto ${
            t.tip === "basari" ? "bg-[#00C853] text-black" :
            t.tip === "uyari" ? "bg-red-500 text-white" :
            "bg-[#1A1A1A] border border-white/10 text-white"
          }`}>
            {t.mesaj}
          </div>
        ))}
      </div>

      {/* HEADER */}
      <header className="h-14 flex items-center justify-between px-4 bg-[#1A1A1A] border-b border-white/5 flex-shrink-0 z-40">
        <div>
          <div className="text-xs text-gray-500">Merhaba 👋</div>
          <div className="text-sm font-bold">
            {musteri?.ad ? `${musteri.ad}${musteri.soyad ? " " + musteri.soyad : ""}` : musteri?.tel || "Hoş geldin"}
          </div>
        </div>
        <Link href="/" className="w-9 h-9 rounded-full bg-[#FF4D00] flex items-center justify-center text-xs font-black">←</Link>
      </header>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">

        {/* ANA */}
        {sayfa === "ana" && (
          <div className="h-full flex flex-col">
            <div className="flex gap-2 px-3 py-2 bg-[#1A1A1A] border-b border-white/5 flex-shrink-0">
              <button onClick={() => setGorunum("harita")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${gorunum==="harita"?"bg-[#FF4D00] text-white":"border border-white/10 text-gray-500"}`}>🗺️ Harita</button>
              <button onClick={() => setGorunum("liste")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${gorunum==="liste"?"bg-[#FF4D00] text-white":"border border-white/10 text-gray-500"}`}>📋 Firmalar ({firmalar.length})</button>
            </div>
            <div className="flex-1 relative overflow-hidden">
              {gorunum === "harita" && (
                <>
                  {loadError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a2332] gap-3 px-6 text-center">
                      <div className="text-4xl">🗺️</div><div className="text-white font-bold text-sm">Harita yüklenemedi</div>
                    </div>
                  ) : isLoaded ? (
                    <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={mapCenter} zoom={13} onLoad={onLoad} onUnmount={onUnmount} options={{ styles: MAP_STYLE, disableDefaultUI: true }}>
                      <Marker position={mapCenter} icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#0A84FF", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 3 }} />
                      {firmalar.filter(f => f.lat && f.lng).map(f => (
                        <Marker key={f.id} position={{ lat: f.lat!, lng: f.lng! }} onClick={() => setSeciliFirma(f)}
                          icon={{ url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="130" height="42"><rect x="0" y="0" width="130" height="34" rx="8" fill="${seciliFirma?.id === f.id ? '#FF4D00' : '#1A1A1A'}" stroke="#FF4D00" stroke-width="2"/><text x="10" y="22" font-family="Arial" font-size="12" font-weight="bold" fill="white">🚛 ${f.firma_ad.slice(0, 12)}</text><polygon points="60,34 70,34 65,42" fill="#FF4D00"/></svg>`)}`, scaledSize: new google.maps.Size(130, 42), anchor: new google.maps.Point(65, 42) }} />
                      ))}
                    </GoogleMap>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#1a2332]"><div className="text-gray-500 text-sm">🗺️ Harita yükleniyor...</div></div>
                  )}
                  <div className="absolute right-3 top-3 flex flex-col gap-2 z-10">
                    <button onClick={() => map?.setZoom((map.getZoom() || 13) + 1)} className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-lg shadow-lg">＋</button>
                    <button onClick={() => map?.setZoom((map.getZoom() || 13) - 1)} className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-lg shadow-lg">－</button>
                    <button onClick={konumIste} className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-base shadow-lg">{konumYukleniyor ? "⏳" : "📍"}</button>
                  </div>
                  <div className="absolute top-3 left-3 bg-[#1A1A1A]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white z-10">🚛 {firmalar.filter(f => f.lat && f.lng).length} aktif firma</div>
                  {seciliFirma && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-white/10 p-4 z-20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#FF4D00]/15 border border-[#FF4D00]/20 flex items-center justify-center text-xl flex-shrink-0">🚛</div>
                          <div>
                            <div className="font-bold text-sm">{seciliFirma.firma_ad}</div>
                            {(seciliFirma.il || seciliFirma.ilce) && <div className="text-xs text-gray-500 mt-0.5">📍 {[seciliFirma.ilce, seciliFirma.il].filter(Boolean).join(" / ")}</div>}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25 px-2 py-0.5 rounded-full">✓ AKTİF</span>
                              {seciliFirma.lat && seciliFirma.lng && <span className="text-[10px] text-gray-500">~{haversine(mapCenter.lat, mapCenter.lng, seciliFirma.lat, seciliFirma.lng).toFixed(1)} km</span>}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setSeciliFirma(null)} className="w-7 h-7 bg-[#2A2A2A] rounded-lg text-gray-400 text-sm flex items-center justify-center flex-shrink-0">✕</button>
                      </div>
                      <button onClick={() => sosAc(seciliFirma)} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold py-3 rounded-xl transition text-sm">🆘 Bu Firmadan Yardım İste</button>
                    </div>
                  )}
                </>
              )}
              {gorunum === "liste" && (
                <div className="h-full overflow-y-auto p-3">
                  {firmalar.length === 0 ? (
                    <div className="text-center py-14"><div className="text-4xl mb-3">🚛</div><div className="text-gray-500 text-sm">Yakında aktif firma bulunamadı</div></div>
                  ) : firmalar.map(f => {
                    const km = f.lat && f.lng ? haversine(mapCenter.lat, mapCenter.lng, f.lat, f.lng) : null;
                    return (
                      <div key={f.id} className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-4 mb-3">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-[#FF4D00]/10 border border-[#FF4D00]/20 flex items-center justify-center text-xl flex-shrink-0">🚛</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm">{f.firma_ad}</div>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25 px-2 py-0.5 rounded-full">✓ AKTİF</span>
                              {km !== null && <span className="text-[10px] text-gray-500">📍 {km.toFixed(1)} km</span>}
                            </div>
                          </div>
                          {km !== null && <div className="text-right flex-shrink-0"><div className="font-black text-lg">{km.toFixed(1)}</div><div className="text-[10px] text-gray-500">km</div></div>}
                        </div>
                        <button onClick={() => { setGorunum("harita"); sosAc(); }} className="w-full bg-[#FF4D00] text-white font-bold py-2.5 rounded-xl text-sm">🆘 Yardım İste</button>
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
                <div className="text-gray-500 text-sm">Aktif talebiniz yok</div>
                <div className="text-gray-600 text-xs mt-1">SOS butonuyla yardım talep edebilirsiniz</div>
              </div>
            ) : aktivTalepler.map(t => (
              <div key={t.id} className={`bg-[#1A1A1A] border rounded-2xl p-4 mb-3 ${t.durum === "teklif" ? "border-purple-500/50" : "border-white/8"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-sm">{t.tip}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{new Date(t.created_at).toLocaleString("tr-TR")}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${DURUM_RENK[t.durum] || "text-gray-400 bg-gray-500/10 border-gray-500/20"}`}>
                    {DURUM_LABEL[t.durum] || t.durum}
                  </span>
                </div>
                {t.firma_id && <div className="text-xs text-gray-500 mt-1">🚛 {firmaAdi(t.firma_id)}</div>}
                {t.hedef_adres && <div className="text-xs text-gray-600 mt-1">🎯 {t.hedef_adres}</div>}

                {/* Fiyat teklifi */}
                {t.durum === "teklif" && (
                  <div className="mt-3 bg-purple-500/8 border border-purple-500/20 rounded-2xl p-4">
                    <div className="text-xs text-purple-300 font-bold mb-2">💰 Firma Fiyat Teklifi Gönderdi</div>
                    {t.fiyat_teklifi ? (
                      <div className="font-black text-3xl text-white mb-3">{t.fiyat_teklifi.toLocaleString("tr-TR")} ₺</div>
                    ) : (
                      <div className="text-sm text-gray-400 mb-3">Fiyat belirtilmedi</div>
                    )}
                    <div className="text-[10px] text-gray-500 mb-3">🚛 {firmaAdi(t.firma_id)} tarafından gönderildi</div>
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
                      {t.sofor_konum_updated_at && <span className="text-[10px] text-gray-500 ml-auto">⏱ {new Date(t.sofor_konum_updated_at).toLocaleTimeString("tr-TR")}</span>}
                    </div>
                    <GoogleMap mapContainerStyle={{ width: "100%", height: "200px" }} center={{ lat: t.sofor_konum_lat, lng: t.sofor_konum_lng }} zoom={14} options={{ styles: MAP_STYLE, disableDefaultUI: true, zoomControl: false }}>
                      <Marker position={{ lat: t.sofor_konum_lat, lng: t.sofor_konum_lng }}
                        icon={{ url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><circle cx="18" cy="18" r="16" fill="#FF4D00" stroke="#fff" stroke-width="3"/><text x="18" y="24" text-anchor="middle" font-size="16">🚛</text></svg>')}`, scaledSize: new google.maps.Size(36, 36), anchor: new google.maps.Point(18, 18) }} />
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
              <div className="text-center py-14"><div className="text-4xl mb-3">🕐</div><div className="text-gray-500 text-sm">Geçmiş talep bulunmuyor</div></div>
            ) : gecmisTalepler.map(t => (
              <div key={t.id} className="bg-[#1A1A1A] border border-white/8 rounded-2xl mb-3 overflow-hidden">
                <div className="p-4" onClick={() => t.durum === "tamamlandi" && setOzetModal(t)} style={{ cursor: t.durum === "tamamlandi" ? "pointer" : "default" }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-sm">{t.tip}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{new Date(t.created_at).toLocaleString("tr-TR")}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${DURUM_RENK[t.durum] || "text-gray-400 bg-gray-500/10 border-gray-500/20"}`}>
                      {DURUM_LABEL[t.durum] || t.durum}
                    </span>
                  </div>
                  {t.firma_id && <div className="text-xs text-gray-500">🚛 {firmaAdi(t.firma_id)}</div>}
                  {t.fiyat_teklifi && <div className="text-xs text-[#FF4D00] font-bold mt-1">💰 {t.fiyat_teklifi.toLocaleString("tr-TR")} ₺</div>}
                  {t.durum === "tamamlandi" && <div className="text-[10px] text-gray-600 mt-1">Detaylar için tıklayın →</div>}
                </div>
                {/* Puan ver butonu */}
                {t.durum === "tamamlandi" && (
                  <div className="border-t border-white/5 px-4 py-3">
                    {t.musteri_puani ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className={`text-base ${s <= t.musteri_puani! ? "text-yellow-400" : "text-gray-700"}`}>★</span>)}</div>
                        <span className="text-xs text-gray-500">{t.musteri_yorumu || "Değerlendirdiniz"}</span>
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
            <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-4 mb-4">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Kişisel Bilgiler</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-xs text-gray-500 mb-1">Ad</label><input value={profilForm.ad || ""} onChange={e => setProfilForm(p => ({ ...p, ad: e.target.value }))} placeholder="Adın" className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Soyad</label><input value={profilForm.soyad || ""} onChange={e => setProfilForm(p => ({ ...p, soyad: e.target.value }))} placeholder="Soyadın" className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" /></div>
              </div>
              <div><label className="block text-xs text-gray-500 mb-1">Telefon</label><input value={profilForm.tel || ""} disabled className="w-full bg-[#222] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed" /></div>
            </div>
            <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-4 mb-4">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Araç Bilgileri</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-xs text-gray-500 mb-1">Marka</label><input value={profilForm.arac_marka || ""} onChange={e => setProfilForm(p => ({ ...p, arac_marka: e.target.value }))} placeholder="Ford..." className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Model</label><input value={profilForm.arac_model || ""} onChange={e => setProfilForm(p => ({ ...p, arac_model: e.target.value }))} placeholder="Focus..." className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" /></div>
              </div>
              <div className="mb-3"><label className="block text-xs text-gray-500 mb-1">Plaka</label><input value={profilForm.arac_plaka || ""} onChange={e => setProfilForm(p => ({ ...p, arac_plaka: e.target.value.toUpperCase() }))} placeholder="34 ABC 123" className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" /></div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-2">Çekiş Türü</label>
                <div className="grid grid-cols-2 gap-2">
                  {["4x4 / AWD","Önden Çekiş","Arkadan İtiş","Diğer"].map(v => (
                    <button key={v} onClick={() => setProfilForm(p => ({ ...p, cekis_turu: v }))} className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${profilForm.cekis_turu === v ? "border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]" : "border-white/10 bg-[#2A2A2A] text-gray-400"}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Yakıt Tipi</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Benzin","Dizel","Benzin/LPG","Elektrik"].map(v => (
                    <button key={v} onClick={() => setProfilForm(p => ({ ...p, yakit_tipi: v }))} className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${profilForm.yakit_tipi === v ? "border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]" : "border-white/10 bg-[#2A2A2A] text-gray-400"}`}>{v}</button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={profilKaydet} disabled={profilKayit} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm mb-3">{profilKayit ? "Kaydediliyor..." : "Kaydet"}</button>
            <button onClick={() => { localStorage.removeItem("musteri"); router.push("/"); }} className="w-full border border-white/10 text-gray-500 py-3 rounded-xl text-sm">Çıkış Yap</button>
          </div>
        )}
      </div>

      {/* ALT NAVİGASYON */}
      <nav className="flex bg-[#1A1A1A] border-t border-white/5 flex-shrink-0">
        <button onClick={() => setSayfa("ana")} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 ${sayfa === "ana" ? "text-[#FF4D00]" : "text-gray-600"}`}>
          <span className="text-lg">🏠</span><span className="text-[9px] font-bold">Ana</span>
        </button>
        <button onClick={() => setSayfa("talepler")} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 relative ${sayfa === "talepler" ? "text-[#FF4D00]" : "text-gray-600"}`}>
          <span className="text-lg">📋</span><span className="text-[9px] font-bold">Talepler</span>
          {(aktivTalepler.length > 0 || teklifBekleyen > 0) && <span className={`absolute top-2 right-3 w-2 h-2 rounded-full ${teklifBekleyen > 0 ? "bg-purple-400 animate-pulse" : "bg-[#FF4D00]"}`}></span>}
        </button>
        <div className="flex-1 flex items-center justify-center">
          <button onClick={() => sosAc()} className="w-12 h-12 rounded-full bg-[#FF4D00] border-2 border-[#0D0D0D] text-xl -mt-4" style={{ boxShadow: "0 0 0 3px rgba(255,77,0,.4)" }}>🆘</button>
        </div>
        <button onClick={() => setSayfa("gecmis")} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 ${sayfa === "gecmis" ? "text-[#FF4D00]" : "text-gray-600"}`}>
          <span className="text-lg">🕐</span><span className="text-[9px] font-bold">Geçmiş</span>
        </button>
        <button onClick={() => setSayfa("profil")} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 ${sayfa === "profil" ? "text-[#FF4D00]" : "text-gray-600"}`}>
          <span className="text-lg">👤</span><span className="text-[9px] font-bold">Profil</span>
        </button>
      </nav>

      {/* SOS MODAL */}
      {sosModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50" onClick={() => { setSosModal(false); setGonderildi(false); }}>
          <div className="bg-[#1A1A1A] rounded-t-2xl w-full max-w-md p-5 pb-10 max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-[#2A2A2A] rounded-full mx-auto mb-4"></div>
            {!gonderildi ? (
              <>
                <div className="font-black text-lg mb-1">🆘 Yardım İste</div>
                {enYakinFirma ? (
                  <div className="bg-[#FF4D00]/10 border border-[#FF4D00]/20 rounded-xl p-3 mb-4">
                    <div className="text-[10px] text-[#FF4D00] font-bold mb-0.5 uppercase">En Yakın Aktif Firma</div>
                    <div className="font-bold text-sm">{enYakinFirma.firma_ad}</div>
                    {enYakinFirma.lat && enYakinFirma.lng && <div className="text-xs text-gray-500 mt-0.5">~{haversine(mapCenter.lat, mapCenter.lng, enYakinFirma.lat, enYakinFirma.lng).toFixed(1)} km uzakta</div>}
                  </div>
                ) : <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4 text-xs text-yellow-300">⚠️ Yakında aktif firma bulunamadı. Talep yine de iletilecek.</div>}
                {(musteri?.arac_marka || musteri?.arac_plaka) && (
                  <div className="bg-[#2A2A2A] rounded-xl p-3 mb-4 text-xs text-gray-400 flex items-center gap-2">
                    <span className="text-base">🚗</span><span>{[musteri?.arac_marka, musteri?.arac_model, musteri?.arac_plaka, musteri?.yakit_tipi].filter(Boolean).join(" · ")}</span>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-400 mb-2">Ne yardımı istiyorsun? *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[["🚛","Çekici"],["🔧","Kurtarma"],["🔄","Lastik"],["🔋","Akü"],["⛽","Yakıt"],["🔑","Çilingir"]].map(([ic, lb]) => (
                      <button key={lb} onClick={() => setSorunTip(lb)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition ${sorunTip === lb ? "border-[#FF4D00] bg-[#FF4D00]/8 text-[#FF4D00]" : "border-white/10 bg-[#2A2A2A] text-gray-400"}`}>
                        <span className="text-xl">{ic}</span><span className="text-[10px] font-bold">{lb}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-400 mb-2">Araç nereye çekilsin?</label>
                  <div className="space-y-2">
                    {[["bilmiyorum","🤷","Henüz bilmiyorum","Sonradan düzenleyebilirsin"],["belirli","📍","Belirli bir adres","Servis veya ev adresi gir"],["onersin","💡","Firma önersin","En yakın servisi bulsun"]].map(([v, ic, lb, ac]) => (
                      <div key={v}>
                        <div onClick={() => setHedef(v)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${hedef === v ? "border-[#FF4D00] bg-[#FF4D00]/6" : "border-white/10 bg-[#2A2A2A]"}`}>
                          <span className="text-lg">{ic}</span>
                          <div className="flex-1"><div className="text-sm font-bold">{lb}</div><div className="text-xs text-gray-500">{ac}</div></div>
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${hedef === v ? "border-[#FF4D00] bg-[#FF4D00]" : "border-white/20"}`} style={hedef === v ? { boxShadow: "inset 0 0 0 3px #2A2A2A" } : {}} />
                        </div>
                        {v === "belirli" && hedef === "belirli" && <input value={hedefAdres} onChange={e => setHedefAdres(e.target.value)} placeholder="Örn: Kadıköy Ford Servisi" className="w-full mt-1.5 bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-400 mb-2">Not</label>
                  <textarea value={sosNot} onChange={e => setSosNot(e.target.value)} placeholder="Araç sağ tarafında, lastik patlak..." rows={2} className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00] resize-none" />
                </div>
                <button onClick={sosGonder} disabled={!sorunTip || sosYukleniyor} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition text-sm">{sosYukleniyor ? "Gönderiliyor..." : "🚨 Talebi Gönder"}</button>
                <button onClick={() => setSosModal(false)} className="w-full mt-2 border border-white/10 text-gray-500 py-3 rounded-xl text-sm">İptal</button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">✅</div>
                <div className="font-black text-xl mb-2">Talep Gönderildi!</div>
                {enYakinFirma && <p className="text-[#FF4D00] font-bold text-sm mb-2">{enYakinFirma.firma_ad}</p>}
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">Firma fiyat teklifi gönderdiğinde bildirim alacaksınız.</p>
                <button onClick={() => { setSosModal(false); setGonderildi(false); setSorunTip(""); setSosNot(""); setHedefAdres(""); setHedef("bilmiyorum"); setSayfa("talepler"); }} className="w-full bg-[#FF4D00] text-white font-bold py-3 rounded-xl">Talebi Görüntüle →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PUAN MODAL */}
      {puanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-5" onClick={() => setPuanModal(null)}>
          <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-black text-lg">Firmayı Değerlendir</div>
              <div className="text-xs text-gray-500 mt-1">🚛 {firmaAdi(puanModal.firma_id)}</div>
            </div>
            <div className="flex justify-center gap-3 mb-5">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setPuan(s)} className={`text-4xl transition-transform ${s <= puan ? "scale-110" : "opacity-30"}`}>★</button>
              ))}
            </div>
            <textarea value={yorum} onChange={e => setYorum(e.target.value)} placeholder="Yorumunuz (isteğe bağlı)..." rows={3} className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00] resize-none mb-4" />
            <button onClick={puanVer} disabled={puan === 0 || puanYukleniyor} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm">{puanYukleniyor ? "Kaydediliyor..." : "Değerlendirmeyi Gönder"}</button>
            <button onClick={() => setPuanModal(null)} className="w-full mt-2 border border-white/10 text-gray-500 py-2.5 rounded-xl text-sm">Vazgeç</button>
          </div>
        </div>
      )}

      {/* İŞ ÖZETİ MODAL */}
      {ozetModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50" onClick={() => setOzetModal(null)}>
          <div className="bg-[#1A1A1A] rounded-t-2xl w-full max-w-md p-5 pb-10 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-[#2A2A2A] rounded-full mx-auto mb-5"></div>
            <div className="flex items-center gap-3 mb-5">
              <div className="text-4xl">✔</div>
              <div>
                <div className="font-black text-lg">İş Özeti</div>
                <div className="text-xs text-gray-500">{new Date(ozetModal.created_at).toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" })}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-[#2A2A2A] rounded-xl p-4">
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Firma</div>
                <div className="font-bold">🚛 {firmaAdi(ozetModal.firma_id)}</div>
              </div>
              <div className="bg-[#2A2A2A] rounded-xl p-4">
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Hizmet</div>
                <div className="font-bold">{ozetModal.tip}</div>
                {ozetModal.hedef_adres && <div className="text-xs text-gray-500 mt-1">🎯 {ozetModal.hedef_adres}</div>}
              </div>
              {ozetModal.fiyat_teklifi && (
                <div className="bg-[#FF4D00]/8 border border-[#FF4D00]/20 rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Ücret</div>
                  <div className="font-black text-2xl text-[#FF4D00]">{ozetModal.fiyat_teklifi.toLocaleString("tr-TR")} ₺</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {ozetModal.toplam_km != null && ozetModal.toplam_km > 0 && (
                  <div className="bg-[#2A2A2A] rounded-xl p-4 text-center">
                    <div className="font-black text-xl text-[#FF4D00]">{ozetModal.toplam_km.toFixed(1)}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">km çekildi</div>
                  </div>
                )}
                {ozetModal.ise_baslama_zamani && ozetModal.ise_bitis_zamani && (
                  <div className="bg-[#2A2A2A] rounded-xl p-4 text-center">
                    <div className="font-black text-xl">{formatSure(new Date(ozetModal.ise_bitis_zamani).getTime() - new Date(ozetModal.ise_baslama_zamani).getTime())}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">süre</div>
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
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">{tumFotolar.length} Fotoğraf</div>
                    <div className="grid grid-cols-3 gap-2">
                      {tumFotolar.map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt={`foto-${i}`} className="aspect-square rounded-xl object-cover border border-white/10 cursor-pointer" onClick={() => setLightbox({ urls: tumFotolar, idx: i })} />
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
              {/* Değerlendirme */}
              {ozetModal.musteri_puani ? (
                <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-xl p-4">
                  <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map(s => <span key={s} className={`text-lg ${s <= ozetModal.musteri_puani! ? "text-yellow-400" : "text-gray-700"}`}>★</span>)}</div>
                  {ozetModal.musteri_yorumu && <div className="text-xs text-gray-400">&ldquo;{ozetModal.musteri_yorumu}&rdquo;</div>}
                </div>
              ) : (
                <button onClick={() => { setOzetModal(null); setPuanModal(ozetModal); setPuan(0); setYorum(""); }}
                  className="w-full text-sm font-bold text-yellow-400 bg-yellow-500/8 border border-yellow-500/20 py-3 rounded-xl">
                  ⭐ Firma Değerlendir
                </button>
              )}
            </div>
            <button onClick={() => setOzetModal(null)} className="w-full mt-4 border border-white/10 text-gray-500 py-3 rounded-xl text-sm">Kapat</button>
          </div>
        </div>
      )}

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

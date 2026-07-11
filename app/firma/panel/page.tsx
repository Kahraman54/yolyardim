"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { apiPost, apiPatch, apiDelete } from "../../../lib/api";

type Arac = { id: string; plaka: string; tur: string; marka?: string; model?: string; model_yili?: string; arac_turu?: string; };
type FirmaDetay = {
  firma_ad: string; sahip_ad: string; sahip_soyad: string; tel: string; email: string;
  il: string; ilce: string; adres: string; vergi_no: string; vergi_dairesi: string;
  banka: string; iban: string; lat: string; lng: string; hizmet_tipi: string;
};
type Sofor = { id: string; ad: string; soyad: string; tel: string; };
type Talep = {
  id: string; tip: string; durum: string; created_at: string;
  musteri_ad?: string; musteri_tel?: string;
  konum_lat?: number; konum_lng?: number; konum_adres?: string; hedef_adres?: string; arac_plaka?: string; aciklama?: string;
  toplam_km?: number; ise_baslama_zamani?: string; ise_bitis_zamani?: string;
  foto_teslim_alma?: string[]; foto_yukleme?: string[]; foto_teslim?: string[]; foto_tutanak?: string[];
  fiyat_teklifi?: number; atanan_sofor?: string;
};

export default function FirmaPanel() {
  const router = useRouter();
  const [sayfa, setSayfa] = useState("panel");
  const [firmaId, setFirmaId] = useState<string | null>(null);
  const [firmaAd, setFirmaAd] = useState("Firma");

  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [soforler, setSoforler] = useState<Sofor[]>([]);
  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);

  // Araç modal
  const [aracModal, setAracModal] = useState(false);
  const [yeniArac, setYeniArac] = useState({ plaka: "", tur: "", marka: "", model: "", model_yili: "", arac_turu: "" });
  const [aracKayit, setAracKayit] = useState(false);

  // Şoför modal
  const [soforModal, setSoforModal] = useState(false);
  const [yeniSofor, setYeniSofor] = useState({ ad: "", soyad: "", tel: "" });
  const [soforKayit, setSoforKayit] = useState(false);

  // Atama modal
  const [atamaModal, setAtamaModal] = useState(false);
  const [seciliTalep, setSeciliTalep] = useState<Talep | null>(null);
  const [seciliSofor, setSeciliSofor] = useState("");
  const [seciliArac, setSeciliArac] = useState("");
  const [atamaTamam, setAtamaTamam] = useState(false);
  const [fiyatTeklifi, setFiyatTeklifi] = useState("");
  const [lightbox, setLightbox] = useState<{ urls: string[]; idx: number } | null>(null);
  const [soforPerformansModal, setSoforPerformansModal] = useState<Sofor | null>(null);

  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState("");

  // Profil
  const [profil, setProfil] = useState<FirmaDetay>({ firma_ad:"", sahip_ad:"", sahip_soyad:"", tel:"", email:"", il:"", ilce:"", adres:"", vergi_no:"", vergi_dairesi:"", banka:"", iban:"", lat:"", lng:"", hizmet_tipi:"" });
  const [profilKayit, setProfilKayit] = useState(false);

  const [mobil, setMobil] = useState(false);
  useEffect(() => {
    const check = () => setMobil(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const kayit = localStorage.getItem("firma");
    if (!kayit) { router.replace("/firma/giris"); return; }
    try {
      const parsed = JSON.parse(kayit);
      setFirmaId(parsed.id);
      setFirmaAd(parsed.firma_ad || "Firma");
    } catch { router.replace("/firma/giris"); }
  }, [router]);

  const profilYukle = useCallback(async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rawData: Record<string, any> | null = null;
    const r1 = await supabase.from("firmalar").select("firma_ad, sahip_ad, sahip_soyad, tel, email, il, ilce, adres, vergi_no, vergi_dairesi, banka, iban, lat, lng, hizmet_tipi").eq("id", id).single();
    if (r1.error) {
      // hizmet_tipi kolonu henüz yoksa onsuz dene
      const r2 = await supabase.from("firmalar").select("firma_ad, sahip_ad, sahip_soyad, tel, email, il, ilce, adres, vergi_no, vergi_dairesi, banka, iban, lat, lng").eq("id", id).single();
      rawData = r2.data;
    } else {
      rawData = r1.data;
    }
    if (rawData) setProfil({ firma_ad: rawData.firma_ad||"", sahip_ad: rawData.sahip_ad||"", sahip_soyad: rawData.sahip_soyad||"", tel: rawData.tel||"", email: rawData.email||"", il: rawData.il||"", ilce: rawData.ilce||"", adres: rawData.adres||"", vergi_no: rawData.vergi_no||"", vergi_dairesi: rawData.vergi_dairesi||"", banka: rawData.banka||"", iban: rawData.iban||"", lat: rawData.lat ? String(rawData.lat) : "", lng: rawData.lng ? String(rawData.lng) : "", hizmet_tipi: rawData.hizmet_tipi||"" });
  }, []);

  const araclarYukle = useCallback(async (id: string) => {
    const { data } = await supabase.from("araclar").select("id, plaka, tur, marka, model, model_yili, arac_turu").eq("firma_id", id);
    setAraclar(data || []);
  }, []);

  const soforlerYukle = useCallback(async (id: string) => {
    const { data } = await supabase.from("soforler").select("id, ad, soyad, tel").eq("firma_id", id);
    setSoforler(data || []);
  }, []);

  const taleplerYukle = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("talepler")
      .select("id, tip, durum, created_at, musteri_ad, musteri_tel, konum_lat, konum_lng, konum_adres, hedef_adres, arac_plaka, aciklama, toplam_km, ise_baslama_zamani, ise_bitis_zamani, foto_teslim_alma, foto_yukleme, foto_teslim, foto_tutanak, fiyat_teklifi, atanan_sofor")
      .or(`durum.eq.yeni,firma_id.eq.${id}`)
      .order("created_at", { ascending: false });
    if (error) console.error("Talepler yükleme hatası:", error.message, error.code);
    setTalepler(data || []);
  }, []);

  useEffect(() => {
    if (!firmaId) return;
    profilYukle(firmaId);
    araclarYukle(firmaId);
    soforlerYukle(firmaId);
    taleplerYukle(firmaId);
  }, [firmaId, profilYukle, araclarYukle, soforlerYukle, taleplerYukle]);

  async function profilKaydet() {
    if (!firmaId) return;
    setProfilKayit(true);
    try {
      await apiPatch("firmalar", firmaId, {
        firma_ad: profil.firma_ad, tel: profil.tel, email: profil.email,
        adres: profil.adres, vergi_no: profil.vergi_no, vergi_dairesi: profil.vergi_dairesi,
        banka: profil.banka, iban: profil.iban,
        lat: profil.lat ? parseFloat(profil.lat) : null,
        lng: profil.lng ? parseFloat(profil.lng) : null,
        hizmet_tipi: profil.hizmet_tipi || null,
      });
      setBasari("Profil kaydedildi."); setTimeout(() => setBasari(""), 3000);
    } catch (e) { setHata("Kayıt hatası: " + (e as Error).message); }
    setProfilKayit(false);
  }

  function konumBelirle() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setProfil(p => ({ ...p, lat: String(pos.coords.latitude), lng: String(pos.coords.longitude) })),
      () => setHata("Konum alınamadı. Tarayıcı izinlerini kontrol edin."),
      { timeout: 10000 }
    );
  }

  async function talepTamamla(talepId: string) {
    await apiPatch("talepler", talepId, { durum: "tamamlandi" });
    if (firmaId) taleplerYukle(firmaId);
  }

  async function aracEkle() {
    if (!yeniArac.plaka || !yeniArac.tur || !firmaId) return;
    setAracKayit(true);
    try {
      await apiPost("araclar", {
        firma_id: firmaId, plaka: yeniArac.plaka.toUpperCase(), tur: yeniArac.tur,
        marka: yeniArac.marka || null, model: yeniArac.model || null,
        model_yili: yeniArac.model_yili || null, arac_turu: yeniArac.arac_turu || null,
      });
      setYeniArac({ plaka: "", tur: "", marka: "", model: "", model_yili: "", arac_turu: "" }); setAracModal(false); araclarYukle(firmaId);
    } catch (e) { setHata("Araç eklenemedi: " + (e as Error).message); }
    setAracKayit(false);
  }

  async function aracSil(id: string) {
    await apiDelete("araclar", id);
    if (firmaId) araclarYukle(firmaId);
  }

  async function soforEkle() {
    if (!yeniSofor.ad || !yeniSofor.tel || !firmaId) return;
    setSoforKayit(true);
    try {
      await apiPost("soforler", { firma_id: firmaId, ad: yeniSofor.ad, soyad: yeniSofor.soyad, tel: yeniSofor.tel });
      setYeniSofor({ ad: "", soyad: "", tel: "" }); setSoforModal(false); soforlerYukle(firmaId);
    } catch (e) { setHata("Şoför eklenemedi: " + (e as Error).message); }
    setSoforKayit(false);
  }

  async function soforSil(id: string) {
    await apiDelete("soforler", id);
    if (firmaId) soforlerYukle(firmaId);
  }

  async function teklifGonder() {
    if (!seciliSofor || !seciliArac || !seciliTalep || !firmaId) return;
    setYukleniyor(true);
    await apiPatch("talepler", seciliTalep.id, {
      durum: "teklif", firma_id: firmaId, atanan_sofor: seciliSofor, atanan_arac: seciliArac,
      fiyat_teklifi: fiyatTeklifi ? parseFloat(fiyatTeklifi) : null,
    });
    setYukleniyor(false);
    setAtamaTamam(true);
    taleplerYukle(firmaId);
  }

  async function talepReddet(talepId: string) {
    await apiPatch("talepler", talepId, { durum: "reddedildi" });
    if (firmaId) taleplerYukle(firmaId);
  }

  const yeniTalepler = talepler.filter(t => t.durum === "yeni" || t.durum === "teklif");

  const navItems = [
    { id: "panel", icon: "📊", label: "Panel" },
    { id: "talepler", icon: "📋", label: "Talepler", badge: yeniTalepler.length || undefined },
    { id: "araclar", icon: "🚛", label: "Araçlar" },
    { id: "soforler", icon: "👤", label: "Şoförler" },
  ];

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex">
      {/* SIDEBAR — sadece masaüstü */}
      {!mobil && (
        <aside className="w-48 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 mb-0.5">
              <img src="/tulpar-logo-v3.png" alt="" className="h-8 w-auto object-contain flex-shrink-0" />
              <div className="font-black italic text-xl leading-none">Tulpar<span className="text-[var(--accent-text)]">Assist</span></div>
            </div>
            <div className="text-xs text-[var(--text-3)]">Tedarikçi Paneli</div>
          </div>
          <button onClick={() => setSayfa("profil")} className={`p-3 border-b border-[var(--border)] flex items-center gap-2 w-full text-left hover:bg-[var(--hover)] transition ${sayfa === "profil" ? "bg-[#00D4FF]/8" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${sayfa === "profil" ? "bg-[#00D4FF]/30" : "bg-[#00D4FF]/15"}`}>🚛</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate">{firmaAd}</div>
              <div className="text-[10px] text-[#00C853] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse"></span>Aktif
              </div>
            </div>
            <span className="text-[var(--text-3)] text-xs flex-shrink-0">›</span>
          </button>
          <nav className="flex-1 p-2">
            {navItems.map(m => (
              <button key={m.id} onClick={() => setSayfa(m.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-0.5 transition text-left ${sayfa === m.id ? "bg-[#00D4FF]/10 text-[var(--accent-text)] font-semibold" : "text-[var(--text-3)] hover:bg-[var(--hover)] hover:text-[var(--text)]"}`}>
                <span className="text-sm">{m.icon}</span>{m.label}
                {m.badge ? <span className="ml-auto bg-[#00D4FF] text-[#0B0F14] text-[9px] font-bold px-1.5 py-0.5 rounded-full">{m.badge}</span> : null}
              </button>
            ))}
          </nav>
        </aside>
      )}

      {/* ANA İÇERİK */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobil header */}
        {mobil ? (
          <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <button onClick={() => setSayfa("profil")} className="flex items-center gap-2 text-left">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${sayfa === "profil" ? "bg-[#00D4FF]/30" : "bg-[#00D4FF]/15"}`}>🚛</div>
              <div>
                <div className="font-black text-sm truncate max-w-[180px]">{firmaAd}</div>
                <div className="text-[10px] text-[#00C853] flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse"></span>Aktif · profili düzenle
                </div>
              </div>
            </button>
            <button onClick={() => { localStorage.removeItem("firma"); router.push("/firma/giris"); }} className="text-xs text-[var(--text-3)] border border-[var(--border)] rounded-lg px-3 py-1.5">
              Çıkış
            </button>
          </div>
        ) : (
          <div className="h-12 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-5 flex-shrink-0">
            <div className="font-black text-sm">
              {sayfa === "panel" ? "Panel" : sayfa === "talepler" ? "Talepler" : sayfa === "araclar" ? "Araçlarım" : "Şoförlerim"}
            </div>
            <div className="flex items-center gap-2">
              {yeniTalepler.length > 0 && (
                <button onClick={() => setSayfa("talepler")} className="text-[11px] text-[var(--accent-text)] font-bold bg-[#00D4FF]/10 border border-[#00D4FF]/25 px-3 py-1.5 rounded-lg animate-pulse">
                  🔴 {yeniTalepler.length} Yeni Talep
                </button>
              )}
              <button
                onClick={() => { localStorage.removeItem("firma"); router.push("/firma/giris"); }}
                title="Çıkış Yap"
                className="w-8 h-8 bg-[var(--surface-2)] rounded-lg flex items-center justify-center flex-shrink-0 text-[var(--text-3)] hover:text-[var(--text)] transition"
              >
                <span
                  className="flex-shrink-0 bg-current block"
                  style={{ width: 16, height: 16, maskImage: "url('/icons/svg/003-exit.svg')", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center", WebkitMaskImage: "url('/icons/svg/003-exit.svg')", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center" }}
                />
              </button>
            </div>
          </div>
        )}

        {hata && (
          <div className="mx-4 mt-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl">
            ⚠️ {hata} <button onClick={() => setHata("")} className="ml-2 underline">Kapat</button>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto ${mobil ? "p-4 pb-24" : "p-5"}`}>

          {/* Mobil yeni talep banner */}
          {mobil && yeniTalepler.length > 0 && sayfa === "panel" && (
            <button onClick={() => setSayfa("talepler")} className="w-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-xl px-4 py-3 flex items-center justify-between mb-4 animate-pulse">
              <span className="text-sm font-bold text-[var(--accent-text)]">🔴 {yeniTalepler.length} Yeni Talep</span>
              <span className="text-[var(--accent-text)]">→</span>
            </button>
          )}

          {/* PANEL */}
          {sayfa === "panel" && (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-[var(--surface)] border border-[#00D4FF]/25 rounded-xl p-4">
                  <div className="text-[11px] text-[var(--text-3)] mb-2">Bekleyen Talep</div>
                  <div className="font-black text-2xl text-[var(--accent-text)]">{yeniTalepler.length}</div>
                </div>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                  <div className="text-[11px] text-[var(--text-3)] mb-2">Araç</div>
                  <div className="font-black text-2xl">{araclar.length}</div>
                </div>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                  <div className="text-[11px] text-[var(--text-3)] mb-2">Şoför</div>
                  <div className="font-black text-2xl">{soforler.length}</div>
                </div>
              </div>
              {yeniTalepler.length > 0 ? (
                <div className="bg-[#00D4FF]/6 border border-[#00D4FF]/20 rounded-xl p-4 flex items-center justify-between cursor-pointer" onClick={() => setSayfa("talepler")}>
                  <div>
                    <div className="font-bold text-sm">🔴 Yeni Talep Var!</div>
                    <div className="text-xs text-[var(--text-3)] mt-1">{yeniTalepler.length} talep bekliyor</div>
                  </div>
                  <span className="text-[var(--accent-text)]">→</span>
                </div>
              ) : (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center text-[var(--text-3)] text-sm">
                  Şu an bekleyen talep yok.
                </div>
              )}
            </div>
          )}

          {/* TALEPLER */}
          {sayfa === "talepler" && (
            <div className="space-y-3">
              {talepler.length === 0 ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-10 text-center text-[var(--text-3)] text-sm">
                  Henüz talep gelmedi. Talepler burada görünecek.
                </div>
              ) : talepler.map(t => (
                <div key={t.id} className={`bg-[var(--surface)] border rounded-2xl overflow-hidden ${t.durum === "yeni" ? "border-[#00D4FF]" : t.durum === "teklif" ? "border-purple-500/60" : "border-[var(--border)]"}`}>
                  <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center text-base">🚛</div>
                      <div>
                        <div className="text-[11px] text-[var(--text-3)]">{new Date(t.created_at).toLocaleString("tr-TR")}</div>
                        <div className="font-bold text-sm">{t.tip || "Çekici"} Talebi</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                      t.durum === "yeni" ? "bg-[#00D4FF]/12 text-[var(--accent-text)] border-[#00D4FF]/25 animate-pulse" :
                      t.durum === "teklif" ? "bg-purple-500/10 text-purple-300 border-purple-500/25" :
                      t.durum === "kabul" || t.durum === "yolda" ? "bg-[#00C853]/10 text-[#00C853] border-[#00C853]/25" :
                      t.durum === "tamamlandi" ? "bg-gray-500/10 text-[var(--text-2)] border-gray-500/20" :
                      "bg-[var(--hover)] text-[var(--text-3)] border-[var(--border)]"
                    }`}>
                      {t.durum === "yeni" ? "🔴 YENİ" : t.durum === "teklif" ? "⏳ ONAY BEKL." : t.durum === "kabul" ? "✓ KABUL" : t.durum === "yolda" ? "🚛 YOLDA" : t.durum === "tamamlandi" ? "✔ TAMAM" : t.durum.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-4">
                    {(t.musteri_ad || t.musteri_tel) && (
                      <div className="mb-3">
                        {t.musteri_ad && <div className="font-semibold text-sm mb-2">{t.musteri_ad}</div>}
                        {t.musteri_tel && (() => {
                          const n = t.musteri_tel.replace(/\D/g, "");
                          const g = n.startsWith("0") ? n : "0" + n;
                          return (
                            <a href={`tel:${g}`} className="flex items-center gap-3 bg-blue-500/8 border border-blue-500/20 rounded-xl p-3">
                              <span className="text-lg">📞</span>
                              <div className="flex-1">
                                <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Müşteri Telefonu</div>
                                <div className="font-bold text-blue-400 text-sm mt-0.5">{g}</div>
                              </div>
                              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 px-2 py-1 rounded-lg">Ara →</span>
                            </a>
                          );
                        })()}
                      </div>
                    )}
                    {t.arac_plaka && (
                      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 flex items-center gap-3 mb-3">
                        <span className="text-2xl">🚗</span>
                        <div className="font-black text-sm tracking-wider">{t.arac_plaka}</div>
                      </div>
                    )}
                    {(t.konum_lat || t.konum_adres || t.hedef_adres) && (
                      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 mb-3 space-y-2">
                        {(t.konum_lat || t.konum_adres) && (
                          <a href={t.konum_lat ? `https://maps.google.com/?q=${t.konum_lat},${t.konum_lng}` : `https://maps.google.com/?q=${encodeURIComponent(t.konum_adres!)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
                            <span>📍</span>
                            <div className="flex-1">
                              <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Bulunduğu Yer</div>
                              <div className="text-xs font-semibold mt-0.5 text-[var(--accent-text)] group-hover:underline">{t.konum_adres || `${t.konum_lat?.toFixed(5)}, ${t.konum_lng?.toFixed(5)}`}</div>
                            </div>
                            <span className="text-[10px] bg-[#00D4FF]/10 text-[var(--accent-text)] border border-[#00D4FF]/20 px-2 py-1 rounded-lg font-bold">Haritada Aç →</span>
                          </a>
                        )}
                        {t.hedef_adres && <div className="flex items-start gap-2"><span>🎯</span><div><div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Hedef</div><div className="text-xs font-semibold mt-0.5">{t.hedef_adres}</div></div></div>}
                      </div>
                    )}
                    {t.aciklama && <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-lg p-3 text-xs text-yellow-200 mb-4">💬 &ldquo;{t.aciklama}&rdquo;</div>}
                    {t.durum === "yeni" && (
                      <div className="flex gap-2">
                        <button onClick={() => { setSeciliTalep(t); setAtamaModal(true); setAtamaTamam(false); setSeciliSofor(""); setSeciliArac(""); setFiyatTeklifi(""); }}
                          className="flex-1 bg-[#00D4FF] hover:bg-[#0099BB] text-[#0B0F14] font-bold py-3 rounded-xl transition text-sm">
                          💰 Fiyat Teklif Et
                        </button>
                        <button onClick={() => talepReddet(t.id)} className="px-5 py-3 border border-red-500/25 text-red-400 hover:bg-red-500/8 rounded-xl font-bold transition text-sm">
                          ✕
                        </button>
                      </div>
                    )}
                    {t.durum === "teklif" && (
                      <div className="bg-purple-500/8 border border-purple-500/20 rounded-xl p-3 text-xs text-purple-300 flex items-center gap-2">
                        <span className="animate-pulse">⏳</span>
                        Müşteri onayı bekleniyor
                        {t.fiyat_teklifi && <span className="ml-auto font-black text-[var(--text)]">{t.fiyat_teklifi.toLocaleString("tr-TR")} ₺</span>}
                      </div>
                    )}
                    {(t.durum === "kabul" || t.durum === "yolda") && (
                      <button onClick={() => talepTamamla(t.id)}
                        className="w-full bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#00C853]/40 text-[var(--text)] font-bold py-2.5 rounded-xl transition text-sm">
                        ✔ Hizmeti Tamamla
                      </button>
                    )}
                    {t.durum === "tamamlandi" && (t.toplam_km || t.ise_baslama_zamani || (t.foto_teslim_alma?.length || 0) + (t.foto_yukleme?.length || 0) + (t.foto_teslim?.length || 0) + (t.foto_tutanak?.length || 0) > 0) && (
                      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 mt-1">
                        <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-2">İş Özeti</div>
                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                          {t.toplam_km != null && (
                            <div><div className="font-black text-base text-[var(--accent-text)]">{t.toplam_km.toFixed(1)}</div><div className="text-[9px] text-[var(--text-3)]">km</div></div>
                          )}
                          {t.ise_baslama_zamani && t.ise_bitis_zamani && (
                            <div><div className="font-black text-base">
                              {(() => { const ms = new Date(t.ise_bitis_zamani).getTime() - new Date(t.ise_baslama_zamani).getTime(); const dk = Math.floor(ms/60000); const sa = Math.floor(dk/60); return sa > 0 ? `${sa}s ${dk%60}dk` : `${dk}dk`; })()}
                            </div><div className="text-[9px] text-[var(--text-3)]">süre</div></div>
                          )}
                          <div>
                            <div className="font-black text-base text-[#00C853]">
                              {((t.foto_teslim_alma?.length || 0) + (t.foto_yukleme?.length || 0) + (t.foto_teslim?.length || 0) + (t.foto_tutanak?.length || 0))}
                            </div>
                            <div className="text-[9px] text-[var(--text-3)]">fotoğraf</div>
                          </div>
                        </div>
                        {[
                          { label: "Teslim Alma", urls: t.foto_teslim_alma },
                          { label: "Yükleme", urls: t.foto_yukleme },
                          { label: "Teslim", urls: t.foto_teslim },
                          { label: "Tutanak", urls: t.foto_tutanak },
                        ].filter(g => g.urls && g.urls.length > 0).map(g => {
                          const tumFotolar = [...(t.foto_teslim_alma||[]), ...(t.foto_yukleme||[]), ...(t.foto_teslim||[]), ...(t.foto_tutanak||[])];
                          return (
                            <div key={g.label} className="mb-2">
                              <div className="text-[9px] text-[var(--text-3)] mb-1">{g.label}</div>
                              <div className="flex gap-1.5 flex-wrap">
                                {g.urls!.map((url, i) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img key={i} src={url} alt="" onClick={() => setLightbox({ urls: tumFotolar, idx: tumFotolar.indexOf(url) })}
                                    className="w-14 h-14 object-cover rounded-lg cursor-pointer hover:opacity-80 transition border border-[var(--border)]" />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ARAÇLAR */}
          {sayfa === "araclar" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold">Araçlarım ({araclar.length})</div>
                <button onClick={() => setAracModal(true)} className="bg-[#00D4FF] text-[#0B0F14] text-xs font-bold px-4 py-2 rounded-lg">+ Araç Ekle</button>
              </div>
              {araclar.length === 0 ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-10 text-center text-[var(--text-3)] text-sm">
                  Henüz araç eklenmedi.
                </div>
              ) : (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                  {araclar.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-4 border-b border-[var(--border)] last:border-0">
                      <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] flex items-center justify-center">🚛</div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{a.plaka}</div>
                        <div className="text-xs text-[var(--text-3)]">
                          {[a.arac_turu, a.tur, a.marka, a.model, a.model_yili].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <button onClick={() => aracSil(a.id)} className="text-[var(--text-3)] hover:text-red-400 transition text-lg">🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ŞOFÖRLER */}
          {sayfa === "soforler" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold">Şoförlerim ({soforler.length})</div>
                <button onClick={() => setSoforModal(true)} className="bg-[#00D4FF] text-[#0B0F14] text-xs font-bold px-4 py-2 rounded-lg">+ Şoför Ekle</button>
              </div>
              {soforler.length === 0 ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-10 text-center text-[var(--text-3)] text-sm">
                  Henüz şoför eklenmedi.
                </div>
              ) : (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                  {soforler.map(s => {
                    const soforTalepler = talepler.filter(t => t.atanan_sofor === s.id && t.durum === "tamamlandi");
                    const toplamKm = soforTalepler.reduce((a, t) => a + (t.toplam_km || 0), 0);
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-4 border-b border-[var(--border)] last:border-0 cursor-pointer hover:bg-white/2 transition" onClick={() => setSoforPerformansModal(s)}>
                        <div className="w-9 h-9 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {s.ad[0]}{s.soyad?.[0] || ""}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm">{s.ad} {s.soyad}</div>
                          <div className="flex gap-2 mt-0.5">
                            <span className="text-[10px] text-[var(--text-3)]">{s.tel}</span>
                            {soforTalepler.length > 0 && <span className="text-[10px] text-[#00C853]">✓ {soforTalepler.length} iş · {toplamKm.toFixed(0)} km</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[var(--text-3)]">Detay →</span>
                          <button onClick={e => { e.stopPropagation(); soforSil(s.id); }} className="text-[var(--text-3)] hover:text-red-400 transition text-lg">🗑</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PROFİL */}
          {sayfa === "profil" && (
            <div className="max-w-xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  {mobil && <button onClick={() => setSayfa("panel")} className="text-[var(--text-2)] text-sm">← Geri</button>}
                  <h2 className="font-black text-lg">Firma Profili</h2>
                </div>
                {basari && <span className="text-xs text-[#00C853] font-bold bg-[#00C853]/10 border border-[#00C853]/20 px-3 py-1.5 rounded-lg">{basari}</span>}
              </div>

              <div className="space-y-4">
                <div className="text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest">Firma Bilgileri</div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Firma Adı</label>
                  <input value={profil.firma_ad} onChange={e => setProfil({...profil, firma_ad: e.target.value})} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF] transition" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Telefon</label>
                    <input value={profil.tel} onChange={e => setProfil({...profil, tel: e.target.value})} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF] transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">E-posta</label>
                    <input value={profil.email} onChange={e => setProfil({...profil, email: e.target.value})} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF] transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Adres</label>
                  <textarea value={profil.adres} onChange={e => setProfil({...profil, adres: e.target.value})} rows={2} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF] transition resize-none" />
                </div>

                <div className="pt-2 text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest">Vergi Bilgileri</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Vergi Numarası</label>
                    <input value={profil.vergi_no} onChange={e => setProfil({...profil, vergi_no: e.target.value})} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF] transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Vergi Dairesi</label>
                    <input value={profil.vergi_dairesi} onChange={e => setProfil({...profil, vergi_dairesi: e.target.value})} placeholder="Kadıköy VD" className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF] transition" />
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest">Banka Bilgileri</div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Banka</label>
                  <div className="relative">
                    <select value={profil.banka} onChange={e => setProfil({...profil, banka: e.target.value})} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF] transition appearance-none pr-8">
                      <option value="">Seçin...</option>
                      {["Ziraat Bankası","Halkbank","Vakıfbank","İş Bankası","Garanti BBVA","Yapı Kredi","Akbank","QNB Finansbank","Denizbank","TEB","İNG Bank","HSBC","Odeabank","Şekerbank","Albaraka Türk","Kuveyt Türk","Türkiye Finans","Ziraat Katılım","Vakıf Katılım"].map(b => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-2)] text-xs">▼</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">IBAN</label>
                  <input value={profil.iban} onChange={e => setProfil({...profil, iban: e.target.value.toUpperCase()})} placeholder="TR00 0000 0000 0000 0000 0000 00" className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF] transition font-mono tracking-wide" />
                </div>

                <div className="pt-2 text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest">Tedarikçi Türü</div>
                <div>
                  <p className="text-xs text-[var(--text-3)] mb-3">Müşteriler haritada sizi bu kategoride bulacak. En az birini seçin.</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: "cekici", icon: "🚛", label: "Çekici", desc: "Araç çekme & kurtarma" },
                      { v: "lastikci", icon: "🔧", label: "Lastikçi", desc: "Lastik değişim & tamir" },
                      { v: "her_ikisi", icon: "✨", label: "Her İkisi", desc: "Çekici + Lastikçi" },
                    ].map(({ v, icon, label, desc }) => (
                      <div
                        key={v}
                        onClick={() => setProfil(p => ({ ...p, hizmet_tipi: v }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition text-center ${
                          profil.hizmet_tipi === v
                            ? "border-[#00D4FF] bg-[#00D4FF]/10"
                            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)]"
                        }`}
                      >
                        <span className="text-2xl">{icon}</span>
                        <span className={`text-xs font-bold ${profil.hizmet_tipi === v ? "text-[var(--accent-text)]" : "text-[var(--text)]"}`}>{label}</span>
                        <span className="text-[9px] text-[var(--text-3)] leading-tight">{desc}</span>
                      </div>
                    ))}
                  </div>
                  {profil.hizmet_tipi && (
                    <div className="mt-2 text-[10px] text-[#00C853]">
                      ✓ {profil.hizmet_tipi === "cekici" ? "Çekici olarak" : profil.hizmet_tipi === "lastikci" ? "Lastikçi olarak" : "Çekici ve lastikçi olarak"} listeleneceksiniz
                    </div>
                  )}
                </div>

                <div className="pt-2 text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest">Harita Konumu</div>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                  <p className="text-xs text-[var(--text-3)] mb-3">Müşteriler firmanızı haritada görebilsin için konumunuzu belirleyin.</p>
                  <button onClick={konumBelirle} className="w-full bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#00D4FF]/40 text-[var(--text)] text-sm font-bold py-2.5 rounded-lg transition mb-3">
                    📍 GPS ile Konum Belirle
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Enlem</label>
                      <input value={profil.lat} onChange={e => setProfil({...profil, lat: e.target.value})} placeholder="41.01234" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF] font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Boylam</label>
                      <input value={profil.lng} onChange={e => setProfil({...profil, lng: e.target.value})} placeholder="29.01234" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF] font-mono" />
                    </div>
                  </div>
                  {profil.lat && profil.lng && (
                    <div className="mt-2 text-[10px] text-green-400">✓ Konum ayarlı — müşteri haritasında görüneceksiniz</div>
                  )}
                </div>

                <button onClick={profilKaydet} disabled={profilKayit} className="w-full bg-[#00D4FF] hover:bg-[#0099BB] disabled:opacity-40 text-[var(--text)] font-bold py-3 rounded-xl transition text-sm mt-2">
                  {profilKayit ? "Kaydediliyor..." : "Değişiklikleri Kaydet →"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* MOBİL ALT NAVİGASYON */}
        {mobil && (
          <nav className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] flex z-40">
            {navItems.map(m => (
              <button key={m.id} onClick={() => setSayfa(m.id)} className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition ${sayfa === m.id ? "text-[var(--accent-text)]" : "text-[var(--text-3)]"}`}>
                <span className="text-xl leading-none">{m.icon}</span>
                <span className="text-[10px] font-semibold">{m.label}</span>
                {m.badge ? <span className="absolute top-1.5 right-1/4 bg-[#00D4FF] text-[#0B0F14] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{m.badge}</span> : null}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* ARAÇ EKLE MODAL */}
      {aracModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" onClick={() => setAracModal(false)}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-black text-lg">Araç Ekle</h2>
              <button onClick={() => setAracModal(false)} className="w-7 h-7 bg-[var(--surface-2)] rounded-lg text-[var(--text-2)] text-sm">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Plaka *</label>
                  <input value={yeniArac.plaka} onChange={e => setYeniArac({...yeniArac, plaka: e.target.value.toUpperCase()})} placeholder="34 XY 1234" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Araç Türü</label>
                  <div className="relative">
                    <select value={yeniArac.arac_turu} onChange={e => setYeniArac({...yeniArac, arac_turu: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF] appearance-none pr-7">
                      <option value="">Seçin</option>
                      <option>Kamyonet</option>
                      <option>Kamyon</option>
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-2)] text-xs">▼</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Çekici Türü *</label>
                <div className="relative">
                  <select value={yeniArac.tur} onChange={e => setYeniArac({...yeniArac, tur: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF] appearance-none pr-7">
                    <option value="">Seçin</option>
                    <option>Sabit Kasa</option>
                    <option>Kayar Kasa</option>
                    <option>Ahtapot</option>
                    <option>Vinç</option>
                    <option>Çoklu Çekici</option>
                    <option>Gözlüklü Çekici</option>
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-2)] text-xs">▼</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Marka</label>
                  <input value={yeniArac.marka} onChange={e => setYeniArac({...yeniArac, marka: e.target.value})} placeholder="Mercedes, MAN..." className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Model</label>
                  <input value={yeniArac.model} onChange={e => setYeniArac({...yeniArac, model: e.target.value})} placeholder="Actros, TGX..." className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Model Yılı</label>
                <input value={yeniArac.model_yili} onChange={e => setYeniArac({...yeniArac, model_yili: e.target.value})} placeholder="2021" maxLength={4} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF]" />
              </div>
            </div>

            <button onClick={aracEkle} disabled={aracKayit || !yeniArac.plaka || !yeniArac.tur} className="w-full bg-[#00D4FF] hover:bg-[#0099BB] disabled:opacity-40 text-[var(--text)] font-bold py-3 rounded-xl transition text-sm mt-5">
              {aracKayit ? "Kaydediliyor..." : "Aracı Kaydet"}
            </button>
          </div>
        </div>
      )}

      {/* ŞOFÖR EKLE MODAL */}
      {soforModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-5" onClick={() => setSoforModal(false)}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-black text-lg">Şoför Ekle</h2>
              <button onClick={() => setSoforModal(false)} className="w-7 h-7 bg-[var(--surface-2)] rounded-lg text-[var(--text-2)] text-sm">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-2)] mb-2">Ad *</label>
                <input value={yeniSofor.ad} onChange={e => setYeniSofor({ ...yeniSofor, ad: e.target.value })} placeholder="Mehmet" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-2)] mb-2">Soyad</label>
                <input value={yeniSofor.soyad} onChange={e => setYeniSofor({ ...yeniSofor, soyad: e.target.value })} placeholder="Şahin" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF]" />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-[var(--text-2)] mb-2">Telefon *</label>
              <input value={yeniSofor.tel} onChange={e => setYeniSofor({ ...yeniSofor, tel: e.target.value })} placeholder="0532 xxx xx xx" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[#00D4FF]" />
            </div>
            <button onClick={soforEkle} disabled={soforKayit || !yeniSofor.ad || !yeniSofor.tel} className="w-full bg-[#00D4FF] hover:bg-[#0099BB] disabled:opacity-40 text-[var(--text)] font-bold py-3 rounded-xl transition text-sm">
              {soforKayit ? "Kaydediliyor..." : "Şoförü Kaydet"}
            </button>
          </div>
        </div>
      )}

      {/* ATAMA MODAL */}
      {atamaModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-5" onClick={() => setAtamaModal(false)}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            {!atamaTamam ? (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-black text-lg">Fiyat Teklifi Gönder</h2>
                  <button onClick={() => setAtamaModal(false)} className="w-7 h-7 bg-[var(--surface-2)] rounded-lg text-[var(--text-2)] text-sm">✕</button>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-[var(--text-2)] mb-2">Hizmet Fiyatı (₺)</label>
                  <input
                    type="number"
                    value={fiyatTeklifi}
                    onChange={e => setFiyatTeklifi(e.target.value)}
                    placeholder="Örn: 1500"
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-lg font-black text-[var(--text)] outline-none focus:border-[#00D4FF] transition"
                  />
                  <p className="text-[10px] text-[var(--text-3)] mt-1">Müşteri bu fiyatı görüp onaylayacak. Boş bırakabilirsiniz.</p>
                </div>
                <div className="h-px bg-[var(--hover)] mb-4"></div>
                <div className="text-xs text-[var(--text-3)] font-bold uppercase tracking-wide mb-2">Şoför Seç</div>
                {soforler.length === 0 ? (
                  <div className="text-xs text-[var(--text-3)] mb-4 p-3 bg-[var(--surface-2)] rounded-lg">Önce Şoförlerim sekmesinden şoför ekleyin.</div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {soforler.map(s => (
                      <div key={s.id} onClick={() => setSeciliSofor(s.id)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${seciliSofor === s.id ? "border-[#00D4FF] bg-[#00D4FF]/8" : "border-[var(--border)] bg-[var(--surface-2)]"}`}>
                        <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center text-xs font-bold">{s.ad[0]}{s.soyad?.[0] || ""}</div>
                        <div className="flex-1"><div className="text-sm font-bold">{s.ad} {s.soyad}</div><div className="text-xs text-[var(--text-3)]">{s.tel}</div></div>
                        <div className={`w-4 h-4 rounded-full border-2 transition ${seciliSofor === s.id ? "border-[#00D4FF] bg-[#00D4FF]" : "border-[var(--border-2)]"}`}></div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="h-px bg-[var(--hover)] mb-4"></div>
                <div className="text-xs text-[var(--text-3)] font-bold uppercase tracking-wide mb-2">Araç Seç</div>
                {araclar.length === 0 ? (
                  <div className="text-xs text-[var(--text-3)] mb-4 p-3 bg-[var(--surface-2)] rounded-lg">Önce Araçlarım sekmesinden araç ekleyin.</div>
                ) : (
                  <div className="space-y-2 mb-5">
                    {araclar.map(a => (
                      <div key={a.id} onClick={() => setSeciliArac(a.id)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${seciliArac === a.id ? "border-[#00D4FF] bg-[#00D4FF]/8" : "border-[var(--border)] bg-[var(--surface-2)]"}`}>
                        <span className="text-xl">🚛</span>
                        <div className="flex-1"><div className="text-sm font-black tracking-wider">{a.plaka}</div><div className="text-xs text-[var(--text-3)]">{a.tur}</div></div>
                        <div className={`w-4 h-4 rounded-full border-2 transition ${seciliArac === a.id ? "border-[#00D4FF] bg-[#00D4FF]" : "border-[var(--border-2)]"}`}></div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={teklifGonder} disabled={!seciliSofor || !seciliArac || yukleniyor} className="w-full bg-[#00D4FF] hover:bg-[#0099BB] disabled:opacity-40 text-[var(--text)] font-bold py-3 rounded-xl transition text-sm">
                  {yukleniyor ? "Gönderiliyor..." : "💰 Teklifi Gönder"}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">💰</div>
                <div className="font-black text-lg mb-2">Teklif Gönderildi!</div>
                <p className="text-[var(--text-3)] text-xs mb-4 leading-relaxed">Müşteri fiyatı onayladığında şoförü yola çıkartabilirsiniz. Şoföre aşağıdaki linki gönderin.</p>
                <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 mb-4 text-left">
                  <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-1">Şoför Giriş Linki</div>
                  <div className="font-mono text-xs text-[var(--accent-text)] break-all">
                    {typeof window !== "undefined" ? window.location.origin : ""}/sofor
                  </div>
                </div>
                <button
                  onClick={() => {
                    const url = (typeof window !== "undefined" ? window.location.origin : "") + "/sofor";
                    if (navigator.share) { navigator.share({ title: "Şoför Girişi", url }); }
                    else { navigator.clipboard.writeText(url); }
                  }}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#00D4FF]/40 text-[var(--text)] font-bold py-2.5 rounded-xl transition text-sm mb-2"
                >
                  📤 Linki Paylaş / Kopyala
                </button>
                <button onClick={() => { setAtamaModal(false); setSayfa("talepler"); }} className="w-full bg-[#00D4FF] hover:bg-[#0099BB] text-[#0B0F14] font-bold py-3 rounded-xl transition text-sm">Tamam →</button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ŞOFÖR PERFORMANS MODAL */}
      {soforPerformansModal && (() => {
        const s = soforPerformansModal;
        const soforTalepler = talepler.filter(t => t.atanan_sofor === s.id && t.durum === "tamamlandi");
        const toplamKm = soforTalepler.reduce((a, t) => a + (t.toplam_km || 0), 0);
        const toplamSure = soforTalepler.reduce((a, t) => {
          if (!t.ise_baslama_zamani || !t.ise_bitis_zamani) return a;
          return a + (new Date(t.ise_bitis_zamani).getTime() - new Date(t.ise_baslama_zamani).getTime());
        }, 0);
        const sureStr = toplamSure > 0 ? (() => { const dk = Math.floor(toplamSure / 60000); const sa = Math.floor(dk / 60); return sa > 0 ? `${sa}s ${dk % 60}dk` : `${dk}dk`; })() : "—";
        return (
          <div className="fixed inset-0 bg-black/80 z-[150] flex items-end justify-center p-4" onClick={() => setSoforPerformansModal(null)}>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#00D4FF]/15 flex items-center justify-center font-black text-lg">{s.ad[0]}{s.soyad?.[0] || ""}</div>
                  <div><div className="font-black">{s.ad} {s.soyad}</div><div className="text-xs text-[var(--text-3)]">{s.tel}</div></div>
                </div>
                <button onClick={() => setSoforPerformansModal(null)} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-[var(--text-2)]">✕</button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-[var(--bg)] rounded-xl p-3 text-center"><div className="font-black text-2xl text-[#00C853]">{soforTalepler.length}</div><div className="text-[10px] text-[var(--text-3)] mt-0.5">Tamamlanan İş</div></div>
                <div className="bg-[var(--bg)] rounded-xl p-3 text-center"><div className="font-black text-2xl text-[var(--accent-text)]">{toplamKm.toFixed(0)}</div><div className="text-[10px] text-[var(--text-3)] mt-0.5">Toplam KM</div></div>
                <div className="bg-[var(--bg)] rounded-xl p-3 text-center"><div className="font-black text-lg">{sureStr}</div><div className="text-[10px] text-[var(--text-3)] mt-0.5">Toplam Süre</div></div>
              </div>
              {soforTalepler.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-2">Son İşler</div>
                  {soforTalepler.slice(0, 10).map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-[var(--bg)] rounded-xl px-3 py-2">
                      <div><div className="text-xs font-bold">{t.musteri_ad || "Müşteri"}</div><div className="text-[10px] text-[var(--text-3)]">{new Date(t.created_at).toLocaleDateString("tr-TR")}</div></div>
                      {(t.toplam_km || 0) > 0 && <div className="text-xs text-[var(--accent-text)] font-bold">{(t.toplam_km || 0).toFixed(1)} km</div>}
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-4 text-[var(--text-3)] text-sm">Henüz tamamlanan iş yok</div>}
            </div>
          </div>
        );
      })()}

      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col" onClick={() => setLightbox(null)}>
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <span className="text-sm text-[var(--text-2)]">{lightbox.idx + 1} / {lightbox.urls.length}</span>
            <button onClick={() => setLightbox(null)} className="w-9 h-9 rounded-full bg-[var(--hover)] hover:bg-white/20 flex items-center justify-center text-[var(--text)] text-lg transition">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.urls[lightbox.idx]} alt="tam ekran" className="max-w-full max-h-full object-contain rounded-xl" />
          </div>
          {lightbox.urls.length > 1 && (
            <div className="flex justify-center gap-4 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
              <button onClick={() => setLightbox(l => l && l.idx > 0 ? { ...l, idx: l.idx - 1 } : l)} disabled={lightbox.idx === 0}
                className="w-12 h-12 rounded-full bg-[var(--hover)] disabled:opacity-20 flex items-center justify-center text-xl hover:bg-white/20 transition">‹</button>
              <div className="flex items-center gap-2">
                {lightbox.urls.map((_, i) => (
                  <button key={i} onClick={() => setLightbox(l => l ? { ...l, idx: i } : l)}
                    className={`w-2 h-2 rounded-full transition ${i === lightbox.idx ? "bg-white" : "bg-white/30"}`} />
                ))}
              </div>
              <button onClick={() => setLightbox(l => l && l.idx < l.urls.length - 1 ? { ...l, idx: l.idx + 1 } : l)} disabled={lightbox.idx === lightbox.urls.length - 1}
                className="w-12 h-12 rounded-full bg-[var(--hover)] disabled:opacity-20 flex items-center justify-center text-xl hover:bg-white/20 transition">›</button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

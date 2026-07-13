"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { apiPatch } from "../../../lib/api";

type Firma = {
  id: string; firma_ad: string; sahip_ad: string; sahip_soyad: string;
  tel: string; email: string; il: string; ilce: string;
  adres?: string; vergi_no?: string; vergi_dairesi?: string; banka?: string; iban?: string;
  durum: string; k1o_url: string | null; ticaret_sicil_url: string | null; created_at: string;
};
type Arac = { id: string; plaka: string; tur: string; marka?: string; model?: string; model_yili?: string; arac_turu?: string; };
type Sofor = { id: string; ad: string; soyad: string; tel: string; };
type Musteri = {
  id: string; tel: string; ad?: string; soyad?: string;
  arac_marka?: string; arac_model?: string; arac_plaka?: string;
  cekis_turu?: string; yakit_tipi?: string; created_at: string;
};
type Talep = {
  id: string; created_at: string; tip: string; durum: string;
  musteri_id?: string; musteri_ad?: string; musteri_tel?: string; arac_plaka?: string;
  firma_id?: string; atanan_sofor?: string; atanan_arac?: string;
  konum_lat?: number; konum_lng?: number; konum_adres?: string;
  hedef_adres?: string; aciklama?: string;
  sofor_konum_lat?: number; sofor_konum_lng?: number; sofor_konum_updated_at?: string;
  fiyat_teklifi?: number; musteri_puani?: number; musteri_yorumu?: string;
  toplam_km?: number; ise_baslama_zamani?: string; ise_bitis_zamani?: string; is_adim?: string;
  foto_teslim_alma?: string[]; foto_yukleme?: string[]; foto_teslim?: string[]; foto_tutanak?: string[];
};

const DURUM_RENK: Record<string, string> = {
  yeni: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  teklif: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  kabul: "bg-green-500/10 text-green-400 border-green-500/20",
  yolda: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  tamamlandi: "bg-gray-500/10 text-[var(--text-2)] border-gray-500/20",
  reddedildi: "bg-red-500/10 text-red-400 border-red-500/20",
};
const DURUM_LABEL: Record<string, string> = {
  yeni: "⏳ Yeni", teklif: "💰 Teklif", kabul: "✅ Kabul",
  yolda: "🚛 Yolda", tamamlandi: "✔ Tamamlandı", reddedildi: "✕ Reddedildi",
};
function formatSure(ms: number) {
  const sn = Math.floor(ms / 1000), dk = Math.floor(sn / 60), sa = Math.floor(dk / 60);
  return sa > 0 ? `${sa}s ${dk % 60}dk` : `${dk}dk`;
}

export default function AdminPanel() {
  const router = useRouter();
  const [sayfa, setSayfa] = useState("panel");

  // Belge onayı
  const [bekleyenFirmalar, setBekleyenFirmalar] = useState<Firma[]>([]);
  const [belgeYukleniyor, setBelgeYukleniyor] = useState(false);
  const [islemYapiliyor, setIslemYapiliyor] = useState<string | null>(null);
  const [seciliFirmaDetay, setSeciliFirmaDetay] = useState<Firma | null>(null);
  const [belgeUrl, setBelgeUrl] = useState<{ k1o: string | null; ticaret: string | null }>({ k1o: null, ticaret: null });

  // İstatistikler
  const [istatistik, setIstatistik] = useState({ aktif: 0, bekliyor: 0, reddedildi: 0, toplam: 0, talepToplam: 0, talepAktif: 0, talepTamamlandi: 0, musteriToplam: 0 });

  // Firmalar
  const [tumFirmalar, setTumFirmalar] = useState<Firma[]>([]);
  const [firmaListeYukleniyor, setFirmaListeYukleniyor] = useState(false);
  const [seciliFirmaListe, setSeciliFirmaListe] = useState<Firma | null>(null);
  const [firmaAraclar, setFirmaAraclar] = useState<Arac[]>([]);
  const [firmaSoforler, setFirmaSoforler] = useState<Sofor[]>([]);
  const [firmaDetayYukleniyor, setFirmaDetayYukleniyor] = useState(false);
  const [firmaArama, setFirmaArama] = useState("");

  // Kullanıcılar
  const [musteriler, setMusteriler] = useState<Musteri[]>([]);
  const [musteriYukleniyor, setMusteriYukleniyor] = useState(false);
  const [musteriArama, setMusteriArama] = useState("");
  const [seciliMusteri, setSeciliMusteri] = useState<Musteri | null>(null);

  // Talepler
  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [talepYukleniyor, setTalepYukleniyor] = useState(false);
  const [seciliTalep, setSeciliTalep] = useState<Talep | null>(null);
  const [talepFiltre, setTalepFiltre] = useState<string>("hepsi");
  const [talepArama, setTalepArama] = useState("");
  const [lightbox, setLightbox] = useState<{ urls: string[]; idx: number } | null>(null);
  const [firmaMap, setFirmaMap] = useState<Record<string, string>>({});
  const [soforMap, setSoforMap] = useState<Record<string, string>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("admin")) { router.replace("/admin"); }
  }, [router]);

  const bekleyenleriYukle = useCallback(async () => {
    setBelgeYukleniyor(true);
    const { data } = await supabase.from("firmalar")
      .select("id, firma_ad, sahip_ad, sahip_soyad, tel, email, il, ilce, durum, k1o_url, ticaret_sicil_url, created_at")
      .eq("durum", "bekliyor").order("created_at", { ascending: false });
    setBekleyenFirmalar(data || []);
    setBelgeYukleniyor(false);
  }, []);

  const istatistikYukle = useCallback(async () => {
    const [{ data: firmaDat }, { data: talepDat }, { data: musteriDat }] = await Promise.all([
      supabase.from("firmalar").select("durum"),
      supabase.from("talepler").select("durum"),
      supabase.from("musteriler").select("id"),
    ]);
    const f = firmaDat || [], t = talepDat || [];
    setIstatistik({
      aktif: f.filter(x => x.durum === "aktif").length,
      bekliyor: f.filter(x => x.durum === "bekliyor").length,
      reddedildi: f.filter(x => x.durum === "reddedildi").length,
      toplam: f.length,
      talepToplam: t.length,
      talepAktif: t.filter(x => ["yeni","teklif","kabul","yolda"].includes(x.durum)).length,
      talepTamamlandi: t.filter(x => x.durum === "tamamlandi").length,
      musteriToplam: (musteriDat || []).length,
    });
  }, []);

  const tumFirmalariYukle = useCallback(async () => {
    setFirmaListeYukleniyor(true);
    const { data } = await supabase.from("firmalar")
      .select("id, firma_ad, sahip_ad, sahip_soyad, tel, email, il, ilce, adres, vergi_no, vergi_dairesi, banka, iban, durum, k1o_url, ticaret_sicil_url, created_at")
      .order("created_at", { ascending: false });
    setTumFirmalar(data || []);
    setFirmaListeYukleniyor(false);
  }, []);

  const firmaDetayYukle = useCallback(async (firma: Firma) => {
    setSeciliFirmaListe(firma);
    setFirmaAraclar([]); setFirmaSoforler([]);
    setFirmaDetayYukleniyor(true);
    const [{ data: araclar }, { data: soforler }] = await Promise.all([
      supabase.from("araclar").select("id, plaka, tur, marka, model, model_yili, arac_turu").eq("firma_id", firma.id),
      supabase.from("soforler").select("id, ad, soyad, tel").eq("firma_id", firma.id),
    ]);
    setFirmaAraclar(araclar || []);
    setFirmaSoforler(soforler || []);
    setFirmaDetayYukleniyor(false);
  }, []);

  const musteriYukle = useCallback(async () => {
    setMusteriYukleniyor(true);
    const { data } = await supabase.from("musteriler")
      .select("id, tel, ad, soyad, arac_marka, arac_model, arac_plaka, cekis_turu, yakit_tipi, created_at")
      .order("created_at", { ascending: false });
    setMusteriler(data || []);
    setMusteriYukleniyor(false);
  }, []);

  const taleplerYukle = useCallback(async () => {
    setTalepYukleniyor(true);
    const [{ data: talepDat }, { data: firmaDat }, { data: soforDat }] = await Promise.all([
      supabase.from("talepler")
        .select("id, created_at, tip, durum, is_adim, musteri_id, musteri_ad, musteri_tel, arac_plaka, firma_id, atanan_sofor, atanan_arac, konum_lat, konum_lng, konum_adres, hedef_adres, aciklama, sofor_konum_lat, sofor_konum_lng, sofor_konum_updated_at, fiyat_teklifi, musteri_puani, musteri_yorumu, toplam_km, ise_baslama_zamani, ise_bitis_zamani, foto_teslim_alma, foto_yukleme, foto_teslim, foto_tutanak")
        .order("created_at", { ascending: false }),
      supabase.from("firmalar").select("id, firma_ad"),
      supabase.from("soforler").select("id, ad, soyad"),
    ]);
    setTalepler(talepDat || []);
    const fm: Record<string, string> = {};
    (firmaDat || []).forEach(f => { fm[f.id] = f.firma_ad; });
    setFirmaMap(fm);
    const sm: Record<string, string> = {};
    (soforDat || []).forEach(s => { sm[s.id] = `${s.ad} ${s.soyad}`; });
    setSoforMap(sm);
    setTalepYukleniyor(false);
  }, []);

  useEffect(() => { istatistikYukle(); }, [istatistikYukle]);

  useEffect(() => {
    if (sayfa === "belgeler") bekleyenleriYukle();
    if (sayfa === "firmalar") tumFirmalariYukle();
    if (sayfa === "kullanicilar") musteriYukle();
    if (sayfa === "talepler") taleplerYukle();
  }, [sayfa, bekleyenleriYukle, tumFirmalariYukle, musteriYukle, taleplerYukle]);

  // Canlı yenileme — yolda talepler varsa 15s'de bir yenile
  useEffect(() => {
    if (sayfa !== "talepler") { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } return; }
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (talepler.some(t => t.durum === "yolda")) taleplerYukle();
    }, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [sayfa, talepler, taleplerYukle]);

  // Seçili talebi güncelle (canlı konum için)
  useEffect(() => {
    if (!seciliTalep) return;
    const guncellenmis = talepler.find(t => t.id === seciliTalep.id);
    if (guncellenmis) setSeciliTalep(guncellenmis);
  }, [talepler]); // eslint-disable-line

  async function belgeleriGoster(firma: Firma) {
    setSeciliFirmaDetay(firma);
    setBelgeUrl({ k1o: null, ticaret: null });
    const getUrl = async (yol: string | null) => {
      if (!yol) return null;
      const { data } = await supabase.storage.from("belgeler").createSignedUrl(yol, 3600);
      return data?.signedUrl || null;
    };
    const [k1o, ticaret] = await Promise.all([getUrl(firma.k1o_url), getUrl(firma.ticaret_sicil_url)]);
    setBelgeUrl({ k1o, ticaret });
  }

  async function firmaOnayla(id: string) {
    setIslemYapiliyor(id);
    await apiPatch("firmalar", id, { durum: "aktif" });
    setIslemYapiliyor(null); setSeciliFirmaDetay(null); bekleyenleriYukle();
  }
  async function firmaReddet(id: string) {
    setIslemYapiliyor(id + "_red");
    await apiPatch("firmalar", id, { durum: "reddedildi" });
    setIslemYapiliyor(null); setSeciliFirmaDetay(null); bekleyenleriYukle();
  }

  const filtrelenmis = talepler.filter(t => {
    const durumOk = talepFiltre === "hepsi" || t.durum === talepFiltre;
    const aramaOk = !talepArama || (t.musteri_ad || "").toLowerCase().includes(talepArama.toLowerCase()) ||
      (t.musteri_tel || "").includes(talepArama) || (t.arac_plaka || "").toLowerCase().includes(talepArama.toLowerCase()) ||
      (firmaMap[t.firma_id || ""] || "").toLowerCase().includes(talepArama.toLowerCase());
    return durumOk && aramaOk;
  });

  const tumFotolar = seciliTalep ? [
    ...(seciliTalep.foto_teslim_alma || []),
    ...(seciliTalep.foto_yukleme || []),
    ...(seciliTalep.foto_teslim || []),
    ...(seciliTalep.foto_tutanak || []),
  ].filter(Boolean) : [];

  const SAYFA_BASLIK: Record<string, string> = {
    panel: "Genel Bakış", belgeler: "Belge Onayı", firmalar: "Firmalar",
    kullanicilar: "Kullanıcılar", istatistik: "İstatistikler", talepler: "Tüm Talepler",
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex">
      {/* SIDEBAR */}
      <aside className="w-48 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="font-black text-base mb-0.5">Tulpar<span className="text-[var(--accent-text)]"> Assist</span></div>
          <div className="text-[9px] text-[var(--accent-text)] font-bold tracking-widest uppercase">Admin Paneli</div>
        </div>
        <div className="p-3 border-b border-[var(--border)] flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-xs font-black">A</div>
          <div><div className="text-xs font-bold">Admin</div><div className="text-[10px] text-[var(--text-3)]">Süper Admin</div></div>
        </div>
        <nav className="flex-1 p-2">
          <div className="text-[9px] text-[var(--text-3)] font-bold uppercase tracking-widest px-2 py-2">Genel</div>
          {[
            { id:"panel", icon:"📊", label:"Genel Bakış" },
            { id:"talepler", icon:"📋", label:"Tüm Talepler", badge: istatistik.talepAktif > 0 ? String(istatistik.talepAktif) : undefined },
          ].map(m => (
            <button key={m.id} onClick={() => setSayfa(m.id)} className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium mb-0.5 transition text-left ${sayfa===m.id?"bg-[var(--accent-soft)]/10 text-[var(--accent-text)] font-semibold":"text-[var(--text-3)] hover:bg-[var(--hover)] hover:text-[var(--text)]"}`}>
              <span className="text-sm">{m.icon}</span>{m.label}
              {m.badge && <span className="ml-auto bg-[var(--accent)] text-[#0B0F14] text-[9px] font-bold px-1.5 py-0.5 rounded-full">{m.badge}</span>}
            </button>
          ))}
          <div className="text-[9px] text-[var(--text-3)] font-bold uppercase tracking-widest px-2 py-2 mt-2">Yönetim</div>
          {[
            { id:"belgeler", icon:"📄", label:"Belge Onayı", badge: istatistik.bekliyor > 0 ? String(istatistik.bekliyor) : undefined },
            { id:"firmalar", icon:"🏢", label:"Firmalar" },
            { id:"kullanicilar", icon:"👥", label:"Kullanıcılar" },
            { id:"istatistik", icon:"📈", label:"İstatistikler" },
          ].map(m => (
            <button key={m.id} onClick={() => setSayfa(m.id)} className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium mb-0.5 transition text-left ${sayfa===m.id?"bg-[var(--accent-soft)]/10 text-[var(--accent-text)] font-semibold":"text-[var(--text-3)] hover:bg-[var(--hover)] hover:text-[var(--text)]"}`}>
              <span className="text-sm">{m.icon}</span>{m.label}
              {m.badge && <span className="ml-auto bg-red-500 text-[var(--text)] text-[9px] font-bold px-1.5 py-0.5 rounded-full">{m.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-[var(--border)]">
          <button onClick={() => { localStorage.removeItem("admin"); router.push("/admin"); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-[var(--text-3)] hover:text-[var(--text)] transition">
            🚪 Çıkış
          </button>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-5 flex-shrink-0">
          <div className="font-black text-sm">{SAYFA_BASLIK[sayfa] || sayfa}</div>
          {sayfa === "talepler" && (
            <button onClick={taleplerYukle} className="text-xs text-[var(--text-3)] hover:text-[var(--text)] border border-[var(--border)] px-3 py-1.5 rounded-lg transition">⟳ Yenile</button>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">

          {/* GENEL BAKIŞ */}
          {sayfa === "panel" && (
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { l:"Aktif Firma", v: istatistik.aktif, c:"text-[#00C853]", b:"border-[#00C853]/15" },
                  { l:"Onay Bekleyen", v: istatistik.bekliyor, c:"text-[var(--accent-text)]", b:"border-[var(--accent-soft)]/20" },
                  { l:"Toplam Talep", v: istatistik.talepToplam, c:"text-[var(--text)]", b:"" },
                  { l:"Kayıtlı Müşteri", v: istatistik.musteriToplam, c:"text-[var(--text)]", b:"" },
                ].map(s => (
                  <div key={s.l} className={`bg-[var(--surface)] border border-[var(--border)] ${s.b} rounded-xl p-4`}>
                    <div className="text-[11px] text-[var(--text-3)] mb-2">{s.l}</div>
                    <div className={`font-black text-2xl ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { l:"Aktif Talepler", v: istatistik.talepAktif, c:"text-blue-400", icon:"🚛" },
                  { l:"Tamamlanan", v: istatistik.talepTamamlandi, c:"text-[#00C853]", icon:"✔" },
                  { l:"Toplam Firma", v: istatistik.toplam, c:"text-[var(--text)]", icon:"🏢" },
                ].map(s => (
                  <div key={s.l} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{s.icon}</span>
                      <div className="text-[11px] text-[var(--text-3)]">{s.l}</div>
                    </div>
                    <div className={`font-black text-2xl ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                <div className="text-sm font-bold mb-3">Hızlı Erişim</div>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setSayfa("belgeler")} className="bg-[var(--accent-soft)]/10 border border-[var(--accent-soft)]/20 text-[var(--accent-text)] font-bold py-3 rounded-xl text-sm hover:bg-[var(--accent-soft)]/20 transition">📄 Belge Onayla</button>
                  <button onClick={() => setSayfa("talepler")} className="bg-[var(--hover)] border border-[var(--border)] font-bold py-3 rounded-xl text-sm hover:bg-[var(--hover)] transition">📋 Tüm Talepler</button>
                  <button onClick={() => setSayfa("kullanicilar")} className="bg-[var(--hover)] border border-[var(--border)] font-bold py-3 rounded-xl text-sm hover:bg-[var(--hover)] transition">👥 Kullanıcılar</button>
                </div>
              </div>
            </div>
          )}

          {/* TÜM TALEPLER */}
          {sayfa === "talepler" && (
            <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
              {/* SOL — Liste */}
              <div className="border-r border-[var(--border)] flex flex-col overflow-hidden">
                {/* Filtreler */}
                <div className="p-3 border-b border-[var(--border)] space-y-2 flex-shrink-0">
                  <input value={talepArama} onChange={e => setTalepArama(e.target.value)}
                    placeholder="🔍 Müşteri, plaka, firma..."
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition" />
                  <div className="flex gap-1 flex-wrap">
                    {["hepsi","yeni","teklif","kabul","yolda","tamamlandi","reddedildi"].map(f => (
                      <button key={f} onClick={() => setTalepFiltre(f)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border transition ${talepFiltre === f ? "border-[var(--accent)] bg-[var(--accent-soft)]/10 text-[var(--accent-text)]" : "border-[var(--border)] text-[var(--text-3)] hover:border-[var(--border-2)]"}`}>
                        {f === "hepsi" ? `Hepsi (${talepler.length})` : DURUM_LABEL[f]?.replace(/[^\w\s]/g, "").trim() + ` (${talepler.filter(t => t.durum === f).length})`}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Liste */}
                <div className="flex-1 overflow-y-auto">
                  {talepYukleniyor ? (
                    <div className="text-center py-10 text-[var(--text-3)] text-sm">Yükleniyor...</div>
                  ) : filtrelenmis.length === 0 ? (
                    <div className="text-center py-10 text-[var(--text-3)] text-sm">Talep bulunamadı.</div>
                  ) : filtrelenmis.map(t => (
                    <div key={t.id} onClick={() => setSeciliTalep(t)}
                      className={`px-4 py-3 border-b border-[var(--border)] cursor-pointer transition ${seciliTalep?.id === t.id ? "bg-[var(--accent-soft)]/5 border-l-2 border-l-[#00D4FF]" : "hover:bg-white/3"}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs">{t.tip}</span>
                          {t.musteri_ad && <span className="text-[var(--text-3)] text-xs"> · {t.musteri_ad}</span>}
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${DURUM_RENK[t.durum] || ""}`}>
                          {DURUM_LABEL[t.durum] || t.durum}
                        </span>
                      </div>
                      <div className="flex gap-2 text-[10px] text-[var(--text-3)] flex-wrap">
                        <span>{new Date(t.created_at).toLocaleDateString("tr-TR", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}</span>
                        {t.firma_id && <span>🏢 {(firmaMap[t.firma_id] || "—").slice(0,20)}</span>}
                        {t.arac_plaka && <span>🚗 {t.arac_plaka}</span>}
                        {t.durum === "yolda" && t.sofor_konum_updated_at && (
                          <span className="text-blue-400 flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse inline-block"></span>Canlı</span>
                        )}
                        {t.musteri_puani && <span className="text-yellow-400">{"★".repeat(t.musteri_puani)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SAĞ — Detay */}
              <div className="flex flex-col overflow-hidden">
                {!seciliTalep ? (
                  <div className="flex-1 flex items-center justify-center text-[var(--text-3)] text-sm">← Talep seçin</div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {/* Başlık */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black text-lg">{seciliTalep.tip}</div>
                        <div className="text-xs text-[var(--text-3)] mt-0.5">{new Date(seciliTalep.created_at).toLocaleString("tr-TR")}</div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex-shrink-0 ${DURUM_RENK[seciliTalep.durum] || ""}`}>
                        {DURUM_LABEL[seciliTalep.durum] || seciliTalep.durum}
                      </span>
                    </div>

                    {/* Müşteri */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                      <div className="text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest mb-3">👤 Müşteri</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-[var(--text-3)] text-xs">Ad</span><div className="font-semibold">{seciliTalep.musteri_ad || "—"}</div></div>
                        <div><span className="text-[var(--text-3)] text-xs">Tel</span>
                          {seciliTalep.musteri_tel ? (
                            <a href={`tel:${seciliTalep.musteri_tel}`} className="block font-semibold text-blue-400 hover:underline">{seciliTalep.musteri_tel}</a>
                          ) : <div className="font-semibold">—</div>}
                        </div>
                        <div><span className="text-[var(--text-3)] text-xs">Araç Plaka</span><div className="font-bold font-mono">{seciliTalep.arac_plaka || "—"}</div></div>
                        <div><span className="text-[var(--text-3)] text-xs">Müşteri ID</span><div className="font-mono text-xs text-[var(--text-3)] truncate">{seciliTalep.musteri_id || "—"}</div></div>
                      </div>
                    </div>

                    {/* Firma & Şoför */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                      <div className="text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest mb-3">🏢 Firma & Şoför</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-[var(--text-3)] text-xs">Firma</span><div className="font-semibold">{seciliTalep.firma_id ? (firmaMap[seciliTalep.firma_id] || "—") : "Atanmadı"}</div></div>
                        <div><span className="text-[var(--text-3)] text-xs">Şoför</span><div className="font-semibold">{seciliTalep.atanan_sofor ? (soforMap[seciliTalep.atanan_sofor] || "—") : "Atanmadı"}</div></div>
                        <div><span className="text-[var(--text-3)] text-xs">Araç (Firma)</span><div className="font-semibold">{seciliTalep.atanan_arac || "—"}</div></div>
                        {seciliTalep.fiyat_teklifi && <div><span className="text-[var(--text-3)] text-xs">Fiyat</span><div className="font-black text-[var(--accent-text)]">{seciliTalep.fiyat_teklifi.toLocaleString("tr-TR")} ₺</div></div>}
                      </div>
                    </div>

                    {/* Konum */}
                    {(seciliTalep.konum_lat || seciliTalep.konum_adres || seciliTalep.hedef_adres) && (
                      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                        <div className="text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest mb-3">📍 Konum Bilgisi</div>
                        {(seciliTalep.konum_lat || seciliTalep.konum_adres) && (
                          <a href={seciliTalep.konum_lat ? `https://maps.google.com/?q=${seciliTalep.konum_lat},${seciliTalep.konum_lng}` : `https://maps.google.com/?q=${encodeURIComponent(seciliTalep.konum_adres!)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-[var(--accent-soft)]/6 border border-[var(--accent-soft)]/20 rounded-lg px-3 py-2 mb-2 hover:bg-[var(--accent-soft)]/12 transition group">
                            <span>📍</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] text-[var(--text-3)]">Müşteri Konumu</div>
                              <div className="text-xs font-semibold text-[var(--accent-text)] truncate">{seciliTalep.konum_adres || `${seciliTalep.konum_lat?.toFixed(5)}, ${seciliTalep.konum_lng?.toFixed(5)}`}</div>
                            </div>
                            <span className="text-[10px] text-[var(--accent-text)] opacity-60 group-hover:opacity-100">→</span>
                          </a>
                        )}
                        {seciliTalep.hedef_adres && (
                          <div className="flex items-center gap-2 bg-[var(--surface-2)] rounded-lg px-3 py-2">
                            <span>🎯</span>
                            <div><div className="text-[10px] text-[var(--text-3)]">Hedef</div><div className="text-xs font-semibold">{seciliTalep.hedef_adres}</div></div>
                          </div>
                        )}
                        {seciliTalep.aciklama && (
                          <div className="mt-2 text-xs text-yellow-200 bg-yellow-500/5 border border-yellow-500/15 rounded-lg px-3 py-2">💬 &ldquo;{seciliTalep.aciklama}&rdquo;</div>
                        )}
                      </div>
                    )}

                    {/* Canlı Şoför Konumu */}
                    {seciliTalep.sofor_konum_lat && (
                      <div className="bg-[var(--surface)] border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                          <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Şoför Canlı Konum</div>
                          {seciliTalep.sofor_konum_updated_at && (
                            <span className="text-[10px] text-[var(--text-3)] ml-auto">
                              {new Date(seciliTalep.sofor_konum_updated_at).toLocaleTimeString("tr-TR")}
                            </span>
                          )}
                        </div>
                        <a href={`https://maps.google.com/?q=${seciliTalep.sofor_konum_lat},${seciliTalep.sofor_konum_lng}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-blue-500/8 border border-blue-500/20 rounded-lg px-3 py-2 hover:bg-blue-500/15 transition">
                          <span>🚛</span>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-blue-400">{seciliTalep.sofor_konum_lat.toFixed(5)}, {seciliTalep.sofor_konum_lng?.toFixed(5)}</div>
                            <div className="text-[10px] text-[var(--text-3)] mt-0.5">{soforMap[seciliTalep.atanan_sofor || ""] || "Şoför"} · Google Maps&apos;te Aç →</div>
                          </div>
                        </a>
                      </div>
                    )}

                    {/* İş Özeti */}
                    {(seciliTalep.toplam_km || seciliTalep.ise_baslama_zamani) && (
                      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                        <div className="text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest mb-3">📊 İş Özeti</div>
                        <div className="grid grid-cols-3 gap-3">
                          {seciliTalep.toplam_km != null && (
                            <div className="text-center bg-[var(--surface-2)] rounded-lg p-3">
                              <div className="font-black text-xl text-[var(--accent-text)]">{seciliTalep.toplam_km.toFixed(1)}</div>
                              <div className="text-[10px] text-[var(--text-3)] mt-0.5">km</div>
                            </div>
                          )}
                          {seciliTalep.ise_baslama_zamani && seciliTalep.ise_bitis_zamani && (
                            <div className="text-center bg-[var(--surface-2)] rounded-lg p-3">
                              <div className="font-black text-xl">{formatSure(new Date(seciliTalep.ise_bitis_zamani).getTime() - new Date(seciliTalep.ise_baslama_zamani).getTime())}</div>
                              <div className="text-[10px] text-[var(--text-3)] mt-0.5">süre</div>
                            </div>
                          )}
                          {seciliTalep.fiyat_teklifi && (
                            <div className="text-center bg-[var(--surface-2)] rounded-lg p-3">
                              <div className="font-black text-xl text-[var(--accent-text)]">{seciliTalep.fiyat_teklifi.toLocaleString("tr-TR")}</div>
                              <div className="text-[10px] text-[var(--text-3)] mt-0.5">₺</div>
                            </div>
                          )}
                        </div>
                        {seciliTalep.ise_baslama_zamani && (
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-[var(--text-3)]">Başlama: </span>{new Date(seciliTalep.ise_baslama_zamani).toLocaleString("tr-TR")}</div>
                            {seciliTalep.ise_bitis_zamani && <div><span className="text-[var(--text-3)]">Bitiş: </span>{new Date(seciliTalep.ise_bitis_zamani).toLocaleString("tr-TR")}</div>}
                          </div>
                        )}
                        {seciliTalep.is_adim && (
                          <div className="mt-2 text-xs"><span className="text-[var(--text-3)]">Şu an: </span><span className="font-bold text-[var(--accent-text)]">{seciliTalep.is_adim}</span></div>
                        )}
                      </div>
                    )}

                    {/* Değerlendirme */}
                    {seciliTalep.musteri_puani && (
                      <div className="bg-[var(--surface)] border border-yellow-500/20 rounded-xl p-4">
                        <div className="text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest mb-2">⭐ Müşteri Değerlendirmesi</div>
                        <div className="flex gap-1 mb-2">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-xl ${s <= seciliTalep.musteri_puani! ? "text-yellow-400" : "text-[var(--text-3)]"}`}>★</span>
                          ))}
                          <span className="text-sm text-yellow-400 font-bold ml-2">{seciliTalep.musteri_puani} / 5</span>
                        </div>
                        {seciliTalep.musteri_yorumu && (
                          <div className="text-sm text-[var(--text-2)] italic">&ldquo;{seciliTalep.musteri_yorumu}&rdquo;</div>
                        )}
                      </div>
                    )}

                    {/* Fotoğraflar */}
                    {tumFotolar.length > 0 && (
                      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                        <div className="text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest mb-3">📸 Fotoğraflar ({tumFotolar.length})</div>
                        {/* Bölümlere göre */}
                        {(["teslim_alma","yukleme","teslim","tutanak"] as const).map(step => {
                          const key = step === "teslim_alma" ? "foto_teslim_alma" : step === "yukleme" ? "foto_yukleme" : step === "teslim" ? "foto_teslim" : "foto_tutanak";
                          const arr = (seciliTalep[key as keyof Talep] as string[] | undefined || []).filter(Boolean);
                          if (!arr.length) return null;
                          const labels: Record<string, string> = { teslim_alma:"Teslim Alma", yukleme:"Yükleme", teslim:"Teslim", tutanak:"Tutanak" };
                          return (
                            <div key={step} className="mb-3">
                              <div className="text-[10px] text-[var(--text-3)] font-bold mb-1.5">{labels[step]} ({arr.length})</div>
                              <div className="grid grid-cols-4 gap-1.5">
                                {arr.map((url, i) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img key={i} src={url} alt="" onClick={() => setLightbox({ urls: tumFotolar, idx: tumFotolar.indexOf(url) })}
                                    className="aspect-square rounded-lg object-cover border border-[var(--border)] cursor-pointer hover:opacity-80 transition" />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Talep ID */}
                    <div className="text-[10px] text-[var(--text-3)] font-mono">ID: {seciliTalep.id}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BELGE ONAYI */}
          {sayfa === "belgeler" && (
            <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
              <div className="border-r border-[var(--border)] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-[var(--border)] text-xs text-[var(--text-3)] flex-shrink-0">
                  {belgeYukleniyor ? "Yükleniyor..." : `${bekleyenFirmalar.length} başvuru bekliyor`}
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  {bekleyenFirmalar.length === 0 && !belgeYukleniyor ? (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center text-[var(--text-3)] text-sm">✅ Bekleyen başvuru yok.</div>
                  ) : bekleyenFirmalar.map(f => (
                    <div key={f.id} onClick={() => belgeleriGoster(f)}
                      className={`p-4 rounded-xl border cursor-pointer transition mb-2 ${seciliFirmaDetay?.id === f.id ? "border-[var(--accent)] bg-[var(--accent-soft)]/4" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)]"}`}>
                      <div className="font-bold text-sm mb-1">{f.firma_ad}</div>
                      <div className="text-xs text-[var(--text-3)]">{f.sahip_ad} {f.sahip_soyad} · {f.il}</div>
                      <div className="text-xs text-[var(--text-3)] mt-1">{f.tel}</div>
                      <div className="flex gap-1 mt-2">
                        {f.k1o_url && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">K1Ö</span>}
                        {f.ticaret_sicil_url && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">Ticaret Sicil</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col overflow-hidden">
                {seciliFirmaDetay ? (
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-[var(--border)] flex-shrink-0">
                      <div className="font-black text-base">{seciliFirmaDetay.firma_ad}</div>
                      <div className="text-xs text-[var(--text-2)] mt-1">{seciliFirmaDetay.sahip_ad} {seciliFirmaDetay.sahip_soyad} · {seciliFirmaDetay.il} / {seciliFirmaDetay.ilce}</div>
                      <div className="text-xs text-[var(--text-3)]">{seciliFirmaDetay.tel} {seciliFirmaDetay.email && `· ${seciliFirmaDetay.email}`}</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div className="text-xs font-bold text-[var(--text-2)] uppercase tracking-wider">Belgeler</div>
                      <div>
                        <div className="text-xs text-[var(--text-3)] mb-2">K1Ö Yetki Belgesi</div>
                        {belgeUrl.k1o ? <a href={belgeUrl.k1o} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/20 transition">📄 Belgeyi Görüntüle →</a>
                          : seciliFirmaDetay.k1o_url ? <div className="text-xs text-[var(--text-3)]">Yükleniyor...</div>
                          : <div className="text-xs text-red-400">⚠️ Belge yüklenmemiş</div>}
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-3)] mb-2">Ticaret Sicil Belgesi</div>
                        {belgeUrl.ticaret ? <a href={belgeUrl.ticaret} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/20 transition">📄 Belgeyi Görüntüle →</a>
                          : seciliFirmaDetay.ticaret_sicil_url ? <div className="text-xs text-[var(--text-3)]">Yükleniyor...</div>
                          : <div className="text-xs text-red-400">⚠️ Belge yüklenmemiş</div>}
                      </div>
                    </div>
                    <div className="p-4 border-t border-[var(--border)] flex gap-2 flex-shrink-0">
                      <button onClick={() => firmaOnayla(seciliFirmaDetay.id)} disabled={!!islemYapiliyor}
                        className="flex-1 bg-[#00C853]/10 border border-[#00C853]/25 text-[#00C853] font-bold py-2.5 rounded-xl text-sm hover:bg-[#00C853]/20 transition disabled:opacity-40">
                        {islemYapiliyor === seciliFirmaDetay.id ? "İşleniyor..." : "✓ Onayla"}
                      </button>
                      <button onClick={() => firmaReddet(seciliFirmaDetay.id)} disabled={!!islemYapiliyor}
                        className="flex-1 bg-red-500/8 border border-red-500/20 text-red-400 font-bold py-2.5 rounded-xl text-sm hover:bg-red-500/15 transition disabled:opacity-40">
                        {islemYapiliyor === seciliFirmaDetay.id + "_red" ? "İşleniyor..." : "✕ Reddet"}
                      </button>
                    </div>
                  </div>
                ) : <div className="flex-1 flex items-center justify-center text-[var(--text-3)] text-sm">← Firma seçin</div>}
              </div>
            </div>
          )}

          {/* FİRMALAR */}
          {sayfa === "firmalar" && (
            <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
              <div className="border-r border-[var(--border)] flex flex-col overflow-hidden">
                <div className="p-3 border-b border-[var(--border)] space-y-2 flex-shrink-0">
                  <input value={firmaArama} onChange={e => setFirmaArama(e.target.value)} placeholder="🔍 Firma ara..."
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition" />
                  <div className="text-xs text-[var(--text-3)]">{firmaListeYukleniyor ? "Yükleniyor..." : `${tumFirmalar.length} firma`}</div>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  {tumFirmalar.filter(f => !firmaArama || f.firma_ad.toLowerCase().includes(firmaArama.toLowerCase()) || f.il?.toLowerCase().includes(firmaArama.toLowerCase())).map(f => (
                    <div key={f.id} onClick={() => firmaDetayYukle(f)}
                      className={`p-3 rounded-xl border cursor-pointer transition mb-2 ${seciliFirmaListe?.id === f.id ? "border-[var(--accent)] bg-[var(--accent-soft)]/4" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)]"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate">{f.firma_ad}</div>
                          <div className="text-xs text-[var(--text-3)] mt-0.5">{f.il}{f.ilce ? ` / ${f.ilce}` : ""} · {f.tel}</div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${f.durum==="aktif"?"bg-[#00C853]/10 text-[#00C853]":f.durum==="bekliyor"?"bg-[var(--accent-soft)]/10 text-[var(--accent-text)]":"bg-red-500/10 text-red-400"}`}>
                          {f.durum==="aktif"?"Aktif":f.durum==="bekliyor"?"Bekliyor":"Reddedildi"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col overflow-hidden">
                {seciliFirmaListe ? (
                  firmaDetayYukleniyor ? (
                    <div className="flex-1 flex items-center justify-center text-[var(--text-3)] text-sm">Yükleniyor...</div>
                  ) : (
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-4 border-b border-[var(--border)]">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="font-black text-base">{seciliFirmaListe.firma_ad}</div>
                            <div className="text-xs text-[var(--text-2)] mt-0.5">{seciliFirmaListe.sahip_ad} {seciliFirmaListe.sahip_soyad}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 border ${seciliFirmaListe.durum==="aktif"?"bg-[#00C853]/10 text-[#00C853] border-[#00C853]/20":seciliFirmaListe.durum==="bekliyor"?"bg-[var(--accent-soft)]/10 text-[var(--accent-text)] border-[var(--accent-soft)]/20":"bg-red-500/10 text-red-400 border-red-500/20"}`}>
                            {seciliFirmaListe.durum==="aktif"?"✓ Aktif":seciliFirmaListe.durum==="bekliyor"?"⏳ Bekliyor":"✕ Reddedildi"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {seciliFirmaListe.tel && <div><span className="text-[var(--text-3)]">Tel: </span>{seciliFirmaListe.tel}</div>}
                          {seciliFirmaListe.email && <div><span className="text-[var(--text-3)]">E-posta: </span>{seciliFirmaListe.email}</div>}
                          {seciliFirmaListe.adres && <div className="col-span-2"><span className="text-[var(--text-3)]">Adres: </span>{seciliFirmaListe.adres}</div>}
                          {seciliFirmaListe.vergi_no && <div><span className="text-[var(--text-3)]">Vergi No: </span>{seciliFirmaListe.vergi_no}</div>}
                          {seciliFirmaListe.banka && <div><span className="text-[var(--text-3)]">Banka: </span>{seciliFirmaListe.banka}</div>}
                          {seciliFirmaListe.iban && <div className="col-span-2"><span className="text-[var(--text-3)]">IBAN: </span><span className="font-mono">{seciliFirmaListe.iban}</span></div>}
                        </div>
                      </div>
                      <div className="p-4 border-b border-[var(--border)]">
                        <div className="text-xs font-bold text-[var(--text-2)] uppercase tracking-wider mb-3">Araçlar ({firmaAraclar.length})</div>
                        {firmaAraclar.length === 0 ? <div className="text-xs text-[var(--text-3)]">Araç eklenmemiş.</div> : (
                          <div className="space-y-2">
                            {firmaAraclar.map(a => (
                              <div key={a.id} className="flex items-center gap-2 bg-[var(--surface-2)] rounded-lg px-3 py-2">
                                <span className="text-base">🚛</span>
                                <div><div className="font-bold text-xs">{a.plaka}</div><div className="text-[11px] text-[var(--text-3)]">{[a.arac_turu, a.tur, a.marka, a.model, a.model_yili].filter(Boolean).join(" · ")}</div></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="text-xs font-bold text-[var(--text-2)] uppercase tracking-wider mb-3">Şoförler ({firmaSoforler.length})</div>
                        {firmaSoforler.length === 0 ? <div className="text-xs text-[var(--text-3)]">Şoför eklenmemiş.</div> : (
                          <div className="space-y-2">
                            {firmaSoforler.map(s => (
                              <div key={s.id} className="flex items-center gap-2 bg-[var(--surface-2)] rounded-lg px-3 py-2">
                                <div className="w-7 h-7 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-xs font-bold flex-shrink-0">{s.ad[0]}{s.soyad?.[0]||""}</div>
                                <div><div className="font-bold text-xs">{s.ad} {s.soyad}</div><div className="text-[11px] text-[var(--text-3)]">{s.tel}</div></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : <div className="flex-1 flex items-center justify-center text-[var(--text-3)] text-sm">← Firma seçin</div>}
              </div>
            </div>
          )}

          {/* KULLANICILAR */}
          {sayfa === "kullanicilar" && (
            <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
              <div className="border-r border-[var(--border)] flex flex-col overflow-hidden">
                <div className="p-3 border-b border-[var(--border)] space-y-2 flex-shrink-0">
                  <input value={musteriArama} onChange={e => setMusteriArama(e.target.value)} placeholder="🔍 İsim veya telefon ara..."
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition" />
                  <div className="text-xs text-[var(--text-3)]">{musteriYukleniyor ? "Yükleniyor..." : `${musteriler.length} kayıtlı kullanıcı`}</div>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  {musteriler.filter(m => !musteriArama || `${m.ad||""} ${m.soyad||""}`.toLowerCase().includes(musteriArama.toLowerCase()) || m.tel.includes(musteriArama)).map(m => (
                    <div key={m.id} onClick={() => setSeciliMusteri(m)}
                      className={`p-3 rounded-xl border cursor-pointer transition mb-2 ${seciliMusteri?.id === m.id ? "border-[var(--accent)] bg-[var(--accent-soft)]/4" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)]"}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-xs font-bold flex-shrink-0">{m.ad ? m.ad[0].toUpperCase() : "?"}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate">{m.ad ? `${m.ad}${m.soyad ? " " + m.soyad : ""}` : "İsimsiz"}</div>
                          <div className="text-xs text-[var(--text-3)]">{m.tel}</div>
                        </div>
                        {m.arac_plaka && <span className="text-[10px] font-mono bg-[var(--surface-2)] text-[var(--text-2)] px-2 py-0.5 rounded flex-shrink-0">{m.arac_plaka}</span>}
                      </div>
                    </div>
                  ))}
                  {!musteriYukleniyor && musteriler.length === 0 && (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center text-[var(--text-3)] text-sm">Henüz kayıtlı kullanıcı yok.</div>
                  )}
                </div>
              </div>
              <div className="flex flex-col overflow-hidden">
                {seciliMusteri ? (
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)]/15 border border-[var(--accent-soft)]/20 flex items-center justify-center text-xl font-black text-[var(--accent-text)] flex-shrink-0">
                        {seciliMusteri.ad ? seciliMusteri.ad[0].toUpperCase() : "👤"}
                      </div>
                      <div>
                        <div className="font-black text-base">{seciliMusteri.ad ? `${seciliMusteri.ad}${seciliMusteri.soyad ? " " + seciliMusteri.soyad : ""}` : "İsim girilmemiş"}</div>
                        <div className="text-xs text-[var(--text-2)] mt-0.5">{seciliMusteri.tel}</div>
                        <div className="text-[10px] text-[var(--text-3)] mt-0.5">Kayıt: {new Date(seciliMusteri.created_at).toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" })}</div>
                      </div>
                    </div>
                    <div className="p-4 border-b border-[var(--border)]">
                      <div className="text-[10px] text-[var(--text-3)] font-bold uppercase tracking-widest mb-3">Araç Bilgileri</div>
                      {(seciliMusteri.arac_marka || seciliMusteri.arac_plaka) ? (
                        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 space-y-2 text-sm">
                          {seciliMusteri.arac_marka && <div className="flex justify-between"><span className="text-[var(--text-3)]">Marka / Model</span><span className="font-semibold">{seciliMusteri.arac_marka}{seciliMusteri.arac_model ? " " + seciliMusteri.arac_model : ""}</span></div>}
                          {seciliMusteri.arac_plaka && <div className="flex justify-between"><span className="text-[var(--text-3)]">Plaka</span><span className="font-bold font-mono tracking-wider">{seciliMusteri.arac_plaka}</span></div>}
                          {seciliMusteri.cekis_turu && <div className="flex justify-between"><span className="text-[var(--text-3)]">Çekiş Türü</span><span className="font-semibold">{seciliMusteri.cekis_turu}</span></div>}
                          {seciliMusteri.yakit_tipi && <div className="flex justify-between"><span className="text-[var(--text-3)]">Yakıt Tipi</span><span className="font-semibold">{seciliMusteri.yakit_tipi}</span></div>}
                        </div>
                      ) : <div className="text-xs text-[var(--text-3)]">Araç bilgisi girilmemiş.</div>}
                    </div>
                    <div className="p-4">
                      <button onClick={() => { setTalepArama(seciliMusteri.tel); setSayfa("talepler"); }}
                        className="w-full text-xs font-bold border border-[var(--border)] hover:border-[var(--accent-soft)]/30 text-[var(--text-2)] hover:text-[var(--accent-text)] py-2 rounded-lg transition">
                        📋 Bu müşterinin taleplerini gör →
                      </button>
                    </div>
                  </div>
                ) : <div className="flex-1 flex items-center justify-center text-[var(--text-3)] text-sm">← Kullanıcı seçin</div>}
              </div>
            </div>
          )}

          {/* İSTATİSTİK */}
          {sayfa === "istatistik" && (
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { l:"Toplam Talep", v: istatistik.talepToplam, c:"text-[var(--text)]" },
                  { l:"Aktif Talepler", v: istatistik.talepAktif, c:"text-blue-400" },
                  { l:"Tamamlanan", v: istatistik.talepTamamlandi, c:"text-[#00C853]" },
                  { l:"Toplam Firma", v: istatistik.toplam, c:"text-[var(--text)]" },
                  { l:"Aktif Firma", v: istatistik.aktif, c:"text-[#00C853]" },
                  { l:"Onay Bekleyen", v: istatistik.bekliyor, c:"text-[var(--accent-text)]" },
                  { l:"Kayıtlı Müşteri", v: istatistik.musteriToplam, c:"text-[var(--text)]" },
                  { l:"Reddedilen Firma", v: istatistik.reddedildi, c:"text-red-400" },
                ].map(s => (
                  <div key={s.l} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                    <div className="text-[11px] text-[var(--text-3)] mb-2">{s.l}</div>
                    <div className={`font-black text-3xl ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Talep Dağılımı Grafiği */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-4">
                <div className="text-xs text-[var(--text-3)] uppercase font-bold mb-4">Talep Dağılımı</div>
                {(() => {
                  const bars = [
                    { l: "Aktif", v: istatistik.talepAktif, c: "bg-blue-500", tc: "text-blue-400" },
                    { l: "Tamamlanan", v: istatistik.talepTamamlandi, c: "bg-[#00C853]", tc: "text-[#00C853]" },
                    { l: "Toplam", v: istatistik.talepToplam, c: "bg-white/30", tc: "text-[var(--text)]" },
                  ];
                  const max = Math.max(...bars.map(b => b.v), 1);
                  return bars.map(b => (
                    <div key={b.l} className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--text-2)]">{b.l}</span>
                        <span className={`text-xs font-black ${b.tc}`}>{b.v}</span>
                      </div>
                      <div className="h-2 bg-[var(--hover)] rounded-full overflow-hidden">
                        <div className={`h-full ${b.c} rounded-full transition-all duration-700`} style={{ width: `${(b.v / max) * 100}%` }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Firma Dağılımı Grafiği */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <div className="text-xs text-[var(--text-3)] uppercase font-bold mb-4">Firma Durumu</div>
                {(() => {
                  const bars = [
                    { l: "Aktif", v: istatistik.aktif, c: "bg-[#00C853]", tc: "text-[#00C853]" },
                    { l: "Onay Bekleyen", v: istatistik.bekliyor, c: "bg-[var(--accent)]", tc: "text-[var(--accent-text)]" },
                    { l: "Reddedilen", v: istatistik.reddedildi, c: "bg-red-700", tc: "text-red-400" },
                    { l: "Toplam", v: istatistik.toplam, c: "bg-white/30", tc: "text-[var(--text)]" },
                  ];
                  const max = Math.max(...bars.map(b => b.v), 1);
                  return bars.map(b => (
                    <div key={b.l} className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--text-2)]">{b.l}</span>
                        <span className={`text-xs font-black ${b.tc}`}>{b.v}</span>
                      </div>
                      <div className="h-2 bg-[var(--hover)] rounded-full overflow-hidden">
                        <div className={`h-full ${b.c} rounded-full transition-all duration-700`} style={{ width: `${(b.v / max) * 100}%` }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* LIGHTBOX */}
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

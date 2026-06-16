"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Arac = { id: string; plaka: string; tur: string; marka?: string; model?: string; model_yili?: string; arac_turu?: string; };
type FirmaDetay = {
  firma_ad: string; sahip_ad: string; sahip_soyad: string; tel: string; email: string;
  il: string; ilce: string; adres: string; vergi_no: string; vergi_dairesi: string;
  banka: string; iban: string;
};
type Sofor = { id: string; ad: string; soyad: string; tel: string; };
type Talep = {
  id: string; tip: string; durum: string; created_at: string;
  musteri_ad?: string; musteri_tel?: string;
  konum_adres?: string; hedef_adres?: string; arac_plaka?: string; not?: string;
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

  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState("");

  // Profil
  const [profil, setProfil] = useState<FirmaDetay>({ firma_ad:"", sahip_ad:"", sahip_soyad:"", tel:"", email:"", il:"", ilce:"", adres:"", vergi_no:"", vergi_dairesi:"", banka:"", iban:"" });
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
    const { data } = await supabase.from("firmalar").select("firma_ad, sahip_ad, sahip_soyad, tel, email, il, ilce, adres, vergi_no, vergi_dairesi, banka, iban").eq("id", id).single();
    if (data) setProfil({ firma_ad: data.firma_ad||"", sahip_ad: data.sahip_ad||"", sahip_soyad: data.sahip_soyad||"", tel: data.tel||"", email: data.email||"", il: data.il||"", ilce: data.ilce||"", adres: data.adres||"", vergi_no: data.vergi_no||"", vergi_dairesi: data.vergi_dairesi||"", banka: data.banka||"", iban: data.iban||"" });
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
    const { data } = await supabase
      .from("talepler")
      .select("id, tip, durum, created_at, musteri_ad, musteri_tel, konum_adres, hedef_adres, arac_plaka, not")
      .eq("firma_id", id)
      .order("created_at", { ascending: false });
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
    const { error } = await supabase.from("firmalar").update({
      firma_ad: profil.firma_ad, tel: profil.tel, email: profil.email,
      adres: profil.adres, vergi_no: profil.vergi_no, vergi_dairesi: profil.vergi_dairesi,
      banka: profil.banka, iban: profil.iban,
    }).eq("id", firmaId);
    setProfilKayit(false);
    if (!error) { setBasari("Profil kaydedildi."); setTimeout(() => setBasari(""), 3000); }
    else setHata("Kayıt hatası: " + error.message);
  }

  async function aracEkle() {
    if (!yeniArac.plaka || !yeniArac.tur || !firmaId) return;
    setAracKayit(true);
    const { error } = await supabase.from("araclar").insert({
      firma_id: firmaId, plaka: yeniArac.plaka.toUpperCase(), tur: yeniArac.tur,
      marka: yeniArac.marka || null, model: yeniArac.model || null,
      model_yili: yeniArac.model_yili || null, arac_turu: yeniArac.arac_turu || null,
    });
    setAracKayit(false);
    if (!error) { setYeniArac({ plaka: "", tur: "", marka: "", model: "", model_yili: "", arac_turu: "" }); setAracModal(false); araclarYukle(firmaId); }
    else setHata("Araç eklenemedi: " + error.message);
  }

  async function aracSil(id: string) {
    await supabase.from("araclar").delete().eq("id", id);
    if (firmaId) araclarYukle(firmaId);
  }

  async function soforEkle() {
    if (!yeniSofor.ad || !yeniSofor.tel || !firmaId) return;
    setSoforKayit(true);
    const { error } = await supabase.from("soforler").insert({ firma_id: firmaId, ad: yeniSofor.ad, soyad: yeniSofor.soyad, tel: yeniSofor.tel });
    setSoforKayit(false);
    if (!error) { setYeniSofor({ ad: "", soyad: "", tel: "" }); setSoforModal(false); soforlerYukle(firmaId); }
    else setHata("Şoför eklenemedi: " + error.message);
  }

  async function soforSil(id: string) {
    await supabase.from("soforler").delete().eq("id", id);
    if (firmaId) soforlerYukle(firmaId);
  }

  async function talepKabul() {
    if (!seciliSofor || !seciliArac || !seciliTalep) return;
    setYukleniyor(true);
    await supabase.from("talepler").update({ durum: "kabul", atanan_sofor: seciliSofor, atanan_arac: seciliArac }).eq("id", seciliTalep.id);
    setYukleniyor(false);
    setAtamaTamam(true);
    if (firmaId) taleplerYukle(firmaId);
  }

  async function talepReddet(talepId: string) {
    await supabase.from("talepler").update({ durum: "reddedildi" }).eq("id", talepId);
    if (firmaId) taleplerYukle(firmaId);
  }

  const yeniTalepler = talepler.filter(t => t.durum === "yeni" || t.durum === "bekliyor");

  const navItems = [
    { id: "panel", icon: "📊", label: "Panel" },
    { id: "talepler", icon: "📋", label: "Talepler", badge: yeniTalepler.length || undefined },
    { id: "araclar", icon: "🚛", label: "Araçlar" },
    { id: "soforler", icon: "👤", label: "Şoförler" },
    { id: "profil", icon: "🏢", label: "Profil" },
  ];

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex">
      {/* SIDEBAR — sadece masaüstü */}
      {!mobil && (
        <aside className="w-48 bg-[#1A1A1A] border-r border-white/5 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-white/5">
            <div className="font-black text-base mb-0.5">Tulpar<span className="text-[#FF4D00]"> Assist</span></div>
            <div className="text-[9px] text-gray-500">Firma Paneli</div>
          </div>
          <div className="p-3 border-b border-white/5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF4D00]/15 flex items-center justify-center text-sm">🚛</div>
            <div>
              <div className="text-xs font-bold truncate w-28">{firmaAd}</div>
              <div className="text-[10px] text-[#00C853] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse"></span>Aktif
              </div>
            </div>
          </div>
          <nav className="flex-1 p-2">
            {navItems.map(m => (
              <button key={m.id} onClick={() => setSayfa(m.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-0.5 transition text-left ${sayfa === m.id ? "bg-[#FF4D00]/10 text-[#FF4D00] font-semibold" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}>
                <span className="text-sm">{m.icon}</span>{m.label}
                {m.badge ? <span className="ml-auto bg-[#FF4D00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{m.badge}</span> : null}
              </button>
            ))}
          </nav>
          <div className="p-2 border-t border-white/5">
            <button onClick={() => { localStorage.removeItem("firma"); router.push("/firma/giris"); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:text-white transition">
              🚪 Çıkış
            </button>
          </div>
        </aside>
      )}

      {/* ANA İÇERİK */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobil header */}
        {mobil ? (
          <div className="bg-[#1A1A1A] border-b border-white/5 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div>
              <div className="font-black text-sm truncate max-w-[200px]">{firmaAd}</div>
              <div className="text-[10px] text-[#00C853] flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse"></span>Aktif
              </div>
            </div>
            <button onClick={() => { localStorage.removeItem("firma"); router.push("/firma/giris"); }} className="text-xs text-gray-500 border border-white/10 rounded-lg px-3 py-1.5">
              Çıkış
            </button>
          </div>
        ) : (
          <div className="h-12 bg-[#1A1A1A] border-b border-white/5 flex items-center justify-between px-5 flex-shrink-0">
            <div className="font-black text-sm">
              {sayfa === "panel" ? "Panel" : sayfa === "talepler" ? "Talepler" : sayfa === "araclar" ? "Araçlarım" : "Şoförlerim"}
            </div>
            {yeniTalepler.length > 0 && (
              <button onClick={() => setSayfa("talepler")} className="text-[11px] text-[#FF4D00] font-bold bg-[#FF4D00]/10 border border-[#FF4D00]/25 px-3 py-1.5 rounded-lg animate-pulse">
                🔴 {yeniTalepler.length} Yeni Talep
              </button>
            )}
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
            <button onClick={() => setSayfa("talepler")} className="w-full bg-[#FF4D00]/10 border border-[#FF4D00]/30 rounded-xl px-4 py-3 flex items-center justify-between mb-4 animate-pulse">
              <span className="text-sm font-bold text-[#FF4D00]">🔴 {yeniTalepler.length} Yeni Talep</span>
              <span className="text-[#FF4D00]">→</span>
            </button>
          )}

          {/* PANEL */}
          {sayfa === "panel" && (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-[#1A1A1A] border border-[#FF4D00]/25 rounded-xl p-4">
                  <div className="text-[11px] text-gray-500 mb-2">Bekleyen Talep</div>
                  <div className="font-black text-2xl text-[#FF4D00]">{yeniTalepler.length}</div>
                </div>
                <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4">
                  <div className="text-[11px] text-gray-500 mb-2">Araç</div>
                  <div className="font-black text-2xl">{araclar.length}</div>
                </div>
                <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4">
                  <div className="text-[11px] text-gray-500 mb-2">Şoför</div>
                  <div className="font-black text-2xl">{soforler.length}</div>
                </div>
              </div>
              {yeniTalepler.length > 0 ? (
                <div className="bg-[#FF4D00]/6 border border-[#FF4D00]/20 rounded-xl p-4 flex items-center justify-between cursor-pointer" onClick={() => setSayfa("talepler")}>
                  <div>
                    <div className="font-bold text-sm">🔴 Yeni Talep Var!</div>
                    <div className="text-xs text-gray-500 mt-1">{yeniTalepler.length} talep bekliyor</div>
                  </div>
                  <span className="text-[#FF4D00]">→</span>
                </div>
              ) : (
                <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-8 text-center text-gray-500 text-sm">
                  Şu an bekleyen talep yok.
                </div>
              )}
            </div>
          )}

          {/* TALEPLER */}
          {sayfa === "talepler" && (
            <div className="space-y-3">
              {talepler.length === 0 ? (
                <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-10 text-center text-gray-500 text-sm">
                  Henüz talep gelmedi. Talepler burada görünecek.
                </div>
              ) : talepler.map(t => (
                <div key={t.id} className={`bg-[#1A1A1A] border rounded-2xl overflow-hidden ${t.durum === "yeni" || t.durum === "bekliyor" ? "border-[#FF4D00]" : "border-white/8"}`}>
                  <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#FF4D00]/10 flex items-center justify-center text-base">🚛</div>
                      <div>
                        <div className="text-[11px] text-gray-500">{new Date(t.created_at).toLocaleString("tr-TR")}</div>
                        <div className="font-bold text-sm">{t.tip || "Çekici"} Talebi</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                      t.durum === "yeni" || t.durum === "bekliyor" ? "bg-[#FF4D00]/12 text-[#FF4D00] border-[#FF4D00]/25 animate-pulse" :
                      t.durum === "kabul" ? "bg-[#00C853]/10 text-[#00C853] border-[#00C853]/25" :
                      "bg-white/5 text-gray-500 border-white/10"
                    }`}>
                      {t.durum === "yeni" || t.durum === "bekliyor" ? "🔴 YENİ" : t.durum === "kabul" ? "✓ KABUL" : t.durum.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-4">
                    {(t.musteri_ad || t.musteri_tel) && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {t.musteri_ad && <div><div className="text-[10px] text-gray-500 uppercase tracking-wide font-bold mb-1">Müşteri</div><div className="font-semibold text-sm">{t.musteri_ad}</div></div>}
                        {t.musteri_tel && <div><div className="text-[10px] text-gray-500 uppercase tracking-wide font-bold mb-1">Telefon</div><div className="font-semibold text-sm">{t.musteri_tel}</div></div>}
                      </div>
                    )}
                    {t.arac_plaka && (
                      <div className="bg-[#222] border border-white/5 rounded-xl p-3 flex items-center gap-3 mb-3">
                        <span className="text-2xl">🚗</span>
                        <div className="font-black text-sm tracking-wider">{t.arac_plaka}</div>
                      </div>
                    )}
                    {(t.konum_adres || t.hedef_adres) && (
                      <div className="bg-[#222] border border-white/5 rounded-xl p-3 mb-3 space-y-2">
                        {t.konum_adres && <div className="flex items-start gap-2"><span>📍</span><div><div className="text-[10px] text-gray-500 uppercase font-bold">Bulunduğu Yer</div><div className="text-xs font-semibold mt-0.5">{t.konum_adres}</div></div></div>}
                        {t.hedef_adres && <div className="flex items-start gap-2"><span>🎯</span><div><div className="text-[10px] text-gray-500 uppercase font-bold">Hedef</div><div className="text-xs font-semibold mt-0.5">{t.hedef_adres}</div></div></div>}
                      </div>
                    )}
                    {t.not && <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-lg p-3 text-xs text-yellow-200 mb-4">💬 &ldquo;{t.not}&rdquo;</div>}
                    {(t.durum === "yeni" || t.durum === "bekliyor") && (
                      <div className="flex gap-2">
                        <button onClick={() => { setSeciliTalep(t); setAtamaModal(true); setAtamaTamam(false); setSeciliSofor(""); setSeciliArac(""); }}
                          className="flex-1 bg-[#00C853] hover:bg-[#00a844] text-black font-bold py-3 rounded-xl transition text-sm">
                          ✓ Kabul Et & Şoför Ata
                        </button>
                        <button onClick={() => talepReddet(t.id)} className="px-5 py-3 border border-red-500/25 text-red-400 hover:bg-red-500/8 rounded-xl font-bold transition text-sm">
                          ✕ Reddet
                        </button>
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
                <button onClick={() => setAracModal(true)} className="bg-[#FF4D00] text-white text-xs font-bold px-4 py-2 rounded-lg">+ Araç Ekle</button>
              </div>
              {araclar.length === 0 ? (
                <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-10 text-center text-gray-500 text-sm">
                  Henüz araç eklenmedi.
                </div>
              ) : (
                <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
                  {araclar.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-4 border-b border-white/5 last:border-0">
                      <div className="w-9 h-9 rounded-lg bg-[#2A2A2A] flex items-center justify-center">🚛</div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{a.plaka}</div>
                        <div className="text-xs text-gray-500">
                          {[a.arac_turu, a.tur, a.marka, a.model, a.model_yili].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <button onClick={() => aracSil(a.id)} className="text-gray-600 hover:text-red-400 transition text-lg">🗑</button>
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
                <button onClick={() => setSoforModal(true)} className="bg-[#FF4D00] text-white text-xs font-bold px-4 py-2 rounded-lg">+ Şoför Ekle</button>
              </div>
              {soforler.length === 0 ? (
                <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-10 text-center text-gray-500 text-sm">
                  Henüz şoför eklenmedi.
                </div>
              ) : (
                <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
                  {soforler.map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-4 border-b border-white/5 last:border-0">
                      <div className="w-9 h-9 rounded-full bg-[#2A2A2A] flex items-center justify-center text-xs font-bold">
                        {s.ad[0]}{s.soyad?.[0] || ""}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{s.ad} {s.soyad}</div>
                        <div className="text-xs text-gray-500">{s.tel}</div>
                      </div>
                      <button onClick={() => soforSil(s.id)} className="text-gray-600 hover:text-red-400 transition text-lg">🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFİL */}
          {sayfa === "profil" && (
            <div className="max-w-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-lg">Firma Profili</h2>
                {basari && <span className="text-xs text-[#00C853] font-bold bg-[#00C853]/10 border border-[#00C853]/20 px-3 py-1.5 rounded-lg">{basari}</span>}
              </div>

              <div className="space-y-4">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Firma Bilgileri</div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Firma Adı</label>
                  <input value={profil.firma_ad} onChange={e => setProfil({...profil, firma_ad: e.target.value})} className="w-full bg-[#1A1A1A] border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Telefon</label>
                    <input value={profil.tel} onChange={e => setProfil({...profil, tel: e.target.value})} className="w-full bg-[#1A1A1A] border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">E-posta</label>
                    <input value={profil.email} onChange={e => setProfil({...profil, email: e.target.value})} className="w-full bg-[#1A1A1A] border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Adres</label>
                  <textarea value={profil.adres} onChange={e => setProfil({...profil, adres: e.target.value})} rows={2} className="w-full bg-[#1A1A1A] border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition resize-none" />
                </div>

                <div className="pt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Vergi Bilgileri</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Vergi Numarası</label>
                    <input value={profil.vergi_no} onChange={e => setProfil({...profil, vergi_no: e.target.value})} className="w-full bg-[#1A1A1A] border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Vergi Dairesi</label>
                    <input value={profil.vergi_dairesi} onChange={e => setProfil({...profil, vergi_dairesi: e.target.value})} placeholder="Kadıköy VD" className="w-full bg-[#1A1A1A] border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" />
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Banka Bilgileri</div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Banka</label>
                  <div className="relative">
                    <select value={profil.banka} onChange={e => setProfil({...profil, banka: e.target.value})} className="w-full bg-[#1A1A1A] border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition appearance-none pr-8">
                      <option value="">Seçin...</option>
                      {["Ziraat Bankası","Halkbank","Vakıfbank","İş Bankası","Garanti BBVA","Yapı Kredi","Akbank","QNB Finansbank","Denizbank","TEB","İNG Bank","HSBC","Odeabank","Şekerbank","Albaraka Türk","Kuveyt Türk","Türkiye Finans","Ziraat Katılım","Vakıf Katılım"].map(b => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">IBAN</label>
                  <input value={profil.iban} onChange={e => setProfil({...profil, iban: e.target.value.toUpperCase()})} placeholder="TR00 0000 0000 0000 0000 0000 00" className="w-full bg-[#1A1A1A] border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition font-mono tracking-wide" />
                </div>

                <button onClick={profilKaydet} disabled={profilKayit} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm mt-2">
                  {profilKayit ? "Kaydediliyor..." : "Değişiklikleri Kaydet →"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* MOBİL ALT NAVİGASYON */}
        {mobil && (
          <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-white/8 flex z-40">
            {navItems.map(m => (
              <button key={m.id} onClick={() => setSayfa(m.id)} className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition ${sayfa === m.id ? "text-[#FF4D00]" : "text-gray-600"}`}>
                <span className="text-xl leading-none">{m.icon}</span>
                <span className="text-[10px] font-semibold">{m.label}</span>
                {m.badge ? <span className="absolute top-1.5 right-1/4 bg-[#FF4D00] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{m.badge}</span> : null}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* ARAÇ EKLE MODAL */}
      {aracModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" onClick={() => setAracModal(false)}>
          <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-black text-lg">Araç Ekle</h2>
              <button onClick={() => setAracModal(false)} className="w-7 h-7 bg-[#2A2A2A] rounded-lg text-gray-400 text-sm">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Plaka *</label>
                  <input value={yeniArac.plaka} onChange={e => setYeniArac({...yeniArac, plaka: e.target.value.toUpperCase()})} placeholder="34 XY 1234" className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Araç Türü</label>
                  <div className="relative">
                    <select value={yeniArac.arac_turu} onChange={e => setYeniArac({...yeniArac, arac_turu: e.target.value})} className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00] appearance-none pr-7">
                      <option value="">Seçin</option>
                      <option>Kamyonet</option>
                      <option>Kamyon</option>
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Çekici Türü *</label>
                <div className="relative">
                  <select value={yeniArac.tur} onChange={e => setYeniArac({...yeniArac, tur: e.target.value})} className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00] appearance-none pr-7">
                    <option value="">Seçin</option>
                    <option>Sabit Kasa</option>
                    <option>Kayar Kasa</option>
                    <option>Ahtapot</option>
                    <option>Vinç</option>
                    <option>Çoklu Çekici</option>
                    <option>Gözlüklü Çekici</option>
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Marka</label>
                  <input value={yeniArac.marka} onChange={e => setYeniArac({...yeniArac, marka: e.target.value})} placeholder="Mercedes, MAN..." className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Model</label>
                  <input value={yeniArac.model} onChange={e => setYeniArac({...yeniArac, model: e.target.value})} placeholder="Actros, TGX..." className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Model Yılı</label>
                <input value={yeniArac.model_yili} onChange={e => setYeniArac({...yeniArac, model_yili: e.target.value})} placeholder="2021" maxLength={4} className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" />
              </div>
            </div>

            <button onClick={aracEkle} disabled={aracKayit || !yeniArac.plaka || !yeniArac.tur} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm mt-5">
              {aracKayit ? "Kaydediliyor..." : "Aracı Kaydet"}
            </button>
          </div>
        </div>
      )}

      {/* ŞOFÖR EKLE MODAL */}
      {soforModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-5" onClick={() => setSoforModal(false)}>
          <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-black text-lg">Şoför Ekle</h2>
              <button onClick={() => setSoforModal(false)} className="w-7 h-7 bg-[#2A2A2A] rounded-lg text-gray-400 text-sm">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Ad *</label>
                <input value={yeniSofor.ad} onChange={e => setYeniSofor({ ...yeniSofor, ad: e.target.value })} placeholder="Mehmet" className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Soyad</label>
                <input value={yeniSofor.soyad} onChange={e => setYeniSofor({ ...yeniSofor, soyad: e.target.value })} placeholder="Şahin" className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-400 mb-2">Telefon *</label>
              <input value={yeniSofor.tel} onChange={e => setYeniSofor({ ...yeniSofor, tel: e.target.value })} placeholder="0532 xxx xx xx" className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" />
            </div>
            <button onClick={soforEkle} disabled={soforKayit || !yeniSofor.ad || !yeniSofor.tel} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm">
              {soforKayit ? "Kaydediliyor..." : "Şoförü Kaydet"}
            </button>
          </div>
        </div>
      )}

      {/* ATAMA MODAL */}
      {atamaModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-5" onClick={() => setAtamaModal(false)}>
          <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            {!atamaTamam ? (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-black text-lg">Şoför & Araç Ata</h2>
                  <button onClick={() => setAtamaModal(false)} className="w-7 h-7 bg-[#2A2A2A] rounded-lg text-gray-400 text-sm">✕</button>
                </div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Şoför Seç</div>
                {soforler.length === 0 ? (
                  <div className="text-xs text-gray-600 mb-4 p-3 bg-[#2A2A2A] rounded-lg">Önce Şoförlerim sekmesinden şoför ekleyin.</div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {soforler.map(s => (
                      <div key={s.id} onClick={() => setSeciliSofor(s.id)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${seciliSofor === s.id ? "border-[#FF4D00] bg-[#FF4D00]/8" : "border-white/8 bg-[#2A2A2A]"}`}>
                        <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xs font-bold">{s.ad[0]}{s.soyad?.[0] || ""}</div>
                        <div className="flex-1"><div className="text-sm font-bold">{s.ad} {s.soyad}</div><div className="text-xs text-gray-500">{s.tel}</div></div>
                        <div className={`w-4 h-4 rounded-full border-2 transition ${seciliSofor === s.id ? "border-[#FF4D00] bg-[#FF4D00]" : "border-white/20"}`}></div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="h-px bg-white/5 mb-4"></div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Araç Seç</div>
                {araclar.length === 0 ? (
                  <div className="text-xs text-gray-600 mb-4 p-3 bg-[#2A2A2A] rounded-lg">Önce Araçlarım sekmesinden araç ekleyin.</div>
                ) : (
                  <div className="space-y-2 mb-5">
                    {araclar.map(a => (
                      <div key={a.id} onClick={() => setSeciliArac(a.id)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${seciliArac === a.id ? "border-[#FF4D00] bg-[#FF4D00]/8" : "border-white/8 bg-[#2A2A2A]"}`}>
                        <span className="text-xl">🚛</span>
                        <div className="flex-1"><div className="text-sm font-black tracking-wider">{a.plaka}</div><div className="text-xs text-gray-500">{a.tur}</div></div>
                        <div className={`w-4 h-4 rounded-full border-2 transition ${seciliArac === a.id ? "border-[#FF4D00] bg-[#FF4D00]" : "border-white/20"}`}></div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={talepKabul} disabled={!seciliSofor || !seciliArac || yukleniyor} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm">
                  {yukleniyor ? "İşleniyor..." : "🚛 Yola Çıkar"}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">✅</div>
                <div className="font-black text-lg mb-2">Atama Tamamlandı!</div>
                <button onClick={() => { setAtamaModal(false); setSayfa("talepler"); }} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold py-3 rounded-xl transition text-sm mt-4">Tamam →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

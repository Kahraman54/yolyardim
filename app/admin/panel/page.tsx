"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Firma = {
  id: string;
  firma_ad: string;
  sahip_ad: string;
  sahip_soyad: string;
  tel: string;
  email: string;
  il: string;
  ilce: string;
  adres?: string;
  vergi_no?: string;
  vergi_dairesi?: string;
  banka?: string;
  iban?: string;
  durum: string;
  k1o_url: string | null;
  ticaret_sicil_url: string | null;
  created_at: string;
};
type Arac = { id: string; plaka: string; tur: string; marka?: string; model?: string; model_yili?: string; arac_turu?: string; };
type Sofor = { id: string; ad: string; soyad: string; tel: string; };

const cagriData = [
  { ad:"Ayşe Kaya", tel:"0532 xxx xx xx", c:"👩 Kadın", z:"3 dk önce", tip:"🚛 Çekici", konum:"Kadıköy, Moda Cad. No:45", hedef:"Kadıköy Ford Servisi", arac:"34 ABC 123 · Ford Focus · Kırmızı · ÖÇ", not:'"Araç sağ tarafta, lastik patlak."', acil:true },
  { ad:"Mehmet Yılmaz", tel:"0533 xxx xx xx", c:"👨 Erkek", z:"8 dk önce", tip:"🚛 Çekici", konum:"Üsküdar, Bağlarbaşı", hedef:"Henüz bilmiyor", arac:"34 DEF 456 · Toyota Corolla · Beyaz", not:"—", acil:false },
];

export default function AdminPanel() {
  const router = useRouter();
  const [sayfa, setSayfa] = useState("panel");
  const [seciliCagri, setSeciliCagri] = useState<number | null>(0);
  const [seciliFirma, setSeciliFirma] = useState("");

  // Belge onayı state
  const [bekleyenFirmalar, setBekleyenFirmalar] = useState<Firma[]>([]);
  const [belgeYukleniyor, setBelgeYukleniyor] = useState(false);
  const [islemYapiliyor, setIslemYapiliyor] = useState<string | null>(null);
  const [seciliFirmaDetay, setSeciliFirmaDetay] = useState<Firma | null>(null);
  const [belgeUrl, setBelgeUrl] = useState<{ k1o: string | null; ticaret: string | null }>({ k1o: null, ticaret: null });

  // Firmalar listesi state
  const [tumFirmalar, setTumFirmalar] = useState<Firma[]>([]);
  const [firmaListeYukleniyor, setFirmaListeYukleniyor] = useState(false);
  const [seciliFirmaListe, setSeciliFirmaListe] = useState<Firma | null>(null);
  const [firmaAraclar, setFirmaAraclar] = useState<Arac[]>([]);
  const [firmaSoforler, setFirmaSoforler] = useState<Sofor[]>([]);
  const [firmaDetayYukleniyor, setFirmaDetayYukleniyor] = useState(false);
  const [firmaArama, setFirmaArama] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("admin")) { router.replace("/admin"); }
  }, [router]);

  const bekleyenleriYukle = useCallback(async () => {
    setBelgeYukleniyor(true);
    const { data } = await supabase
      .from("firmalar")
      .select("id, firma_ad, sahip_ad, sahip_soyad, tel, email, il, ilce, durum, k1o_url, ticaret_sicil_url, created_at")
      .eq("durum", "bekliyor")
      .order("created_at", { ascending: false });
    setBekleyenFirmalar(data || []);
    setBelgeYukleniyor(false);
  }, []);

  const tumFirmalariYukle = useCallback(async () => {
    setFirmaListeYukleniyor(true);
    const { data } = await supabase
      .from("firmalar")
      .select("id, firma_ad, sahip_ad, sahip_soyad, tel, email, il, ilce, adres, vergi_no, vergi_dairesi, banka, iban, durum, k1o_url, ticaret_sicil_url, created_at")
      .order("created_at", { ascending: false });
    setTumFirmalar(data || []);
    setFirmaListeYukleniyor(false);
  }, []);

  const firmaDetayYukle = useCallback(async (firma: Firma) => {
    setSeciliFirmaListe(firma);
    setFirmaAraclar([]);
    setFirmaSoforler([]);
    setFirmaDetayYukleniyor(true);
    const [{ data: araclar }, { data: soforler }] = await Promise.all([
      supabase.from("araclar").select("id, plaka, tur, marka, model, model_yili, arac_turu").eq("firma_id", firma.id),
      supabase.from("soforler").select("id, ad, soyad, tel").eq("firma_id", firma.id),
    ]);
    setFirmaAraclar(araclar || []);
    setFirmaSoforler(soforler || []);
    setFirmaDetayYukleniyor(false);
  }, []);

  useEffect(() => {
    if (sayfa === "belgeler") bekleyenleriYukle();
    if (sayfa === "firmalar") tumFirmalariYukle();
  }, [sayfa, bekleyenleriYukle, tumFirmalariYukle]);

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
    await supabase.from("firmalar").update({ durum: "aktif" }).eq("id", id);
    setIslemYapiliyor(null);
    setSeciliFirmaDetay(null);
    bekleyenleriYukle();
  }

  async function firmaReddet(id: string) {
    setIslemYapiliyor(id + "_red");
    await supabase.from("firmalar").update({ durum: "reddedildi" }).eq("id", id);
    setIslemYapiliyor(null);
    setSeciliFirmaDetay(null);
    bekleyenleriYukle();
  }

  const d = seciliCagri !== null ? cagriData[seciliCagri] : null;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* SIDEBAR */}
      <aside className="w-48 bg-[#141414] border-r border-white/5 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-white/5">
          <div className="font-black text-base mb-0.5">Tulpar<span className="text-[#FF4D00]"> Assist</span></div>
          <div className="text-[9px] text-[#FF4D00] font-bold tracking-widest uppercase">Admin Paneli</div>
        </div>
        <div className="p-3 border-b border-white/5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FF4D00] flex items-center justify-center text-xs font-black">TK</div>
          <div><div className="text-xs font-bold">Tunahan Kahraman</div><div className="text-[10px] text-gray-600">Süper Admin</div></div>
        </div>
        <nav className="flex-1 p-2">
          <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest px-2 py-2">Genel</div>
          {[
            { id:"panel", icon:"📊", label:"Genel Bakış" },
            { id:"cagri", icon:"📞", label:"Çağrı Merkezi", badge:"2" },
            { id:"talepler", icon:"📋", label:"Tüm Talepler" },
          ].map(m => (
            <button key={m.id} onClick={() => setSayfa(m.id)} className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium mb-0.5 transition text-left ${sayfa===m.id?"bg-[#FF4D00]/10 text-[#FF4D00] font-semibold":"text-gray-500 hover:bg-white/5 hover:text-white"}`}>
              <span className="text-sm">{m.icon}</span>{m.label}
              {m.badge && <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{m.badge}</span>}
            </button>
          ))}
          <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest px-2 py-2 mt-2">Yönetim</div>
          {[
            { id:"belgeler", icon:"📄", label:"Belge Onayı" },
            { id:"firmalar", icon:"🏢", label:"Firmalar" },
            { id:"istatistik", icon:"📈", label:"İstatistikler" },
          ].map(m => (
            <button key={m.id} onClick={() => setSayfa(m.id)} className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium mb-0.5 transition text-left ${sayfa===m.id?"bg-[#FF4D00]/10 text-[#FF4D00] font-semibold":"text-gray-500 hover:bg-white/5 hover:text-white"}`}>
              <span className="text-sm">{m.icon}</span>{m.label}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-white/5">
          <button onClick={() => { localStorage.removeItem("admin"); router.push("/admin"); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-gray-600 hover:text-white transition">
            🚪 Çıkış
          </button>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 bg-[#141414] border-b border-white/5 flex items-center justify-between px-5 flex-shrink-0">
          <div className="font-black text-sm">
            {sayfa==="panel"?"Genel Bakış":sayfa==="cagri"?"Çağrı Merkezi":sayfa==="belgeler"?"Belge Onayı":sayfa==="firmalar"?"Firmalar":sayfa==="istatistik"?"İstatistikler":"Tüm Talepler"}
          </div>
          <button onClick={() => setSayfa("cagri")} className="bg-[#FF4D00] text-white text-xs font-bold px-3 py-1.5 rounded-lg">📞 Çağrı Merkezi</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* GENEL BAKIŞ */}
          {sayfa==="panel" && (
            <div>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  {l:"Belge Onayı Bekleyen",v:bekleyenFirmalar.length || "—",c:"text-[#FF4D00]",b:"border-[#FF4D00]/20"},
                  {l:"Aktif Firma",v:"—",c:"text-[#00C853]",b:"border-[#00C853]/15"},
                  {l:"Bekleyen Çağrı",v:"2",c:"text-red-400",b:"border-red-500/20"},
                  {l:"Bugün Tamamlanan",v:"—",c:"text-blue-400",b:""},
                ].map(s=>(
                  <div key={s.l} className={`bg-[#141414] border border-white/5 ${s.b} rounded-xl p-4`}>
                    <div className="text-[11px] text-gray-500 mb-2">{s.l}</div>
                    <div className={`font-black text-2xl ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                <div className="text-sm font-bold mb-3">Hızlı Erişim</div>
                <div className="flex gap-3">
                  <button onClick={() => setSayfa("belgeler")} className="flex-1 bg-[#FF4D00]/10 border border-[#FF4D00]/20 text-[#FF4D00] font-bold py-3 rounded-xl text-sm hover:bg-[#FF4D00]/20 transition">
                    📄 Belge Onayla
                  </button>
                  <button onClick={() => setSayfa("cagri")} className="flex-1 bg-white/5 border border-white/10 font-bold py-3 rounded-xl text-sm hover:bg-white/10 transition">
                    📞 Çağrı Merkezi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ÇAĞRI MERKEZİ */}
          {sayfa==="cagri" && (
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="space-y-2">
                {cagriData.map((c,i)=>(
                  <div key={i} onClick={()=>{setSeciliCagri(i);setSeciliFirma("");}} className={`p-4 rounded-xl border cursor-pointer transition ${seciliCagri===i?"border-[#FF4D00] bg-[#FF4D00]/4":"border-white/8 bg-[#141414]"} ${c.acil?"animate-pulse":""}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div><div className="font-bold text-sm">{c.ad}</div><div className="text-xs text-blue-400">{c.tel}</div></div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${c.acil?"bg-red-500/10 text-red-400 border border-red-500/20":"bg-[#FF4D00]/10 text-[#FF4D00] border border-[#FF4D00]/20"}`}>{c.acil?"🆘 ACİL":c.tip}</span>
                    </div>
                    <div className="text-[11px] text-gray-500">📍 {c.konum} · {c.z}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#141414] border border-white/5 rounded-xl flex flex-col overflow-hidden">
                {d ? (
                  <>
                    <div className="p-4 border-b border-white/5">
                      <div className="font-bold text-sm">{d.ad}</div>
                      <div className="text-xs text-gray-500 mt-1">{d.tel} · {d.c} · {d.z}</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {[["Yardım Türü",d.tip],["Konumu",d.konum],["Hedef",d.hedef],["Araç",d.arac]].map(([l,v])=>(
                        <div key={l}><div className="text-[10px] text-gray-500 uppercase font-bold tracking-wide mb-1">{l}</div><div className="text-sm font-semibold">{v}</div></div>
                      ))}
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wide mb-2">Yakın Firmalar</div>
                        <div className="space-y-2">
                          {[["Yıldız Çekici","1.2 km","~8 dk"],["Hızlı Kurtarma","2.4 km","~12 dk"]].map(([f,km,dk])=>(
                            <div key={f} onClick={()=>setSeciliFirma(f)} className={`p-3 rounded-lg border cursor-pointer transition ${seciliFirma===f?"border-[#FF4D00] bg-[#FF4D00]/6":"border-white/8 bg-[#1E1E1E]"}`}>
                              <div className="flex justify-between"><span className="text-xs font-bold">{f}</span><span className="text-xs text-[#00C853] font-bold">{dk}</span></div>
                              <div className="text-[11px] text-gray-500">{km}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {d.not !== "—" && <div className="text-xs text-yellow-200 bg-yellow-500/5 border border-yellow-500/15 rounded-lg p-2">{d.not}</div>}
                    </div>
                    <div className="p-4 border-t border-white/5 space-y-2">
                      <button className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold py-2.5 rounded-xl transition text-sm">🚛 Firmaya Yönlendir</button>
                      <button className="w-full bg-blue-500/10 border border-blue-500/25 text-blue-400 font-bold py-2.5 rounded-xl transition text-sm">📞 Müşteriyi Ara</button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">← Müşteri seçin</div>
                )}
              </div>
            </div>
          )}

          {/* BELGE ONAYI */}
          {sayfa==="belgeler" && (
            <div className="grid grid-cols-2 gap-4">
              {/* Sol: firma listesi */}
              <div>
                <div className="text-xs text-gray-500 mb-3">
                  {belgeYukleniyor ? "Yükleniyor..." : `${bekleyenFirmalar.length} başvuru bekliyor`}
                </div>
                {bekleyenFirmalar.length === 0 && !belgeYukleniyor && (
                  <div className="bg-[#141414] border border-white/5 rounded-xl p-8 text-center text-gray-500 text-sm">
                    ✅ Bekleyen başvuru yok.
                  </div>
                )}
                <div className="space-y-2">
                  {bekleyenFirmalar.map(f => (
                    <div
                      key={f.id}
                      onClick={() => belgeleriGoster(f)}
                      className={`p-4 rounded-xl border cursor-pointer transition ${seciliFirmaDetay?.id === f.id ? "border-[#FF4D00] bg-[#FF4D00]/4" : "border-white/8 bg-[#141414] hover:border-white/20"}`}
                    >
                      <div className="font-bold text-sm mb-1">{f.firma_ad}</div>
                      <div className="text-xs text-gray-500">{f.sahip_ad} {f.sahip_soyad} · {f.il}</div>
                      <div className="text-xs text-gray-600 mt-1">{f.tel}</div>
                      <div className="flex gap-1 mt-2">
                        {f.k1o_url && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">K1Ö</span>}
                        {f.ticaret_sicil_url && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">Ticaret Sicil</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sağ: belge detayı */}
              <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
                {seciliFirmaDetay ? (
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-white/5">
                      <div className="font-black text-base">{seciliFirmaDetay.firma_ad}</div>
                      <div className="text-xs text-gray-400 mt-1">{seciliFirmaDetay.sahip_ad} {seciliFirmaDetay.sahip_soyad} · {seciliFirmaDetay.il} / {seciliFirmaDetay.ilce}</div>
                      <div className="text-xs text-gray-500">{seciliFirmaDetay.tel} {seciliFirmaDetay.email && `· ${seciliFirmaDetay.email}`}</div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Belgeler</div>

                      {/* K1Ö */}
                      <div>
                        <div className="text-xs text-gray-500 mb-2">K1Ö Yetki Belgesi</div>
                        {belgeUrl.k1o ? (
                          <a href={belgeUrl.k1o} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/20 transition">
                            📄 Belgeyi Görüntüle / İndir →
                          </a>
                        ) : seciliFirmaDetay.k1o_url ? (
                          <div className="text-xs text-gray-600">Yükleniyor...</div>
                        ) : (
                          <div className="text-xs text-red-400">⚠️ Belge yüklenmemiş</div>
                        )}
                      </div>

                      {/* Ticaret Sicil */}
                      <div>
                        <div className="text-xs text-gray-500 mb-2">Ticaret Sicil Belgesi</div>
                        {belgeUrl.ticaret ? (
                          <a href={belgeUrl.ticaret} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/20 transition">
                            📄 Belgeyi Görüntüle / İndir →
                          </a>
                        ) : seciliFirmaDetay.ticaret_sicil_url ? (
                          <div className="text-xs text-gray-600">Yükleniyor...</div>
                        ) : (
                          <div className="text-xs text-red-400">⚠️ Belge yüklenmemiş</div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 border-t border-white/5 flex gap-2">
                      <button
                        onClick={() => firmaOnayla(seciliFirmaDetay.id)}
                        disabled={!!islemYapiliyor}
                        className="flex-1 bg-[#00C853]/10 border border-[#00C853]/25 text-[#00C853] font-bold py-2.5 rounded-xl text-sm hover:bg-[#00C853]/20 transition disabled:opacity-40"
                      >
                        {islemYapiliyor === seciliFirmaDetay.id ? "İşleniyor..." : "✓ Onayla"}
                      </button>
                      <button
                        onClick={() => firmaReddet(seciliFirmaDetay.id)}
                        disabled={!!islemYapiliyor}
                        className="flex-1 bg-red-500/8 border border-red-500/20 text-red-400 font-bold py-2.5 rounded-xl text-sm hover:bg-red-500/15 transition disabled:opacity-40"
                      >
                        {islemYapiliyor === seciliFirmaDetay.id + "_red" ? "İşleniyor..." : "✕ Reddet"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                    ← Firma seçin
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FİRMALAR */}
          {sayfa==="firmalar" && (
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Sol: firma listesi */}
              <div className="flex flex-col gap-3">
                <input
                  value={firmaArama}
                  onChange={e => setFirmaArama(e.target.value)}
                  placeholder="🔍 Firma ara..."
                  className="w-full bg-[#141414] border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00] transition"
                />
                <div className="text-xs text-gray-500">
                  {firmaListeYukleniyor ? "Yükleniyor..." : `${tumFirmalar.length} firma kayıtlı`}
                </div>
                <div className="space-y-2 overflow-y-auto">
                  {tumFirmalar
                    .filter(f => !firmaArama || f.firma_ad.toLowerCase().includes(firmaArama.toLowerCase()) || f.il?.toLowerCase().includes(firmaArama.toLowerCase()))
                    .map(f => (
                    <div
                      key={f.id}
                      onClick={() => firmaDetayYukle(f)}
                      className={`p-3 rounded-xl border cursor-pointer transition ${seciliFirmaListe?.id === f.id ? "border-[#FF4D00] bg-[#FF4D00]/4" : "border-white/8 bg-[#141414] hover:border-white/20"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate">{f.firma_ad}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{f.il}{f.ilce ? ` / ${f.ilce}` : ""} · {f.tel}</div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          f.durum === "aktif" ? "bg-[#00C853]/10 text-[#00C853]" :
                          f.durum === "bekliyor" ? "bg-[#FF4D00]/10 text-[#FF4D00]" :
                          "bg-red-500/10 text-red-400"
                        }`}>
                          {f.durum === "aktif" ? "Aktif" : f.durum === "bekliyor" ? "Bekliyor" : "Reddedildi"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sağ: firma detayı */}
              <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden flex flex-col">
                {seciliFirmaListe ? (
                  firmaDetayYukleniyor ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Yükleniyor...</div>
                  ) : (
                    <div className="flex-1 overflow-y-auto">
                      {/* Firma başlık */}
                      <div className="p-4 border-b border-white/5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="font-black text-base">{seciliFirmaListe.firma_ad}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{seciliFirmaListe.sahip_ad} {seciliFirmaListe.sahip_soyad}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                            seciliFirmaListe.durum === "aktif" ? "bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20" :
                            seciliFirmaListe.durum === "bekliyor" ? "bg-[#FF4D00]/10 text-[#FF4D00] border border-[#FF4D00]/20" :
                            "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {seciliFirmaListe.durum === "aktif" ? "✓ Aktif" : seciliFirmaListe.durum === "bekliyor" ? "⏳ Bekliyor" : "✕ Reddedildi"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {seciliFirmaListe.tel && <div><span className="text-gray-500">Tel: </span>{seciliFirmaListe.tel}</div>}
                          {seciliFirmaListe.email && <div><span className="text-gray-500">E-posta: </span>{seciliFirmaListe.email}</div>}
                          {seciliFirmaListe.adres && <div className="col-span-2"><span className="text-gray-500">Adres: </span>{seciliFirmaListe.adres}</div>}
                          {seciliFirmaListe.vergi_no && <div><span className="text-gray-500">Vergi No: </span>{seciliFirmaListe.vergi_no}</div>}
                          {seciliFirmaListe.vergi_dairesi && <div><span className="text-gray-500">Vergi D.: </span>{seciliFirmaListe.vergi_dairesi}</div>}
                          {seciliFirmaListe.banka && <div><span className="text-gray-500">Banka: </span>{seciliFirmaListe.banka}</div>}
                          {seciliFirmaListe.iban && <div className="col-span-2"><span className="text-gray-500">IBAN: </span><span className="font-mono">{seciliFirmaListe.iban}</span></div>}
                        </div>
                      </div>

                      {/* Araçlar */}
                      <div className="p-4 border-b border-white/5">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Araçlar ({firmaAraclar.length})</div>
                        {firmaAraclar.length === 0 ? (
                          <div className="text-xs text-gray-600">Araç eklenmemiş.</div>
                        ) : (
                          <div className="space-y-2">
                            {firmaAraclar.map(a => (
                              <div key={a.id} className="flex items-center gap-2 bg-[#1E1E1E] rounded-lg px-3 py-2">
                                <span className="text-base">🚛</span>
                                <div>
                                  <div className="font-bold text-xs">{a.plaka}</div>
                                  <div className="text-[11px] text-gray-500">
                                    {[a.arac_turu, a.tur, a.marka, a.model, a.model_yili].filter(Boolean).join(" · ")}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Şoförler */}
                      <div className="p-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Şoförler ({firmaSoforler.length})</div>
                        {firmaSoforler.length === 0 ? (
                          <div className="text-xs text-gray-600">Şoför eklenmemiş.</div>
                        ) : (
                          <div className="space-y-2">
                            {firmaSoforler.map(s => (
                              <div key={s.id} className="flex items-center gap-2 bg-[#1E1E1E] rounded-lg px-3 py-2">
                                <div className="w-7 h-7 rounded-full bg-[#2A2A2A] flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {s.ad[0]}{s.soyad?.[0] || ""}
                                </div>
                                <div>
                                  <div className="font-bold text-xs">{s.ad} {s.soyad}</div>
                                  <div className="text-[11px] text-gray-500">{s.tel}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">← Firma seçin</div>
                )}
              </div>
            </div>
          )}

          {/* İSTATİSTİK */}
          {sayfa==="istatistik" && (
            <div className="text-gray-500 text-sm p-8 text-center">Yakında eklenecek.</div>
          )}

          {/* TALEPLER */}
          {sayfa==="talepler" && (
            <div className="text-gray-500 text-sm p-8 text-center">Yakında eklenecek.</div>
          )}

        </div>
      </div>
    </main>
  );
}

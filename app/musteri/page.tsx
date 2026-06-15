"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const DEMO_FIRMALAR = [
  { id: "1", firma_ad: "Yıldız Çekici", sahip_ad: "Mehmet Yıldız", puan: 4.8, yorum: 124, sure: 8, km: 1.2, arac: 3, hizmetler: ["🚛 Çekici", "🔧 Kurtarma", "🔄 Lastik"] },
  { id: "2", firma_ad: "Güven Yol Yardım", sahip_ad: "Ali Güven", puan: 4.6, yorum: 87, sure: 12, km: 2.1, arac: 2, hizmetler: ["🚛 Çekici", "🔋 Akü", "⛽ Yakıt"] },
  { id: "3", firma_ad: "Hızlı Kurtarma", sahip_ad: "Hasan Demir", puan: 4.9, yorum: 203, sure: 6, km: 0.8, arac: 4, hizmetler: ["🚛 Çekici", "🔧 Kurtarma", "🔄 Lastik", "🔋 Akü"] },
];

export default function MusteriAna() {
  const [gorunum, setGorunum] = useState<"harita" | "liste">("harita");
  const [firmalar, setFirmalar] = useState(DEMO_FIRMALAR);
  const [seciliFirma, setSeciliFirma] = useState<typeof DEMO_FIRMALAR[0] | null>(null);
  const [talepModal, setTalepModal] = useState(false);
  const [sorunTip, setSorunTip] = useState("");
  const [hedef, setHedef] = useState("belirli");
  const [hedefAdres, setHedefAdres] = useState("");
  const [not, setNot] = useState("");
  const [gonderildi, setGonderildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kullanici, setKullanici] = useState<{ad:string,soyad:string} | null>(null);

  useEffect(() => {
    // Gerçek firmaları çek
    async function firmalariYukle() {
      const { data } = await supabase
        .from("firmalar")
        .select("*")
        .eq("durum", "aktif");
      if (data && data.length > 0) {
        // Gerçek veriler varsa onları kullan
      }
      // Demo verilerle devam et
    }
    firmalariYukle();
  }, []);

  async function talepGonder() {
    if (!sorunTip) return;
    setYukleniyor(true);
    const { error } = await supabase.from("talepler").insert({
      firma_id: seciliFirma?.id || null,
      hizmet_turu: sorunTip,
      hedef_adres: hedefAdres || null,
      musteri_not: not || null,
      durum: "bekliyor",
    });
    setYukleniyor(false);
    if (!error) setGonderildi(true);
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex flex-col max-w-md mx-auto relative">
      {/* HEADER */}
      <header className="h-14 flex items-center justify-between px-4 bg-[#1A1A1A] border-b border-white/5 flex-shrink-0 sticky top-0 z-40">
        <div>
          <div className="text-xs text-gray-500">Merhaba 👋</div>
          <div className="text-sm font-bold">{kullanici ? `${kullanici.ad} ${kullanici.soyad}` : "Hoş geldin"}</div>
        </div>
        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-full bg-[#2A2A2A] flex items-center justify-center text-base relative">
            🔔<div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FF4D00] rounded-full"></div>
          </button>
          <Link href="/" className="w-9 h-9 rounded-full bg-[#FF4D00] flex items-center justify-center text-xs font-black">←</Link>
        </div>
      </header>

      {/* GÖRÜNÜM SEÇİCİ */}
      <div className="flex gap-2 px-3 py-2 bg-[#1A1A1A] border-b border-white/5 flex-shrink-0">
        <button onClick={() => setGorunum("harita")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${gorunum==="harita"?"bg-[#FF4D00] text-white":"border border-white/10 text-gray-500"}`}>🗺️ Harita</button>
        <button onClick={() => setGorunum("liste")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${gorunum==="liste"?"bg-[#FF4D00] text-white":"border border-white/10 text-gray-500"}`}>📋 Liste</button>
      </div>

      {/* İÇERİK */}
      <div className="flex-1 overflow-hidden relative">

        {/* HARİTA GÖRÜNÜMÜ */}
        {gorunum === "harita" && (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-[#1a2332] relative overflow-hidden">
              {/* Sahte yol ızgarası */}
              <div className="absolute inset-0" style={{backgroundImage:"linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)",backgroundSize:"40px 40px"}}></div>
              <div className="absolute top-[30%] left-0 right-0 h-2 bg-[#2a3a4a]"></div>
              <div className="absolute top-[58%] left-0 right-0 h-1.5 bg-[#2a3a4a]"></div>
              <div className="absolute top-0 bottom-0 left-[42%] w-2 bg-[#2a3a4a]"></div>
              <div className="absolute top-0 bottom-0 left-[70%] w-1.5 bg-[#2a3a4a]"></div>

              {/* Konum noktam */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" style={{boxShadow:"0 0 0 8px rgba(59,130,246,.2)",animation:"pulse 2s infinite"}}></div>
              </div>

              {/* Firma pinleri */}
              {firmalar.map((f, i) => {
                const pos = [
                  {top:"22%",left:"26%"},
                  {top:"48%",left:"68%"},
                  {top:"72%",left:"20%"},
                ];
                return (
                  <button key={f.id} onClick={() => setSeciliFirma(f)} className="absolute z-20 -translate-x-1/2 -translate-y-full" style={pos[i]}>
                    <div className={`px-2.5 py-1.5 rounded-lg border-2 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shadow-lg transition-all ${seciliFirma?.id===f.id?"bg-[#FF4D00] border-[#FF4D00] text-white":"bg-[#1A1A1A] border-[#FF4D00] text-white"}`}>
                      🚛 {f.firma_ad.split(" ")[0]} <span className="text-yellow-300">★{f.puan}</span>
                    </div>
                  </button>
                );
              })}

              {/* Harita kontrolleri */}
              <div className="absolute right-3 bottom-28 flex flex-col gap-2 z-10">
                <button className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-base">＋</button>
                <button className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-base">－</button>
                <button className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-base">📍</button>
              </div>

              {/* Seçili firma kartı */}
              {seciliFirma && (
                <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-white/10 p-4 z-20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FF4D00]/15 flex items-center justify-center text-lg">🚛</div>
                      <div>
                        <div className="font-bold text-sm">{seciliFirma.firma_ad}</div>
                        <div className="text-xs text-gray-500">{seciliFirma.sahip_ad}</div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25 px-2 py-0.5 rounded-full">✓ ONAYLI</span>
                          <span className="text-xs text-yellow-400">★ {seciliFirma.puan}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setSeciliFirma(null)} className="w-7 h-7 bg-[#2A2A2A] rounded-lg text-gray-400 text-sm flex items-center justify-center">✕</button>
                  </div>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {seciliFirma.hizmetler.map(h => <span key={h} className="text-[10px] px-2 py-1 rounded-full bg-[#2A2A2A] text-gray-400">{h}</span>)}
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500 mb-3">
                    <span>⏱️ <strong className="text-white">{seciliFirma.sure}</strong> dk</span>
                    <span>📍 <strong className="text-white">{seciliFirma.km}</strong> km</span>
                    <span>🚛 <strong className="text-white">{seciliFirma.arac}</strong> araç</span>
                  </div>
                  <button onClick={() => setTalepModal(true)} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold py-3 rounded-xl transition text-sm">Talep Oluştur →</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LİSTE GÖRÜNÜMÜ */}
        {gorunum === "liste" && (
          <div className="overflow-y-auto h-full">
            <div className="p-3">
              {firmalar.sort((a,b) => a.km - b.km).map(f => (
                <div key={f.id} className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-4 mb-3 hover:border-[#FF4D00]/30 transition cursor-pointer" onClick={() => setSeciliFirma(f)}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-center">
                      <div className="w-11 h-11 rounded-xl bg-[#FF4D00]/10 border border-[#FF4D00]/20 flex items-center justify-center text-xl flex-shrink-0">🚛</div>
                      <div>
                        <div className="font-bold text-sm">{f.firma_ad}</div>
                        <div className="text-xs text-gray-500">{f.sahip_ad}</div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25 px-2 py-0.5 rounded-full">✓ ONAYLI</span>
                          <span className="text-xs text-yellow-400">★ {f.puan}</span>
                          <span className="text-xs text-gray-500">({f.yorum})</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-xl">{f.sure}</div>
                      <div className="text-xs text-gray-500">dk</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {f.hizmetler.map(h => <span key={h} className="text-[10px] px-2 py-1 rounded-full bg-[#2A2A2A] text-gray-400">{h}</span>)}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">📍 {f.km} km · 🚛 {f.arac} araç</div>
                    <button onClick={e => { e.stopPropagation(); setSeciliFirma(f); setTalepModal(true); }} className="bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold px-3 py-2 rounded-lg text-xs transition">Talep Oluştur</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ALT NAV */}
      <nav className="flex bg-[#1A1A1A] border-t border-white/5 flex-shrink-0">
        <button className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[#FF4D00]"><span className="text-lg">🏠</span><span className="text-[9px] font-bold">Ana</span></button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-gray-600"><span className="text-lg">📋</span><span className="text-[9px] font-bold">Talepler</span></button>
        <div className="flex-1 flex items-center justify-center">
          <button onClick={() => setTalepModal(true)} className="w-12 h-12 rounded-full bg-[#FF4D00] border-2 border-[#0D0D0D] text-xl -mt-4" style={{boxShadow:"0 0 0 3px rgba(255,77,0,.4)"}}>🆘</button>
        </div>
        <button className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-gray-600"><span className="text-lg">🕐</span><span className="text-[9px] font-bold">Geçmiş</span></button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-gray-600"><span className="text-lg">👤</span><span className="text-[9px] font-bold">Profil</span></button>
      </nav>

      {/* TALEP MODAL */}
      {talepModal && (
        <div className="fixed inset-0 bg-black/75 flex items-end justify-center z-50" onClick={() => { setTalepModal(false); setGonderildi(false); }}>
          <div className="bg-[#1A1A1A] rounded-t-2xl w-full max-w-md p-5 pb-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-[#2A2A2A] rounded-full mx-auto mb-4"></div>
            {!gonderildi ? (
              <>
                <div className="font-black text-lg mb-1">Talep Oluştur</div>
                <div className="text-xs text-gray-500 mb-4">{seciliFirma ? seciliFirma.firma_ad : "En yakın firma seçilecek"}</div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-400 mb-2">Ne yardımı istiyorsun? *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[["🚛","Çekici"],["🔧","Kurtarma"],["🔄","Lastik"],["🔋","Akü"],["⛽","Yakıt"],["🔑","Çilingir"]].map(([ic,lb]) => (
                      <button key={lb} onClick={() => setSorunTip(lb)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition ${sorunTip===lb?"border-[#FF4D00] bg-[#FF4D00]/8 text-[#FF4D00]":"border-white/10 bg-[#2A2A2A] text-gray-400"}`}>
                        <span className="text-xl">{ic}</span><span className="text-[10px] font-bold">{lb}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-400 mb-2">Araç nereye çekilsin?</label>
                  <div className="space-y-2">
                    {[["belirli","📍","Belirli bir yere","Servis, ev veya adres"],["bilmiyorum","🤷","Henüz bilmiyorum","Sonradan düzenleyebilirsin"],["onersin","💡","Firma önersin","En yakın servisi bulsun"]].map(([v,ic,lb,ac]) => (
                      <div key={v}>
                        <div onClick={() => setHedef(v)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${hedef===v?"border-[#FF4D00] bg-[#FF4D00]/6":"border-white/10 bg-[#2A2A2A]"}`}>
                          <span className="text-lg">{ic}</span>
                          <div className="flex-1"><div className="text-sm font-bold">{lb}</div><div className="text-xs text-gray-500">{ac}</div></div>
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${hedef===v?"border-[#FF4D00] bg-[#FF4D00]":"border-white/20"}`} style={hedef===v?{boxShadow:"inset 0 0 0 3px #2A2A2A"}:{}}></div>
                        </div>
                        {v === "belirli" && hedef === "belirli" && (
                          <input value={hedefAdres} onChange={e=>setHedefAdres(e.target.value)} placeholder="Örn: Kadıköy Ford Servisi" className="w-full mt-1.5 bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-400 mb-2">Not</label>
                  <textarea value={not} onChange={e=>setNot(e.target.value)} placeholder="Araç sağ tarafında, lastik patlak..." rows={2} className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00] resize-none" />
                </div>
                <button onClick={talepGonder} disabled={!sorunTip || yukleniyor} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition text-sm">
                  {yukleniyor ? "Gönderiliyor..." : "🚨 Talebi Gönder"}
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">✅</div>
                <div className="font-black text-xl mb-2">Talep Gönderildi!</div>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">Firma kabul ettiğinde seni arayacak.<br/>Hangi plakalı aracın geldiğini göreceksin.</p>
                <button onClick={() => { setTalepModal(false); setGonderildi(false); setSorunTip(""); setNot(""); }} className="w-full bg-[#FF4D00] text-white font-bold py-3 rounded-xl">Tamam →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
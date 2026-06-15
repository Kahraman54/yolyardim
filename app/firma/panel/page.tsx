"use client";
import { useState } from "react";
import Link from "next/link";

const talepler = [
  {
    id: "TLP-2847", tip: "Çekici", zaman: "3 dk önce", durum: "yeni",
    musteri: "Ayşe Kaya", tel: "0532 xxx xx xx", cinsiyet: "👩 Kadın", mesafe: "1.2 km",
    plaka: "34 ABC 123", arac: "Ford Focus · Kırmızı · Dizel · Ön Çeker",
    konum: "Kadıköy, Moda Cad. No:45 yakını", hedef: "Kadıköy Ford Yetkili Servisi",
    not: "Araç yolun sağ tarafında, lastik tamamen patlak."
  }
];

export default function FirmaPanel() {
  const [sayfa, setSayfa] = useState("panel");
  const [atamaModal, setAtamaModal] = useState(false);
  const [seciliSofor, setSeciliSofor] = useState("");
  const [seciliArac, setSeciliArac] = useState("");
  const [atamaTamam, setAtamaTamam] = useState(false);

  function atama() {
    if (!seciliSofor || !seciliArac) return;
    setAtamaTamam(true);
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex">
      {/* SIDEBAR */}
      <aside className="w-48 bg-[#1A1A1A] border-r border-white/5 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-white/5">
          <div className="font-black text-base mb-0.5">Yol<span className="text-[#FF4D00]">Yardım</span></div>
          <div className="text-[9px] text-gray-500">Firma Paneli</div>
        </div>
        <div className="p-3 border-b border-white/5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF4D00]/15 flex items-center justify-center text-sm">🚛</div>
          <div>
            <div className="text-xs font-bold">Yıldız Çekici</div>
            <div className="text-[10px] text-[#00C853] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse"></span>Aktif</div>
          </div>
        </div>
        <nav className="flex-1 p-2">
          {[
            { id:"panel", icon:"📊", label:"Panel" },
            { id:"talepler", icon:"📋", label:"Talepler", badge:"1" },
            { id:"araclar", icon:"🚛", label:"Araçlarım" },
            { id:"soforler", icon:"👨‍✈️", label:"Şoförlerim" },
          ].map(m => (
            <button key={m.id} onClick={() => setSayfa(m.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-0.5 transition text-left ${sayfa === m.id ? "bg-[#FF4D00]/10 text-[#FF4D00] font-semibold" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}>
              <span className="text-sm">{m.icon}</span>{m.label}
              {m.badge && <span className="ml-auto bg-[#FF4D00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{m.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-white/5">
          <Link href="/" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:text-white transition">🚪 Çıkış</Link>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-12 bg-[#1A1A1A] border-b border-white/5 flex items-center justify-between px-5 flex-shrink-0">
          <div className="font-black text-sm capitalize">{sayfa === "panel" ? "Panel" : sayfa === "talepler" ? "Talepler" : sayfa === "araclar" ? "Araçlarım" : "Şoförlerim"}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSayfa("talepler")} className="text-[11px] text-[#FF4D00] font-bold bg-[#FF4D00]/10 border border-[#FF4D00]/25 px-3 py-1.5 rounded-lg animate-pulse">🔴 1 Yeni Talep</button>
            <button className="text-xs font-bold bg-[#00C853]/10 border border-[#00C853]/25 text-[#00C853] px-3 py-1.5 rounded-lg">🟢 Müsait</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* PANEL */}
          {sayfa === "panel" && (
            <div>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { l:"Yeni Talep", v:"1", c:"text-[#FF4D00]", b:"border-[#FF4D00]/25" },
                  { l:"Bu Ay", v:"47", c:"text-white", b:"" },
                  { l:"Puan", v:"4.8 ★", c:"text-white", b:"" },
                  { l:"Aktif Şoför", v:"3", c:"text-white", b:"" },
                ].map(s => (
                  <div key={s.l} className={`bg-[#1A1A1A] border border-white/5 ${s.b} rounded-xl p-4`}>
                    <div className="text-[11px] text-gray-500 mb-2">{s.l}</div>
                    <div className={`font-black text-2xl ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#FF4D00]/6 border border-[#FF4D00]/20 rounded-xl p-4 flex items-center justify-between cursor-pointer" onClick={() => setSayfa("talepler")}>
                <div>
                  <div className="font-bold text-sm">🔴 Yeni Talep Var!</div>
                  <div className="text-xs text-gray-500 mt-1">Ayşe Kaya — Çekici · Az önce</div>
                </div>
                <span className="text-[#FF4D00]">→</span>
              </div>
            </div>
          )}

          {/* TALEPLER */}
          {sayfa === "talepler" && (
            <div>
              {talepler.map(t => (
                <div key={t.id} className="bg-[#1A1A1A] border border-[#FF4D00] rounded-2xl overflow-hidden" style={{boxShadow:"0 0 0 1px rgba(255,77,0,.15)"}}>
                  <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#FF4D00]/10 flex items-center justify-center text-base">🚛</div>
                      <div>
                        <div className="text-[11px] text-gray-500">#{t.id} · {t.zaman}</div>
                        <div className="font-bold text-sm">{t.tip} Talebi</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-[#FF4D00]/12 text-[#FF4D00] border border-[#FF4D00]/25 px-2 py-1 rounded-full animate-pulse">🔴 YENİ</span>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {[["Müşteri",t.musteri],["Telefon",t.tel],["Cinsiyet",t.cinsiyet],["Mesafe",t.mesafe]].map(([l,v]) => (
                        <div key={l}><div className="text-[10px] text-gray-500 uppercase tracking-wide font-bold mb-1">{l}</div><div className="font-semibold text-sm">{v}</div></div>
                      ))}
                    </div>
                    <div className="bg-[#222] border border-white/5 rounded-xl p-3 flex items-center gap-3 mb-3">
                      <span className="text-2xl">🚗</span>
                      <div><div className="font-black text-sm tracking-wider">{t.plaka}</div><div className="text-xs text-gray-500">{t.arac}</div></div>
                    </div>
                    <div className="bg-[#222] border border-white/5 rounded-xl p-3 mb-3">
                      <div className="flex items-start gap-2 mb-2"><span>📍</span><div><div className="text-[10px] text-gray-500 uppercase font-bold">Bulunduğu Yer</div><div className="text-xs font-semibold mt-0.5">{t.konum}</div></div></div>
                      <div className="h-px bg-white/5 my-2"></div>
                      <div className="flex items-start gap-2"><span>🎯</span><div><div className="text-[10px] text-gray-500 uppercase font-bold">Çekilmek İstediği Yer</div><div className="text-xs font-semibold mt-0.5">{t.hedef}</div></div></div>
                    </div>
                    <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-lg p-3 text-xs text-yellow-200 mb-4">💬 &ldquo;{t.not}&rdquo;</div>
                    <div className="flex gap-2">
                      <button onClick={() => { setAtamaModal(true); setAtamaTamam(false); }} className="flex-1 bg-[#00C853] hover:bg-[#00a844] text-black font-bold py-3 rounded-xl transition text-sm">✓ Kabul Et & Şoför Ata</button>
                      <button className="px-5 py-3 border border-red-500/25 text-red-400 hover:bg-red-500/8 rounded-xl font-bold transition text-sm">✕ Reddet</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ARAÇLAR */}
          {sayfa === "araclar" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold">Araçlarım</div>
                <button className="bg-[#FF4D00] text-white text-xs font-bold px-4 py-2 rounded-lg">+ Ekle</button>
              </div>
              <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
                {[
                  { p:"34 XY 1234", t:"Çekici · Mercedes · 2021", d:"Müsait", dc:"text-[#00C853]" },
                  { p:"34 AB 5678", t:"Vinçli · MAN · 2019", d:"Görevde", dc:"text-[#FF4D00]" },
                  { p:"34 CD 9012", t:"Yol Yardım · Ford · 2022", d:"Müsait", dc:"text-[#00C853]" },
                ].map((a,i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border-b border-white/5 last:border-0">
                    <div className="w-9 h-9 rounded-lg bg-[#2A2A2A] flex items-center justify-center">🚛</div>
                    <div className="flex-1"><div className="font-bold text-sm">{a.p}</div><div className="text-xs text-gray-500">{a.t}</div></div>
                    <span className={`text-xs font-bold ${a.dc}`}>{a.d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ŞOFÖRLER */}
          {sayfa === "soforler" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold">Şoförlerim</div>
                <button className="bg-[#FF4D00] text-white text-xs font-bold px-4 py-2 rounded-lg">+ Ekle</button>
              </div>
              <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
                {[
                  { n:"Mehmet Şahin", t:"CE · 0532 111 22 33", d:"Müsait", dc:"text-[#00C853]" },
                  { n:"Ali Kaya", t:"C · 0533 444 55 66", d:"Görevde", dc:"text-[#FF4D00]" },
                  { n:"Hasan Demir", t:"CE · 0535 777 88 99", d:"Müsait", dc:"text-[#00C853]" },
                ].map((s,i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border-b border-white/5 last:border-0">
                    <div className="w-9 h-9 rounded-full bg-[#2A2A2A] flex items-center justify-center text-xs font-bold">{s.n.split(" ").map(x=>x[0]).join("")}</div>
                    <div className="flex-1"><div className="font-bold text-sm">{s.n}</div><div className="text-xs text-gray-500">{s.t}</div></div>
                    <span className={`text-xs font-bold ${s.dc}`}>{s.d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

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
                <div className="space-y-2 mb-4">
                  {[["Mehmet Şahin","CE · Müsait"],["Hasan Demir","CE · Müsait"]].map(([ad,bilgi]) => (
                    <div key={ad} onClick={() => setSeciliSofor(ad)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${seciliSofor===ad ? "border-[#FF4D00] bg-[#FF4D00]/8" : "border-white/8 bg-[#2A2A2A]"}`}>
                      <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xs font-bold">{ad.split(" ").map((x:string)=>x[0]).join("")}</div>
                      <div className="flex-1"><div className="text-sm font-bold">{ad}</div><div className="text-xs text-gray-500">{bilgi}</div></div>
                      <div className={`w-4 h-4 rounded-full border-2 transition ${seciliSofor===ad ? "border-[#FF4D00] bg-[#FF4D00]" : "border-white/20"}`} style={seciliSofor===ad?{boxShadow:"inset 0 0 0 3px #2A2A2A"}:{}}></div>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-white/5 mb-4"></div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Araç Seç (Plaka)</div>
                <div className="space-y-2 mb-5">
                  {[["34 XY 1234","Çekici · Mercedes · Müsait"],["34 CD 9012","Yol Yardım · Ford · Müsait"]].map(([p,b]) => (
                    <div key={p} onClick={() => setSeciliArac(p)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${seciliArac===p ? "border-[#FF4D00] bg-[#FF4D00]/8" : "border-white/8 bg-[#2A2A2A]"}`}>
                      <span className="text-xl">🚛</span>
                      <div className="flex-1"><div className="text-sm font-black tracking-wider">{p}</div><div className="text-xs text-gray-500">{b}</div></div>
                      <div className={`w-4 h-4 rounded-full border-2 transition ${seciliArac===p ? "border-[#FF4D00] bg-[#FF4D00]" : "border-white/20"}`} style={seciliArac===p?{boxShadow:"inset 0 0 0 3px #2A2A2A"}:{}}></div>
                    </div>
                  ))}
                </div>
                <button onClick={atama} disabled={!seciliSofor||!seciliArac} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm">🚛 Yola Çıkar — Müşteriyi Bilgilendir</button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-3" style={{animation:"pop .4s ease"}}>✅</div>
                <div className="font-black text-lg mb-2">Atama Tamamlandı!</div>
                <div className="bg-[#00C853]/7 border border-[#00C853]/20 rounded-xl p-3 text-xs text-green-300 text-left mb-4 leading-relaxed">
                  📱 Müşteriye bildirim: &ldquo;Talebiniz kabul edildi! {seciliSofor} — {seciliArac} plakalı araçla yola çıktı. Tahmini varış: 8 dk.&rdquo;
                </div>
                <button onClick={() => setAtamaModal(false)} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold py-3 rounded-xl transition text-sm">Tamam →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
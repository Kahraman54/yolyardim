"use client";
import { useState } from "react";
import Link from "next/link";

export default function Sofor() {
  const [ekran, setEkran] = useState<"ana"|"is"|"foto">("ana");
  const [asama, setAsama] = useState(1);
  const [fotolar, setFotolar] = useState<Record<string,boolean>>({});
  const [tamam, setTamam] = useState(false);
  const [musait, setMusait] = useState(true);

  const fotoSay = (a: number) => Object.keys(fotolar).filter(k => k.startsWith(`${a}-`)).length;
  const fotoHedef = (a: number) => a === 2 ? 3 : 4;

  function fotoEkle(a: number, k: string) {
    setFotolar(prev => ({ ...prev, [`${a}-${k}`]: true }));
  }

  function ilerleAsama() {
    if (asama < 3) setAsama(asama + 1);
    else { setTamam(true); }
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex flex-col max-w-md mx-auto">
      {/* HEADER */}
      <header className="h-14 flex items-center justify-between px-4 bg-[#1A1A1A] border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FF4D00] flex items-center justify-center text-xs font-black">MŞ</div>
          <div>
            <div className="text-xs font-bold">Mehmet Şahin</div>
            <div className="text-[10px] text-gray-500">Yıldız Çekici · 34 XY 1234</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMusait(!musait)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition ${musait ? "bg-[#00C853]/10 border-[#00C853]/25 text-[#00C853]" : "bg-[#FF4D00]/10 border-[#FF4D00]/25 text-[#FF4D00]"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${musait ? "bg-[#00C853]" : "bg-[#FF4D00]"} animate-pulse`}></span>
            {musait ? "Müsait" : "Meşgul"}
          </button>
          <Link href="/" className="text-[10px] text-gray-500 bg-[#2A2A2A] px-2 py-1 rounded-lg">← Portal</Link>
        </div>
      </header>

      {/* İÇERİK */}
      <div className="flex-1 overflow-y-auto">

        {/* ANA EKRAN */}
        {ekran === "ana" && (
          <div className="p-4">
            {/* Yeni iş bildirimi */}
            <div onClick={() => setEkran("is")} className="bg-[#FF4D00]/8 border border-[#FF4D00]/25 rounded-2xl p-4 mb-4 cursor-pointer animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <div className="font-bold text-sm">Yeni İş Atandı!</div>
                    <div className="text-xs text-gray-500 mt-0.5">Kadıköy — Çekici · Az önce</div>
                  </div>
                </div>
                <span className="text-[#FF4D00] text-lg">→</span>
              </div>
            </div>

            {/* Günlük özet */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { v: "4", l: "Tamamlanan", c: "text-[#00C853]" },
                { v: "1", l: "Aktif", c: "text-[#FF4D00]", b: "border-[#FF4D00]/20" },
                { v: "⭐ 4.9", l: "Puan", c: "text-white" },
              ].map(s => (
                <div key={s.l} className={`bg-[#1A1A1A] border ${s.b || "border-white/5"} rounded-xl p-3 text-center`}>
                  <div className={`font-black text-xl ${s.c}`}>{s.v}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Son işler */}
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Son İşler</div>
            <div className="space-y-2">
              {[
                { tip: "Akü Takviyesi", m: "Cem Türkmen", z: "2 saat önce" },
                { tip: "Çekici", m: "Selin Arslan", z: "4 saat önce" },
              ].map((is, i) => (
                <div key={i} className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{is.tip}</div>
                    <div className="text-xs text-gray-500">{is.m} · {is.z}</div>
                  </div>
                  <span className="text-xs text-[#00C853] font-bold">Tamamlandı</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* İŞ DETAY */}
        {ekran === "is" && (
          <div className="p-4">
            <button onClick={() => setEkran("ana")} className="text-xs text-gray-500 hover:text-white transition mb-3">← Geri</button>
            <div className="flex items-center justify-between mb-4">
              <div className="font-black text-base">#TLP-2847</div>
              <span className="text-[10px] font-bold bg-[#FF4D00]/10 text-[#FF4D00] border border-[#FF4D00]/25 px-2 py-1 rounded-full">YENİ İŞ</span>
            </div>

            {/* Müşteri */}
            <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center text-lg">👩</div>
                <div>
                  <div className="font-black text-base">Ayşe Kaya</div>
                  <div className="text-xs text-gray-500">👩 Kadın</div>
                </div>
              </div>
              <div className="bg-blue-500/8 border border-blue-500/20 rounded-lg p-3 text-sm font-bold text-blue-400 mb-3 cursor-pointer">
                📞 0532 xxx xx xx — Aramak için tıkla
              </div>
              <div className="bg-[#222] border border-white/5 rounded-lg p-3 flex items-center gap-3">
                <span className="text-2xl">🚗</span>
                <div>
                  <div className="font-black text-sm tracking-wider">34 ABC 123</div>
                  <div className="text-xs text-gray-500">Ford Focus · Kırmızı · Dizel · Ön Çeker</div>
                </div>
              </div>
            </div>

            {/* Konum */}
            <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 mb-3">
              <div className="flex items-start gap-2 mb-3">
                <span>📍</span>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Araç Nerede</div>
                  <div className="text-sm font-semibold mt-0.5">Kadıköy, Moda Cad. No:45 yakını</div>
                </div>
              </div>
              <div className="h-px bg-white/5 mb-3"></div>
              <div className="flex items-start gap-2">
                <span>🎯</span>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Çekilecek Yer</div>
                  <div className="text-sm font-semibold mt-0.5">Kadıköy Ford Yetkili Servisi</div>
                </div>
              </div>
            </div>

            {/* Not */}
            <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-lg p-3 text-xs text-yellow-200 mb-4">
              💬 &ldquo;Araç yolun sağ tarafında, lastik tamamen patlak.&rdquo;
            </div>

            <button onClick={() => { setEkran("foto"); setAsama(1); setFotolar({}); setTamam(false); }} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold py-3.5 rounded-xl transition">
              📸 İşe Başla — Fotoğraf Çekimine Geç
            </button>
          </div>
        )}

        {/* FOTOĞRAF SİSTEMİ */}
        {ekran === "foto" && (
          <div>
            {/* Aşama göstergesi */}
            <div className="flex items-center px-4 pt-4 pb-2 gap-0">
              {[1,2,3].map((a,i) => (
                <div key={a} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${a < asama ? "bg-[#00C853] border-[#00C853] text-black" : asama === a ? "border-[#FF4D00] text-[#FF4D00] bg-[#FF4D00]/10" : "border-white/10 text-gray-600"}`}>
                      {a < asama ? "✓" : a}
                    </div>
                    <div className={`text-[9px] font-bold ${asama===a?"text-[#FF4D00]":a<asama?"text-[#00C853]":"text-gray-600"}`}>
                      {a===1?"Teslim Alma":a===2?"Yükleme":"Teslim"}
                    </div>
                  </div>
                  {i < 2 && <div className={`flex-1 h-0.5 mx-1 mb-3 ${a < asama ? "bg-[#00C853]" : "bg-white/10"}`}></div>}
                </div>
              ))}
            </div>

            {!tamam ? (
              <div className="p-4">
                <div className="font-black text-base mb-1">
                  {asama===1?"📸 Araç Teslim Alma":asama===2?"🔗 Çekiciye Yükleme":"🏁 Araç Teslimi"}
                </div>
                <div className="text-xs text-gray-500 mb-4 leading-relaxed">
                  {asama===1?"Araç çekilmeden önce 4 yönden fotoğraf çek.":asama===2?"Araç çekiciye bağlandıktan sonra fotoğraf çek.":"Teslimde 4 yönden fotoğraf çek, müşteri onaylayacak."}
                </div>

                <div className="bg-blue-500/7 border border-blue-500/15 rounded-lg p-3 text-xs text-blue-300 mb-4">
                  ℹ️ Fotoğraflar GPS konumu ve zaman damgasıyla kaydedilir. Değiştirilemez.
                </div>

                <div className={`grid gap-3 mb-3 ${asama===2?"grid-cols-1":"grid-cols-2"}`}>
                  {asama===1 && ["Ön","Arka","Sol Yan","Sağ Yan"].map(y => (
                    <div key={y} onClick={() => fotoEkle(1, y)} className={`aspect-[4/3] rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition ${fotolar[`1-${y}`]?"border-[#00C853] bg-[#00C853]/5":"border-dashed border-white/10 hover:border-[#FF4D00]"}`}>
                      {fotolar[`1-${y}`] ? <><span className="text-2xl">✅</span><span className="text-xs text-[#00C853] font-bold">Çekildi</span></> : <><span className="text-2xl">📷</span><span className="text-xs text-gray-500 font-bold">{y.toUpperCase()}</span></>}
                    </div>
                  ))}
                  {asama===2 && (
                    <>
                      <div onClick={() => fotoEkle(2, "genel")} className={`aspect-video rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition ${fotolar["2-genel"]?"border-[#00C853] bg-[#00C853]/5":"border-dashed border-white/10 hover:border-[#FF4D00]"}`}>
                        {fotolar["2-genel"] ? <><span className="text-3xl">✅</span><span className="text-sm text-[#00C853] font-bold">Çekildi</span></> : <><span className="text-3xl">📷</span><span className="text-sm text-gray-500 font-bold">Genel Görünüm</span></>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {["Bağlantı 1","Bağlantı 2"].map(b => (
                          <div key={b} onClick={() => fotoEkle(2, b)} className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition ${fotolar[`2-${b}`]?"border-[#00C853] bg-[#00C853]/5":"border-dashed border-white/10 hover:border-[#FF4D00]"}`}>
                            {fotolar[`2-${b}`] ? <><span className="text-xl">✅</span><span className="text-[10px] text-[#00C853] font-bold">Çekildi</span></> : <><span className="text-xl">📷</span><span className="text-[10px] text-gray-500 font-bold">{b}</span></>}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {asama===3 && ["Ön","Arka","Sol Yan","Sağ Yan"].map(y => (
                    <div key={y} onClick={() => fotoEkle(3, y)} className={`aspect-[4/3] rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition ${fotolar[`3-${y}`]?"border-[#00C853] bg-[#00C853]/5":"border-dashed border-white/10 hover:border-[#FF4D00]"}`}>
                      {fotolar[`3-${y}`] ? <><span className="text-2xl">✅</span><span className="text-xs text-[#00C853] font-bold">Çekildi</span></> : <><span className="text-2xl">📷</span><span className="text-xs text-gray-500 font-bold">{y.toUpperCase()}</span></>}
                    </div>
                  ))}
                </div>

                <div className="text-center text-xs text-gray-500 mb-4">
                  <span className="text-[#FF4D00] font-bold">{fotoSay(asama)}</span>/{fotoHedef(asama)} fotoğraf çekildi
                </div>

                {asama===2 && (
                  <div className="bg-[#00C853]/6 border border-[#00C853]/15 rounded-lg p-3 text-xs text-green-300 mb-4">
                    📱 Müşteriye &ldquo;Araç yola çıktı&rdquo; bildirimi gönderilecek.
                  </div>
                )}

                <button onClick={ilerleAsama} disabled={fotoSay(asama) < fotoHedef(asama)} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition text-sm">
                  {asama===1?"Devam Et — Araca Yükle →":asama===2?"Yola Çık — Müşteriyi Bilgilendir 🚛":"✓ İşi Tamamla — Müşteriye Gönder"}
                </button>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="text-6xl mb-4" style={{animation:"pop .5s ease"}}>🎉</div>
                <div className="font-black text-2xl mb-2">İş Tamamlandı!</div>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">Tüm fotoğraflar kaydedildi.<br/>Müşteri onayı bekleniyor.</p>
                <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 text-left space-y-3 mb-6">
                  {[["👤","Müşteri","Ayşe Kaya"],["🚗","Araç","34 ABC 123"],["📍","Teslim","Kadıköy Ford Servisi"],["📸","Fotoğraf","11 adet kaydedildi"],["⏱️","Süre","43 dakika"]].map(([ic,l,v])=>(
                    <div key={l} className="flex items-center gap-3 text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <span>{ic}</span><span className="text-gray-500 flex-1">{l}</span><span className="font-bold">{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setEkran("ana"); setTamam(false); }} className="w-full bg-[#1A1A1A] border border-white/10 hover:border-white/30 text-white font-bold py-3 rounded-xl transition text-sm">
                  Ana Sayfaya Dön
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ALT NAV */}
      <nav className="flex bg-[#1A1A1A] border-t border-white/5 flex-shrink-0">
        {[
          { icon:"🏠", label:"Ana", e:"ana" },
          { icon:"📋", label:"Aktif İş", e:"is" },
          { icon:"🕐", label:"Geçmiş", e:"ana" },
          { icon:"👤", label:"Profil", e:"ana" },
        ].map(n => (
          <button key={n.label} onClick={() => setEkran(n.e as "ana"|"is"|"foto")} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition ${ekran===n.e?"text-[#FF4D00]":"text-gray-600 hover:text-white"}`}>
            <span className="text-lg">{n.icon}</span>
            <span className="text-[9px] font-bold">{n.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
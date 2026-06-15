"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { supabase } from "../../lib/supabase";

const DEMO_FIRMALAR = [
  { id: "1", firma_ad: "Yıldız Çekici", sahip_ad: "Mehmet Yıldız", puan: 4.8, yorum: 124, sure: 8, km: 1.2, arac: 3, hizmetler: ["🚛 Çekici", "🔧 Kurtarma", "🔄 Lastik"], lat: 40.9908, lng: 29.0306 },
  { id: "2", firma_ad: "Güven Yol Yardım", sahip_ad: "Ali Güven", puan: 4.6, yorum: 87, sure: 12, km: 2.1, arac: 2, hizmetler: ["🚛 Çekici", "🔋 Akü", "⛽ Yakıt"], lat: 40.9758, lng: 29.0506 },
  { id: "3", firma_ad: "Hızlı Kurtarma", sahip_ad: "Hasan Demir", puan: 4.9, yorum: 203, sure: 6, km: 0.8, arac: 4, hizmetler: ["🚛 Çekici", "🔧 Kurtarma", "🔄 Lastik", "🔋 Akü"], lat: 40.9858, lng: 28.9906 },
];

const MAP_CENTER = { lat: 40.9837, lng: 29.0210 };

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

export default function MusteriAna() {
  const [gorunum, setGorunum] = useState<"harita" | "liste">("harita");
  const [seciliFirma, setSeciliFirma] = useState<typeof DEMO_FIRMALAR[0] | null>(null);
  const [talepModal, setTalepModal] = useState(false);
  const [sorunTip, setSorunTip] = useState("");
  const [hedef, setHedef] = useState("belirli");
  const [hedefAdres, setHedefAdres] = useState("");
  const [not, setNot] = useState("");
  const [gonderildi, setGonderildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
  });

  const onLoad = useCallback((map: google.maps.Map) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

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
    <main className="h-screen bg-[#0D0D0D] text-white flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* HEADER */}
      <header className="h-14 flex items-center justify-between px-4 bg-[#1A1A1A] border-b border-white/5 flex-shrink-0 z-40">
        <div>
          <div className="text-xs text-gray-500">Merhaba 👋</div>
          <div className="text-sm font-bold">Hoş geldin</div>
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

      {/* HARİTA */}
      {gorunum === "harita" && (
        <div className="flex-1 relative overflow-hidden">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={MAP_CENTER}
              zoom={13}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                styles: MAP_STYLE,
                disableDefaultUI: true,
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
              }}
            >
              {/* Benim konumum */}
              <Marker
                position={MAP_CENTER}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: "#0A84FF",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 3,
                }}
              />

              {/* Firma markerları */}
              {DEMO_FIRMALAR.map(f => (
                <Marker
                  key={f.id}
                  position={{ lat: f.lat, lng: f.lng }}
                  onClick={() => setSeciliFirma(f)}
                  icon={{
                    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="36">
                        <rect x="0" y="0" width="120" height="32" rx="8" fill="${seciliFirma?.id===f.id?'#FF4D00':'#1A1A1A'}" stroke="#FF4D00" stroke-width="2"/>
                        <text x="10" y="21" font-family="Arial" font-size="12" font-weight="bold" fill="white">🚛 ${f.firma_ad.split(" ")[0]} ★${f.puan}</text>
                        <polygon points="55,32 65,32 60,40" fill="${seciliFirma?.id===f.id?'#FF4D00':'#FF4D00'}"/>
                      </svg>
                    `)}`,
                    scaledSize: new google.maps.Size(120, 40),
                    anchor: new google.maps.Point(60, 40),
                  }}
                />
              ))}
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1a2332]">
              <div className="text-gray-500 text-sm">🗺️ Harita yükleniyor...</div>
            </div>
          )}

          {/* Harita kontrolleri */}
          <div className="absolute right-3 top-3 flex flex-col gap-2 z-10">
            <button onClick={() => map?.setZoom((map.getZoom() || 13) + 1)} className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-lg text-white shadow-lg">＋</button>
            <button onClick={() => map?.setZoom((map.getZoom() || 13) - 1)} className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-lg text-white shadow-lg">－</button>
            <button onClick={() => map?.panTo(MAP_CENTER)} className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-base shadow-lg">📍</button>
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
                <button onClick={() => setSeciliFirma(null)} className="w-7 h-7 bg-[#2A2A2A] rounded-lg text-gray-400 text-sm">✕</button>
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
      )}

      {/* LİSTE */}
      {gorunum === "liste" && (
        <div className="flex-1 overflow-y-auto p-3">
          {DEMO_FIRMALAR.sort((a,b) => a.km - b.km).map(f => (
            <div key={f.id} className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-4 mb-3 hover:border-[#FF4D00]/30 transition cursor-pointer" onClick={() => { setSeciliFirma(f); setGorunum("harita"); }}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3 items-center">
                  <div className="w-11 h-11 rounded-xl bg-[#FF4D00]/10 border border-[#FF4D00]/20 flex items-center justify-center text-xl flex-shrink-0">🚛</div>
                  <div>
                    <div className="font-bold text-sm">{f.firma_ad}</div>
                    <div className="text-xs text-gray-500">{f.sahip_ad}</div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25 px-2 py-0.5 rounded-full">✓ ONAYLI</span>
                      <span className="text-xs text-yellow-400">★ {f.puan}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right"><div className="font-black text-xl">{f.sure}</div><div className="text-xs text-gray-500">dk</div></div>
              </div>
              <div className="flex gap-1.5 flex-wrap mb-3">
                {f.hizmetler.map(h => <span key={h} className="text-[10px] px-2 py-1 rounded-full bg-[#2A2A2A] text-gray-400">{h}</span>)}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">📍 {f.km} km · 🚛 {f.arac} araç</div>
                <button onClick={e => { e.stopPropagation(); setSeciliFirma(f); setTalepModal(true); }} className="bg-[#FF4D00] text-white font-bold px-3 py-2 rounded-lg text-xs">Talep Oluştur</button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">Firma kabul ettiğinde seni arayacak.</p>
                <button onClick={() => { setTalepModal(false); setGonderildi(false); setSorunTip(""); setNot(""); }} className="w-full bg-[#FF4D00] text-white font-bold py-3 rounded-xl">Tamam →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
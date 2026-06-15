"use client";
import { useState } from "react";
import Link from "next/link";

const cagriData = [
  { ad:"Ayşe Kaya", tel:"0532 xxx xx xx", c:"👩 Kadın", z:"3 dk önce", tip:"🚛 Çekici", konum:"Kadıköy, Moda Cad. No:45", hedef:"Kadıköy Ford Servisi", arac:"34 ABC 123 · Ford Focus · Kırmızı · ÖÇ", not:'"Araç sağ tarafta, lastik patlak."', acil:true },
  { ad:"Mehmet Yılmaz", tel:"0533 xxx xx xx", c:"👨 Erkek", z:"8 dk önce", tip:"🚛 Çekici", konum:"Üsküdar, Bağlarbaşı", hedef:"Henüz bilmiyor", arac:"34 DEF 456 · Toyota Corolla · Beyaz", not:"—", acil:false },
  { ad:"Fatma Demir", tel:"0541 xxx xx xx", c:"👩 Kadın", z:"15 dk önce", tip:"🔄 Lastik", konum:"Beşiktaş, Barbaros Blv.", hedef:"Yerinde çözüm", arac:"Bilgi girilmemiş", not:'"Ön sol lastik patlak."', acil:false },
];

export default function Admin() {
  const [sayfa, setSayfa] = useState("panel");
  const [seciliCagri, setSeciliCagri] = useState<number|null>(0);
  const [seciliFirma, setSeciliFirma] = useState("");
  const [belgeDurum, setBelgeDurum] = useState<Record<number,string>>({});

  const d = seciliCagri !== null ? cagriData[seciliCagri] : null;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* SIDEBAR */}
      <aside className="w-48 bg-[#141414] border-r border-white/5 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-white/5">
          <div className="font-black text-base mb-0.5">Yol<span className="text-[#FF4D00]">Yardım</span></div>
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
            { id:"cagri", icon:"📞", label:"Çağrı Merkezi", badge:"3" },
            { id:"talepler", icon:"📋", label:"Tüm Talepler" },
          ].map(m => (
            <button key={m.id} onClick={() => setSayfa(m.id)} className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium mb-0.5 transition text-left ${sayfa===m.id?"bg-[#FF4D00]/10 text-[#FF4D00] font-semibold":"text-gray-500 hover:bg-white/5 hover:text-white"}`}>
              <span className="text-sm">{m.icon}</span>{m.label}
              {m.badge && <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{m.badge}</span>}
            </button>
          ))}
          <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest px-2 py-2 mt-2">Yönetim</div>
          {[
            { id:"belgeler", icon:"📄", label:"Belge Onayı", badge:"5" },
            { id:"firmalar", icon:"🏢", label:"Firmalar" },
            { id:"kullanicilar", icon:"👥", label:"Kullanıcılar" },
            { id:"istatistik", icon:"📈", label:"İstatistikler" },
          ].map(m => (
            <button key={m.id} onClick={() => setSayfa(m.id)} className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium mb-0.5 transition text-left ${sayfa===m.id?"bg-[#FF4D00]/10 text-[#FF4D00] font-semibold":"text-gray-500 hover:bg-white/5 hover:text-white"}`}>
              <span className="text-sm">{m.icon}</span>{m.label}
              {m.badge && <span className="ml-auto bg-[#FF4D00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{m.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-white/5">
          <Link href="/" className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-gray-600 hover:text-white transition">🚪 Çıkış</Link>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 bg-[#141414] border-b border-white/5 flex items-center justify-between px-5 flex-shrink-0">
          <div className="font-black text-sm">
            {sayfa==="panel"?"Genel Bakış":sayfa==="cagri"?"Çağrı Merkezi":sayfa==="belgeler"?"Belge Onayı":sayfa==="firmalar"?"Firmalar":sayfa==="kullanicilar"?"Kullanıcılar":sayfa==="istatistik"?"İstatistikler":"Tüm Talepler"}
          </div>
          <button onClick={() => setSayfa("cagri")} className="bg-[#FF4D00] text-white text-xs font-bold px-3 py-1.5 rounded-lg">📞 Çağrı Merkezine Git</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* GENEL BAKIŞ */}
          {sayfa==="panel" && (
            <div>
              <div className="grid grid-cols-5 gap-3 mb-5">
                {[
                  {l:"Bekleyen Çağrı",v:"3",c:"text-red-400",b:"border-red-500/20"},
                  {l:"Belge Onayı",v:"5",c:"text-[#FF4D00]",b:"border-[#FF4D00]/20"},
                  {l:"Aktif Firma",v:"47",c:"text-[#00C853]",b:"border-[#00C853]/15"},
                  {l:"Bugün Tamamlanan",v:"124",c:"text-blue-400",b:"border-blue-500/15"},
                  {l:"Toplam Kullanıcı",v:"2.841",c:"text-white",b:""},
                ].map(s=>(
                  <div key={s.l} className={`bg-[#141414] border border-white/5 ${s.b} rounded-xl p-4`}>
                    <div className="text-[11px] text-gray-500 mb-2">{s.l}</div>
                    <div className={`font-black text-2xl ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
                  <div className="p-3 border-b border-white/5 flex justify-between items-center">
                    <div className="text-sm font-bold">Bekleyen Belgeler</div>
                    <button onClick={()=>setSayfa("belgeler")} className="text-xs text-[#FF4D00] font-semibold">Tümü →</button>
                  </div>
                  <div className="p-3 space-y-2">
                    {["Güven Çekici — K1Ö","Hızlı Kurtarma — Sabıka","Anadolu Yol — Ruhsat"].map(b=>(
                      <div key={b} className="flex items-center gap-2 text-xs"><span className="text-[#FF4D00]">●</span><span className="flex-1">{b}</span><span className="text-[10px] bg-[#FF4D00]/10 text-[#FF4D00] px-2 py-0.5 rounded-full font-bold">Bekliyor</span></div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
                  <div className="p-3 border-b border-white/5 flex justify-between items-center">
                    <div className="text-sm font-bold">Bekleyen Çağrılar</div>
                    <button onClick={()=>setSayfa("cagri")} className="text-xs text-[#FF4D00] font-semibold">Git →</button>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="p-2 border border-red-500/25 rounded-lg animate-pulse"><div className="text-xs font-bold">Ayşe Kaya 🆘 ACİL</div><div className="text-[11px] text-gray-500">Kadıköy · 3 dk önce</div></div>
                    <div className="p-2 border border-white/8 rounded-lg"><div className="text-xs font-bold">Mehmet Yılmaz</div><div className="text-[11px] text-gray-500">Üsküdar · 8 dk önce</div></div>
                  </div>
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
                      <button onClick={()=>alert(`${seciliFirma||"Yıldız Çekici"} firmasına yönlendirildi!`)} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold py-2.5 rounded-xl transition text-sm">🚛 Firmaya Yönlendir</button>
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
            <div className="space-y-3">
              {[
                {i:0, firma:"Güven Çekici & Yol Yardım", tip:"K1Ö Yetki Belgesi", z:"2 saat önce"},
                {i:1, firma:"Hızlı Kurtarma", tip:"Şoför Sabıka Kaydı — Hasan Demir", z:"5 saat önce"},
                {i:2, firma:"Anadolu Yol Yardım", tip:"Araç Ruhsatı — 06 AB 1234", z:"1 gün önce"},
                {i:3, firma:"Yıldız Çekici", tip:"SRC Belgesi — Mehmet Şahin", z:"2 gün önce"},
              ].map(b=>(
                <div key={b.i} className={`bg-[#141414] border rounded-xl p-4 flex items-center gap-3 ${belgeDurum[b.i]==="onay"?"border-[#00C853]/30 border-l-[3px] border-l-[#00C853]":belgeDurum[b.i]==="red"?"border-red-500/30 border-l-[3px] border-l-red-500":"border-white/5 border-l-[3px] border-l-[#FF4D00]"}`}>
                  <span className="text-xl">🚛</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{b.firma}</div>
                    <div className="text-xs text-gray-500">{b.tip} · {b.z}</div>
                  </div>
                  {belgeDurum[b.i]==="onay" ? (
                    <span className="text-[10px] font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25 px-2 py-1 rounded-full">✓ Onaylandı</span>
                  ) : belgeDurum[b.i]==="red" ? (
                    <span className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-full">✕ Reddedildi</span>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={()=>setBelgeDurum({...belgeDurum,[b.i]:"onay"})} className="text-[11px] font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25 px-3 py-1.5 rounded-lg hover:bg-[#00C853]/20 transition">✓ Onayla</button>
                      <button onClick={()=>setBelgeDurum({...belgeDurum,[b.i]:"red"})} className="text-[11px] font-bold bg-red-500/8 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition">✕ Ret</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FİRMALAR */}
          {sayfa==="firmalar" && (
            <div>
              <input placeholder="🔍 Firma ara..." className="w-full bg-[#141414] border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00] transition mb-4" />
              <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full"><thead><tr className="border-b border-white/5">
                  {["Firma","İl","Araç","Puan","Durum"].map(h=><th key={h} className="text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 px-4 py-3">{h}</th>)}
                </tr></thead><tbody>
                  {[
                    {ad:"Yıldız Çekici",il:"İstanbul",arac:3,puan:"⭐ 4.8",d:"Aktif",dc:"text-[#00C853]"},
                    {ad:"Güven Yol Yardım",il:"İstanbul",arac:2,puan:"⭐ 4.6",d:"Onay Bekliyor",dc:"text-[#FF4D00]"},
                    {ad:"Hızlı Kurtarma",il:"Ankara",arac:4,puan:"⭐ 4.9",d:"Aktif",dc:"text-[#00C853]"},
                    {ad:"Marmara Çekici",il:"İstanbul",arac:1,puan:"—",d:"Askıya Alındı",dc:"text-red-400"},
                  ].map((f,i)=>(
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                      <td className="px-4 py-3 font-semibold text-sm">{f.ad}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{f.il}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{f.arac}</td>
                      <td className="px-4 py-3 text-sm">{f.puan}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold ${f.dc}`}>{f.d}</span></td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            </div>
          )}

          {/* KULLANICILAR */}
          {sayfa==="kullanicilar" && (
            <div>
              <input placeholder="🔍 Kullanıcı ara..." className="w-full bg-[#141414] border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00] transition mb-4" />
              <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full"><thead><tr className="border-b border-white/5">
                  {["Kullanıcı","Telefon","Talep","Durum"].map(h=><th key={h} className="text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 px-4 py-3">{h}</th>)}
                </tr></thead><tbody>
                  {[{ad:"Ayşe Kaya",c:"👩",tel:"0532 xxx",t:3},{ad:"Mehmet Yılmaz",c:"👨",tel:"0533 xxx",t:7},{ad:"Fatma Demir",c:"👩",tel:"0541 xxx",t:1}].map((u,i)=>(
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                      <td className="px-4 py-3"><div className="font-semibold text-sm">{u.ad}</div><div className="text-xs text-gray-500">{u.c}</div></td>
                      <td className="px-4 py-3 text-sm text-gray-400">{u.tel}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{u.t}</td>
                      <td className="px-4 py-3"><span className="text-xs font-bold text-[#00C853]">Aktif</span></td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            </div>
          )}

          {/* İSTATİSTİK */}
          {sayfa==="istatistik" && (
            <div>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[{l:"Bu Ay",v:"1.243",c:"text-[#00C853]"},{l:"Ort. Yanıt",v:"11 dk",c:"text-blue-400"},{l:"Aktif Firma",v:"47",c:"text-[#FF4D00]"},{l:"Memnuniyet",v:"4.7 ★",c:"text-white"}].map(s=>(
                  <div key={s.l} className="bg-[#141414] border border-white/5 rounded-xl p-4"><div className="text-[11px] text-gray-500 mb-2">{s.l}</div><div className={`font-black text-2xl ${s.c}`}>{s.v}</div></div>
                ))}
              </div>
              <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5 font-bold text-sm">Aylık Tamamlanan Talepler</div>
                <div className="p-5">
                  <div className="flex items-end justify-around h-32 bg-[#1E1E1E] rounded-xl px-4 pt-4 gap-2">
                    {[{v:87,l:"Oca"},{v:102,l:"Şub"},{v:134,l:"Mar"},{v:98,l:"Nis"},{v:156,l:"May"},{v:187,l:"Haz",a:true}].map(b=>(
                      <div key={b.l} className="flex flex-col items-center gap-1 flex-1">
                        <div className="text-[10px] font-bold text-gray-400">{b.v}</div>
                        <div className="w-full rounded-t-sm" style={{height:`${(b.v/187)*80}px`,background:b.a?"#FF4D00":"rgba(255,77,0,.3)"}}></div>
                        <div className="text-[10px] text-gray-600">{b.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TALEPLER */}
          {sayfa==="talepler" && (
            <div>
              <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full"><thead><tr className="border-b border-white/5">
                  {["No","Müşteri","Firma","Hizmet","Durum"].map(h=><th key={h} className="text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 px-4 py-3">{h}</th>)}
                </tr></thead><tbody>
                  {[
                    {no:"#2847",m:"Ayşe Kaya",f:"Yıldız Çekici",h:"Çekici",d:"Bekliyor",dc:"text-[#FF4D00]"},
                    {no:"#2846",m:"Cem Türkmen",f:"Yıldız Çekici",h:"Akü",d:"Tamamlandı",dc:"text-[#00C853]"},
                    {no:"#2845",m:"Selin Arslan",f:"Hızlı Kurtarma",h:"Lastik",d:"Tamamlandı",dc:"text-[#00C853]"},
                  ].map((t,i)=>(
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                      <td className="px-4 py-3 text-sm font-mono text-gray-400">{t.no}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{t.m}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{t.f}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{t.h}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold ${t.dc}`}>{t.d}</span></td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
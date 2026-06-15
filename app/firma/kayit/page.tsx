"use client";
import { useState } from "react";
import Link from "next/link";

const adimlar = [
  { n: 1, label: "Firma Bilgileri" },
  { n: 2, label: "Belgeler" },
  { n: 3, label: "Araçlar" },
  { n: 4, label: "Şoförler" },
  { n: 5, label: "Onay" },
];

export default function FirmaKayit() {
  const [adim, setAdim] = useState(1);
  const [araclar, setAraclar] = useState<{plaka:string,tur:string}[]>([]);
  const [soforler, setSoforler] = useState<{ad:string,soyad:string,tel:string}[]>([]);
  const [aracModal, setAracModal] = useState(false);
  const [soforModal, setSoforModal] = useState(false);
  const [yeniArac, setYeniArac] = useState({plaka:"",tur:""});
  const [yeniSofor, setYeniSofor] = useState({ad:"",soyad:"",tel:""});

  function ileri() { if (adim < 5) setAdim(adim + 1); }
  function geri() { if (adim > 1) setAdim(adim - 1); }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex">
      {/* SOL PANEL */}
      <div className="w-52 bg-[#1A1A1A] border-r border-white/5 p-5 flex flex-col flex-shrink-0">
        <Link href="/" className="font-black text-base mb-1">Yol<span className="text-[#FF4D00]">Yardım</span></Link>
        <div className="text-[9px] text-[#FF4D00] font-bold tracking-widest uppercase mb-6">Firma Kaydı</div>
        <div className="flex flex-col gap-1 flex-1">
          {adimlar.map(a => (
            <div key={a.n} className={`flex items-center gap-2 px-2 py-2 rounded-lg ${adim === a.n ? "bg-[#FF4D00]/10" : ""}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 border-2 transition-all ${a.n < adim ? "bg-[#00C853] border-[#00C853] text-black" : adim === a.n ? "border-[#FF4D00] text-[#FF4D00]" : "border-white/10 text-gray-600"}`}>
                {a.n < adim ? "✓" : a.n}
              </div>
              <span className={`text-xs font-medium ${adim === a.n ? "text-white font-semibold" : "text-gray-600"}`}>{a.label}</span>
            </div>
          ))}
        </div>
        <Link href="/" className="text-[11px] text-gray-600 hover:text-white transition">← Portale Dön</Link>
      </div>

      {/* SAĞ İÇERİK */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Progress */}
        <div className="h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-[#FF4D00] rounded-full transition-all duration-500" style={{width: `${(adim/5)*100}%`}} />
        </div>

        {/* ADIM 1 */}
        {adim === 1 && (
          <div className="max-w-2xl">
            <h1 className="font-black text-2xl mb-1">Firma Bilgileri</h1>
            <p className="text-gray-500 text-sm mb-7">Platformda görünecek bilgileri ekle.</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-xs font-semibold text-gray-400 mb-2">Ad *</label><input type="text" placeholder="Adınız" className="w-full bg-[#1A1A1A] border border-white/8 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-2">Soyad *</label><input type="text" placeholder="Soyadınız" className="w-full bg-[#1A1A1A] border border-white/8 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" /></div>
            </div>
            <div className="mb-4"><label className="block text-xs font-semibold text-gray-400 mb-2">Firma Adı *</label><input type="text" placeholder="Yıldız Çekici & Yol Yardım" className="w-full bg-[#1A1A1A] border border-white/8 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" /></div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-xs font-semibold text-gray-400 mb-2">Vergi No *</label><input type="text" placeholder="1234567890" className="w-full bg-[#1A1A1A] border border-white/8 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-2">Telefon *</label><input type="tel" placeholder="0532 xxx xx xx" className="w-full bg-[#1A1A1A] border border-white/8 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-xs font-semibold text-gray-400 mb-2">İl *</label>
                <select className="w-full bg-[#1A1A1A] border border-white/8 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition">
                  <option>İstanbul</option><option>Ankara</option><option>İzmir</option><option>Bursa</option><option>Antalya</option><option>Diğer</option>
                </select>
              </div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-2">İlçe *</label><input type="text" placeholder="İlçe" className="w-full bg-[#1A1A1A] border border-white/8 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition" /></div>
            </div>
            <div className="mb-6"><label className="block text-xs font-semibold text-gray-400 mb-2">Hizmet Bölgesi *</label><textarea placeholder="Örn: İstanbul Avrupa yakası, TEM ve E-5 bölgesi..." rows={2} className="w-full bg-[#1A1A1A] border border-white/8 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[#FF4D00] transition resize-none" /></div>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-400 mb-3">Sunduğunuz Hizmetler *</label>
              <div className="flex flex-wrap gap-2">
                {["🚛 Çekici","🔧 Kurtarma","🔄 Lastik","🔋 Akü","⛽ Yakıt","🔑 Çilingir"].map(h => (
                  <label key={h} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/8 bg-[#1A1A1A] cursor-pointer text-sm font-medium hover:border-[#FF4D00] transition has-[:checked]:border-[#FF4D00] has-[:checked]:bg-[#FF4D00]/8 has-[:checked]:text-[#FF4D00]">
                    <input type="checkbox" className="hidden" />{h}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={ileri} className="bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold px-8 py-3 rounded-xl transition text-sm">Devam Et →</button>
          </div>
        )}

        {/* ADIM 2 */}
        {adim === 2 && (
          <div className="max-w-2xl">
            <h1 className="font-black text-2xl mb-1">Belgeler</h1>
            <p className="text-gray-500 text-sm mb-2">Belgeler onaylandıktan sonra aktif olursunuz.</p>
            <div className="bg-[#0A84FF]/8 border border-[#0A84FF]/20 rounded-xl p-4 text-xs text-blue-300 mb-6">ℹ️ Belgeler güvenli sunucularımızda saklanır. Müşterilere yalnızca &quot;Onaylı&quot; rozeti gösterilir.</div>
            <div className="space-y-4">
              {["K1Ö Yetki Belgesi *","Ticaret Sicil Belgesi *"].map(b => (
                <div key={b}>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">{b}</label>
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-[#FF4D00] transition">
                    <div className="text-3xl mb-2">📄</div>
                    <div className="text-sm font-semibold mb-1">Tıklayın veya sürükleyin</div>
                    <div className="text-xs text-gray-600">PDF, JPG, PNG — maks. 10MB</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={geri} className="px-6 py-3 rounded-xl border border-white/10 text-sm font-semibold hover:border-white/30 transition">← Geri</button>
              <button onClick={ileri} className="bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold px-8 py-3 rounded-xl transition text-sm">Devam Et →</button>
            </div>
          </div>
        )}

        {/* ADIM 3 */}
        {adim === 3 && (
          <div className="max-w-2xl">
            <h1 className="font-black text-2xl mb-1">Araç Filosu</h1>
            <p className="text-gray-500 text-sm mb-6">En az 1 araç eklemelisin.</p>
            <div className="space-y-3 mb-4">
              {araclar.map((a, i) => (
                <div key={i} className="bg-[#1A1A1A] border border-white/8 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">🚛</span>
                  <div className="flex-1"><div className="font-bold text-sm">{a.plaka}</div><div className="text-xs text-gray-500">{a.tur}</div></div>
                  <button onClick={() => setAraclar(araclar.filter((_,j) => j!==i))} className="text-gray-600 hover:text-red-400 transition text-lg">🗑</button>
                </div>
              ))}
            </div>
            <button onClick={() => setAracModal(true)} className="w-full flex items-center gap-2 justify-center py-3 rounded-xl border border-dashed border-white/10 text-gray-500 hover:border-[#FF4D00] hover:text-[#FF4D00] transition text-sm font-semibold mb-6">+ Araç Ekle</button>
            <div className="flex gap-3">
              <button onClick={geri} className="px-6 py-3 rounded-xl border border-white/10 text-sm font-semibold hover:border-white/30 transition">← Geri</button>
              <button onClick={ileri} disabled={araclar.length === 0} className="bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold px-8 py-3 rounded-xl transition text-sm">Devam Et →</button>
            </div>
          </div>
        )}

        {/* ADIM 4 */}
        {adim === 4 && (
          <div className="max-w-2xl">
            <h1 className="font-black text-2xl mb-1">Şoförler</h1>
            <p className="text-gray-500 text-sm mb-6">En az 1 şoför eklemelisin.</p>
            <div className="space-y-3 mb-4">
              {soforler.map((s, i) => (
                <div key={i} className="bg-[#1A1A1A] border border-white/8 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center font-bold text-sm">{s.ad[0]}{s.soyad[0]}</div>
                  <div className="flex-1"><div className="font-bold text-sm">{s.ad} {s.soyad}</div><div className="text-xs text-gray-500">+90 {s.tel}</div></div>
                  <button onClick={() => setSoforler(soforler.filter((_,j) => j!==i))} className="text-gray-600 hover:text-red-400 transition text-lg">🗑</button>
                </div>
              ))}
            </div>
            <button onClick={() => setSoforModal(true)} className="w-full flex items-center gap-2 justify-center py-3 rounded-xl border border-dashed border-white/10 text-gray-500 hover:border-[#FF4D00] hover:text-[#FF4D00] transition text-sm font-semibold mb-6">+ Şoför Ekle</button>
            <div className="flex gap-3">
              <button onClick={geri} className="px-6 py-3 rounded-xl border border-white/10 text-sm font-semibold hover:border-white/30 transition">← Geri</button>
              <button onClick={ileri} disabled={soforler.length === 0} className="bg-[#FF4D00] hover:bg-[#CC3D00] disabled:opacity-40 text-white font-bold px-8 py-3 rounded-xl transition text-sm">Başvuruyu Gönder →</button>
            </div>
          </div>
        )}

        {/* ADIM 5 */}
        {adim === 5 && (
          <div className="max-w-lg text-center py-10">
            <div className="text-6xl mb-5" style={{animation:"pop .5s ease"}}>⏳</div>
            <h1 className="font-black text-2xl mb-3">Başvurun alındı!</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Belgelerini inceliyoruz. Genellikle <strong className="text-white">24–48 saat</strong> içinde sonuçlandırılır. Onaylanınca SMS ile bildirim alırsın.</p>
            <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-5 text-left space-y-3 mb-8">
              {["Firma bilgileri kaydedildi","Belgeler yüklendi","Araç bilgileri kaydedildi","Şoför bilgileri kaydedildi"].map(i => (
                <div key={i} className="flex items-center gap-3 text-sm"><span className="text-[#00C853]">●</span>{i}</div>
              ))}
              <div className="flex items-center gap-3 text-sm"><span className="text-[#FF4D00] animate-pulse">●</span>Admin incelemesi bekleniyor</div>
            </div>
            <Link href="/firma/panel" className="inline-block bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold px-8 py-3 rounded-xl transition text-sm">Firma Paneline Git →</Link>
          </div>
        )}
      </div>

      {/* ARAÇ MODAL */}
      {aracModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-5" onClick={() => setAracModal(false)}>
          <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5"><h2 className="font-black text-lg">Araç Ekle</h2><button onClick={() => setAracModal(false)} className="w-7 h-7 bg-[#2A2A2A] rounded-lg text-gray-400 text-sm">✕</button></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="block text-xs font-semibold text-gray-400 mb-2">Plaka *</label><input value={yeniArac.plaka} onChange={e => setYeniArac({...yeniArac, plaka: e.target.value.toUpperCase()})} placeholder="34 XY 1234" className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00] transition" /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-2">Araç Türü *</label>
                <select value={yeniArac.tur} onChange={e => setYeniArac({...yeniArac, tur: e.target.value})} className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00] transition">
                  <option value="">Seçin</option><option>Çekici (Platform)</option><option>Vinçli Kurtarıcı</option><option>Yol Yardım Aracı</option>
                </select>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              {["Araç Fotoğrafı","Ruhsat *","Sigorta Poliçesi *"].map(l => (
                <div key={l}><label className="block text-xs font-semibold text-gray-400 mb-1">{l}</label><div className="border border-dashed border-white/10 rounded-lg p-3 text-center cursor-pointer hover:border-[#FF4D00] transition text-xs text-gray-600">📎 Dosya seç</div></div>
              ))}
            </div>
            <button onClick={() => { if(yeniArac.plaka && yeniArac.tur){ setAraclar([...araclar, yeniArac]); setYeniArac({plaka:"",tur:""}); setAracModal(false); }}} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold py-3 rounded-xl transition text-sm">Aracı Kaydet</button>
          </div>
        </div>
      )}

      {/* ŞOFÖR MODAL */}
      {soforModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-5" onClick={() => setSoforModal(false)}>
          <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-6 w-full max-w-md max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5"><h2 className="font-black text-lg">Şoför Ekle</h2><button onClick={() => setSoforModal(false)} className="w-7 h-7 bg-[#2A2A2A] rounded-lg text-gray-400 text-sm">✕</button></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="block text-xs font-semibold text-gray-400 mb-2">Ad *</label><input value={yeniSofor.ad} onChange={e => setYeniSofor({...yeniSofor, ad: e.target.value})} placeholder="Ad" className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00] transition" /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-2">Soyad *</label><input value={yeniSofor.soyad} onChange={e => setYeniSofor({...yeniSofor, soyad: e.target.value})} placeholder="Soyad" className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00] transition" /></div>
            </div>
            <div className="mb-3"><label className="block text-xs font-semibold text-gray-400 mb-2">Telefon *</label><input value={yeniSofor.tel} onChange={e => setYeniSofor({...yeniSofor, tel: e.target.value})} placeholder="5XX XXX XX XX" className="w-full bg-[#2A2A2A] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF4D00] transition" /></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {["Ehliyet *","Sabıka Kaydı *","SRC Belgesi *","Psikoteknik *"].map(l => (
                <div key={l}><label className="block text-xs font-semibold text-gray-400 mb-1">{l}</label><div className="border border-dashed border-white/10 rounded-lg p-3 text-center cursor-pointer hover:border-[#FF4D00] transition text-xs text-gray-600">📎 Seç</div></div>
              ))}
            </div>
            <button onClick={() => { if(yeniSofor.ad && yeniSofor.soyad && yeniSofor.tel){ setSoforler([...soforler, yeniSofor]); setYeniSofor({ad:"",soyad:"",tel:""}); setSoforModal(false); }}} className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-bold py-3 rounded-xl transition text-sm mt-2">Şoförü Kaydet</button>
          </div>
        </div>
      )}
    </main>
  );
}
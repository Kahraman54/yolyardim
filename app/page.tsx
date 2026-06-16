export default function Home() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5">
        <div className="font-black text-xl tracking-tight">
          Tulpar<span className="text-[#FF4D00]"> Assist</span>
        </div>
        <div className="flex gap-3">
          <a href="/firma/kayit" className="px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-gray-400 hover:text-white transition">
            Firma Ol
          </a>
          <a href="/firma/giris" className="px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-gray-400 hover:text-white transition">
            Firma Girişi
          </a>
          <a href="/giris" className="px-4 py-2 rounded-lg bg-[#FF4D00] text-sm font-semibold hover:bg-[#CC3D00] transition">
            Giriş Yap
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_500px_at_50%_30%,rgba(255,77,0,0.10),transparent_70%)] pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-[#FF4D00]/10 border border-[#FF4D00]/30 text-[#FF4D00] rounded-full px-4 py-1.5 text-xs font-bold mb-8 tracking-wide">
          <span className="w-2 h-2 rounded-full bg-[#FF4D00] animate-pulse" />
          7/24 Aktif Hizmet
        </div>

        <h1 className="font-black text-5xl md:text-7xl leading-tight tracking-tighter mb-6">
          Yolda kaldın mı?<br />
          <span className="text-[#FF4D00]">Biz zaten yoldayız.</span>
        </h1>

        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Türkiye&apos;nin her noktasında çekici ve yol yardım firmalarını saniyeler içinde bulun. Güvenli, hızlı, şeffaf.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/giris" className="px-8 py-4 bg-[#FF4D00] rounded-xl font-bold text-base hover:bg-[#CC3D00] transition hover:-translate-y-0.5">
            🚨 Hemen Yardım İste
          </a>
          <a href="/firma/kayit" className="px-8 py-4 rounded-xl font-bold text-base border border-white/10 hover:border-white/30 transition">
            Firma Olarak Katıl →
          </a>
        </div>

        {/* İSTATİSTİKLER */}
        <div className="flex justify-center gap-16 mt-20 pt-12 border-t border-white/5 flex-wrap">
          {[
            { val: "1.200+", label: "Kayıtlı Firma" },
            { val: "81 İl", label: "Türkiye Geneli" },
            { val: "12 dk", label: "Ortalama Varış" },
            { val: "4.8 ★", label: "Kullanıcı Puanı" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-black text-3xl">{s.val}</div>
              <div className="text-gray-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section className="py-20 px-6 bg-[#1A1A1A]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[#FF4D00] text-xs font-bold tracking-widest uppercase mb-3">Nasıl Çalışır?</div>
            <h2 className="font-black text-4xl tracking-tight">3 adımda yardım kapında.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "📍", title: "Konumunu Paylaş", desc: "GPS ile bulunduğun yeri otomatik tespit ediyoruz. Tarif vermeye gerek yok." },
              { icon: "🔍", title: "Firmayı Seç", desc: "En yakın, en yüksek puanlı firmaları gör. Fiyat teklifini önceden al." },
              { icon: "🚛", title: "Yardım Geliyor", desc: "Çekiciyi canlı takip et. Hangi plakalı aracın geldiğini bil." },
            ].map((s, i) => (
              <div key={i} className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-8 hover:border-[#FF4D00]/30 transition">
                <div className="text-4xl mb-5">{s.icon}</div>
                <div className="font-bold text-lg mb-3">{s.title}</div>
                <div className="text-gray-500 text-sm leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KİM İÇİN */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[#FF4D00] text-xs font-bold tracking-widest uppercase mb-3">Kim İçin?</div>
            <h2 className="font-black text-4xl tracking-tight">İki tarafa da değer katıyoruz.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1A1A1A] border border-[#FF4D00]/20 rounded-2xl p-8">
              <span className="text-xs font-bold tracking-widest uppercase bg-[#FF4D00]/10 text-[#FF4D00] px-3 py-1 rounded-full">Sürücüler İçin</span>
              <h3 className="font-black text-2xl mt-5 mb-5">Yolda kaldığında panik yapma.</h3>
              <ul className="space-y-3">
                {[
                  "En yakın firmayı saniyeler içinde bul",
                  "Fiyat teklifini önceden gör",
                  "Çekiciyi haritada canlı takip et",
                  "3 aşamalı fotoğraf sistemi ile güvende ol",
                  "7/24 aktif hizmet",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-300 text-sm">
                    <span className="text-[#00C853] font-bold mt-0.5">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-8">
              <span className="text-xs font-bold tracking-widest uppercase bg-white/5 text-gray-400 px-3 py-1 rounded-full">Firmalar İçin</span>
              <h3 className="font-black text-2xl mt-5 mb-5">Müşteri bulmak artık çok kolay.</h3>
              <ul className="space-y-3">
                {[
                  "Bölgendeki talepleri anında gör",
                  "Reklam masrafı olmadan müşteriye ulaş",
                  "GPS ile km bazlı otomatik fiyatlandırma",
                  "Sabit aylık ücret, komisyon yok",
                  "Kolay yönetim paneli",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-300 text-sm">
                    <span className="text-[#00C853] font-bold mt-0.5">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section className="py-20 px-6 bg-[#1A1A1A]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[#FF4D00] text-xs font-bold tracking-widest uppercase mb-3">Özellikler</div>
            <h2 className="font-black text-4xl tracking-tight">Neden biz?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "🗺️", title: "Canlı Konum Takibi", desc: "Çekici hareket halindeyken haritada takip edin." },
              { icon: "💰", title: "Şeffaf Fiyatlandırma", desc: "GPS ile km hesabı, önceden fiyat teklifi, sürpriz yok." },
              { icon: "📸", title: "3 Aşamalı Fotoğraf", desc: "Teslim alma, yükleme, teslim. İki tarafı da korur." },
              { icon: "⭐", title: "Gerçek Değerlendirmeler", desc: "Her hizmet sonrası kullanıcı yorumu. Sahte yorum yok." },
              { icon: "🏢", title: "Kurumsal Çözüm", desc: "Sigorta ve garanti şirketleri için özel tarife sistemi." },
              { icon: "🌙", title: "7/24 Aktif", desc: "Gece 03:00'te de sistem çalışıyor. Kesintisiz hizmet." },
            ].map((f, i) => (
              <div key={i} className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-6 hover:border-[#FF4D00]/30 transition">
                <div className="w-11 h-11 rounded-xl bg-[#FF4D00]/10 flex items-center justify-center text-xl mb-5">{f.icon}</div>
                <div className="font-bold text-base mb-2">{f.title}</div>
                <div className="text-gray-500 text-sm leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#1A1A1A] border border-[#FF4D00]/20 rounded-3xl p-16">
            <h2 className="font-black text-4xl tracking-tight mb-4">
              Yolda bir kez mahsur kalmadan önce.
            </h2>
            <p className="text-gray-400 mb-10 leading-relaxed">
              Ücretsiz kayıt ol. Umarız hiç kullanman gerekmez ama gerekirse hazır olsun.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="/giris" className="px-8 py-4 bg-[#FF4D00] rounded-xl font-bold hover:bg-[#CC3D00] transition">
                📱 Hemen Başla
              </a>
              <a href="/firma/kayit" className="px-8 py-4 rounded-xl font-bold border border-white/10 hover:border-white/30 transition">
                Firma Olarak Katıl
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-6">
          <div className="font-black text-lg">Tulpar<span className="text-[#FF4D00]"> Assist</span></div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition">Hakkımızda</a>
            <a href="#" className="hover:text-white transition">Gizlilik</a>
            <a href="#" className="hover:text-white transition">Kullanım Şartları</a>
            <a href="#" className="hover:text-white transition">İletişim</a>
          </div>
          <div className="text-sm text-gray-600">© 2025 Tulpar Assist</div>
        </div>
      </footer>
    </main>
  );
}
import NavBar from "./components/NavBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-[#F5F8FA]" style={{ fontFamily: "var(--font-barlow), Arial, sans-serif" }}>

      <NavBar />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none hidden md:block bg-[radial-gradient(ellipse_900px_600px_at_60%_40%,rgba(28,42,57,0.5),transparent_70%)]" />
        <div className="absolute inset-0 pointer-events-none md:hidden bg-[radial-gradient(ellipse_400px_300px_at_50%_30%,rgba(0,212,255,0.04),transparent_80%)]" />

        <div className="max-w-6xl mx-auto w-full flex items-center gap-8">
          {/* Sol: içerik */}
          <div className="flex-1">
            <h1 className="font-black leading-none mb-6" style={{ letterSpacing: "-0.02em" }}>
              <span className="block italic text-[#F5F8FA]" style={{ fontSize: "clamp(3rem, 9vw, 7rem)" }}>Tulpar<span className="text-[#00D4FF]">Assist</span></span>
              <span className="block italic text-[#F5F8FA] font-semibold" style={{ fontSize: "clamp(2rem, 6vw, 5rem)", letterSpacing: "-0.01em", marginTop: "0.5rem" }}>Yardıma ihtiyacın olduğu her anda</span>
              <span className="block italic text-[#00D4FF]" style={{ fontSize: "clamp(2rem, 6vw, 5rem)" }}>Tulpar yanında!</span>
            </h1>

            <p className="text-[#9DB4C6] text-lg max-w-lg mb-10 leading-relaxed font-normal">
              Türkiye&apos;nin her noktasında çekici ve lastikçi firmalarını saniyeler içinde bulun ve yardım çağırın.
            </p>

            <div className="flex gap-4 flex-wrap">
              <a href="/giris" className="flex-1 text-center px-8 py-4 bg-[#00D4FF] text-[#0B0F14] rounded-xl font-black text-base hover:bg-[#0099BB] transition hover:-translate-y-0.5 uppercase tracking-wide">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/tulpar-logo-v3.png" alt="" className="h-7 w-7 object-contain inline-block mr-2" style={{ filter: "brightness(0)" }} />
                Hemen Yardım İste!
              </a>
              <a href="/firma/kayit" className="flex-1 text-center px-8 py-4 rounded-xl font-bold text-base border border-[#5C7386]/50 text-[#9DB4C6] hover:border-[#9DB4C6] hover:text-[#F5F8FA] transition uppercase tracking-wide">
                Tedarikçi Olarak Katıl →
              </a>
            </div>

            <div className="flex gap-3 flex-wrap mt-4">
              <a href="#" className="flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#1E2A39] border border-[#5C7386]/30 hover:border-[#5C7386]/60 transition">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#F5F8FA] flex-shrink-0" xmlns="http://www.w3.org/2000/svg"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div>
                  <div className="text-[#9DB4C6] text-xs leading-none mb-0.5">İndir</div>
                  <div className="text-[#F5F8FA] font-bold text-base leading-none">App Store</div>
                </div>
              </a>
              <a href="#" className="flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#1E2A39] border border-[#5C7386]/30 hover:border-[#5C7386]/60 transition">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#F5F8FA] flex-shrink-0" xmlns="http://www.w3.org/2000/svg"><path d="M3.18 23.76c.3.17.65.19.97.08l.1-.06 10.59-6.1-2.3-2.3-9.36 8.38zm14.09-8.1L14.96 13l2.31-2.31 3.4 1.93c.97.55.97 1.46 0 2.01l-3.4 1.03zM2.58.27C2.29.55 2.1 1 2.1 1.62v20.74c0 .63.2 1.07.49 1.35l.07.06 11.61-11.6v-.28L2.58.27zm11.2 10.53L4.18 1.27l.1-.06c.32-.11.67-.09.97.08l12.78 7.35-4.25 2.16z"/></svg>
                <div>
                  <div className="text-[#9DB4C6] text-xs leading-none mb-0.5">İndir</div>
                  <div className="text-[#F5F8FA] font-bold text-base leading-none">Google Play</div>
                </div>
              </a>
            </div>
          </div>

          {/* Sağ: logo */}
          <div className="hidden md:flex flex-shrink-0 items-center justify-center" style={{ width: "48%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tulpar-logo-v3.png" alt="Tulpar" className="w-full" style={{ filter: "drop-shadow(0 0 40px rgba(0,212,255,0.15)) drop-shadow(0 0 80px rgba(0,212,255,0.08))" }} />
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full mt-20 pt-10 border-t border-[#5C7386]/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: "7/24", label: "Kesintisiz Hizmet" },
              { val: "Canlı", label: "Konum Takibi" },
              { val: "Şeffaf", label: "Önceden Fiyat" },
              { val: "Güvenli", label: "Fotoğraflı Teslim" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-black text-3xl italic text-[#F5F8FA]">{s.val}</div>
                <div className="text-[#5C7386] text-sm mt-1 font-semibold uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section className="py-24 px-6 bg-[#1E2A39]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <div className="text-[#00D4FF] text-xs font-black tracking-widest uppercase mb-4">Nasıl Çalışır?</div>
            <h2 className="font-black text-5xl md:text-6xl uppercase italic leading-none text-[#F5F8FA]" style={{ letterSpacing: "-0.02em" }}>
              3 adımda Tulpar yanında!
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { num: "01", title: "Konumunu Paylaş", desc: "GPS ile bulunduğun yeri otomatik tespit ediyoruz. Tarif vermeye gerek yok." },
              { num: "02", title: "Tedarikçiyi Seç", desc: "En yakın, en yüksek puanlı tedarikçileri gör. Fiyat teklifini önceden al." },
              { num: "03", title: "Yardım Geliyor", desc: "Çekiciyi canlı takip et. Hangi plakalı aracın geldiğini bil." },
            ].map((s) => (
              <div key={s.num} className="bg-[#0B0F14] border border-[#5C7386]/20 rounded-2xl p-8 hover:border-[#5C7386]/50 transition group">
                <div className="font-black text-3xl italic text-[#5C7386]/40 leading-none mb-6 group-hover:text-[#00D4FF]/30 transition">{s.num}</div>
                <div className="font-black text-xl uppercase tracking-tight text-[#F5F8FA] mb-3">{s.title}</div>
                <div className="text-[#9DB4C6] text-sm leading-relaxed font-normal">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KİM İÇİN */}
      <section className="py-24 px-6 bg-[#0B0F14]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <div className="text-[#00D4FF] text-xs font-black tracking-widest uppercase mb-4">Kim İçin?</div>
            <h2 className="font-black text-5xl md:text-6xl uppercase italic leading-none text-[#F5F8FA]" style={{ letterSpacing: "-0.02em" }}>
              İki tarafa da<br />değer katıyoruz.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1E2A39] border border-[#00D4FF]/20 rounded-2xl p-10">
              <div className="text-xs font-black tracking-widest uppercase bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 px-3 py-1.5 rounded-full inline-block mb-8">
                Sürücüler İçin
              </div>
              <h3 className="font-black text-3xl uppercase italic leading-tight text-[#F5F8FA] mb-8" style={{ letterSpacing: "-0.01em" }}>
                Yolda kaldığında<br />panik yapma.
              </h3>
              <ul className="space-y-4">
                {["En yakın firmayı saniyeler içinde bul","Fiyat teklifini önceden gör","Çekiciyi haritada canlı takip et","3 aşamalı fotoğraf ile güvende ol","7/24 aktif hizmet"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[#D6DEE6] text-sm font-semibold">
                    <span className="w-5 h-5 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] text-xs flex items-center justify-center font-black flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#1E2A39] border border-[#5C7386]/30 rounded-2xl p-10">
              <div className="text-xs font-black tracking-widest uppercase bg-[#5C7386]/10 text-[#9DB4C6] border border-[#5C7386]/30 px-3 py-1.5 rounded-full inline-block mb-8">
                Firmalar İçin
              </div>
              <h3 className="font-black text-3xl uppercase italic leading-tight text-[#F5F8FA] mb-8" style={{ letterSpacing: "-0.01em" }}>
                Müşteri bulmak<br />artık çok kolay.
              </h3>
              <ul className="space-y-4">
                {["Bölgendeki talepleri anında gör","Reklam masrafı olmadan müşteriye ulaş","Kendi fiyatını kendin belirle","Sabit aylık ücret, komisyon yok","Kolay yönetim paneli"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[#D6DEE6] text-sm font-semibold">
                    <span className="w-5 h-5 rounded-full bg-[#9DB4C6]/10 border border-[#9DB4C6]/30 text-[#9DB4C6] text-xs flex items-center justify-center font-black flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section className="py-24 px-6 bg-[#1E2A39]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <div className="text-[#00D4FF] text-xs font-black tracking-widest uppercase mb-4">Özellikler</div>
            <h2 className="font-black text-5xl md:text-6xl uppercase italic leading-none text-[#F5F8FA]" style={{ letterSpacing: "-0.02em" }}>
              Neden biz?
            </h2>
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
              <div key={i} className="bg-[#0B0F14] border border-[#5C7386]/20 rounded-2xl p-7 hover:border-[#00D4FF]/20 transition group">
                <div className="w-11 h-11 rounded-xl bg-[#1E2A39] border border-[#5C7386]/30 flex items-center justify-center text-xl mb-6 group-hover:border-[#00D4FF]/30 transition">{f.icon}</div>
                <div className="font-black text-base uppercase tracking-tight text-[#F5F8FA] mb-2">{f.title}</div>
                <div className="text-[#9DB4C6] text-sm leading-relaxed font-normal">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#0B0F14]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1E2A39] border border-[#5C7386]/30 rounded-3xl p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_300px_at_50%_100%,rgba(0,212,255,0.04),transparent_70%)] pointer-events-none" />
            <h2 className="font-black text-5xl md:text-6xl uppercase italic leading-none text-[#F5F8FA] mb-6" style={{ letterSpacing: "-0.02em" }}>
              Yolda bir kez<br />mahsur kalmadan önce.
            </h2>
            <p className="text-[#9DB4C6] mb-12 leading-relaxed max-w-md mx-auto font-normal">
              Ücretsiz kayıt ol. Umarız hiç kullanman gerekmez ama gerekirse hazır olsun.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <a href="/giris" className="w-56 text-center px-6 py-4 bg-[#00D4FF] text-[#0B0F14] rounded-xl font-black text-base hover:bg-[#0099BB] transition hover:-translate-y-0.5 uppercase tracking-wide">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/tulpar-logo-v3.png" alt="" className="h-7 w-7 object-contain inline-block mr-2" style={{ filter: "brightness(0)" }} />
                Hemen Kayıt Ol!
              </a>
              <a href="/firma/kayit" className="w-56 text-center px-6 py-4 rounded-xl font-bold text-base border border-[#5C7386]/50 text-[#9DB4C6] hover:border-[#9DB4C6] hover:text-[#F5F8FA] transition uppercase tracking-wide">
                Tedarikçi Olarak Katıl →
              </a>
            </div>
            <div className="flex gap-3 flex-wrap mt-4 justify-center">
              <a href="#" className="w-56 flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#0B0F14] border border-[#5C7386]/30 hover:border-[#5C7386]/60 transition">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#F5F8FA] flex-shrink-0" xmlns="http://www.w3.org/2000/svg"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div>
                  <div className="text-[#9DB4C6] text-xs leading-none mb-0.5">İndir</div>
                  <div className="text-[#F5F8FA] font-bold text-base leading-none">App Store</div>
                </div>
              </a>
              <a href="#" className="w-56 flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#0B0F14] border border-[#5C7386]/30 hover:border-[#5C7386]/60 transition">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#F5F8FA] flex-shrink-0" xmlns="http://www.w3.org/2000/svg"><path d="M3.18 23.76c.3.17.65.19.97.08l.1-.06 10.59-6.1-2.3-2.3-9.36 8.38zm14.09-8.1L14.96 13l2.31-2.31 3.4 1.93c.97.55.97 1.46 0 2.01l-3.4 1.03zM2.58.27C2.29.55 2.1 1 2.1 1.62v20.74c0 .63.2 1.07.49 1.35l.07.06 11.61-11.6v-.28L2.58.27zm11.2 10.53L4.18 1.27l.1-.06c.32-.11.67-.09.97.08l12.78 7.35-4.25 2.16z"/></svg>
                <div>
                  <div className="text-[#9DB4C6] text-xs leading-none mb-0.5">İndir</div>
                  <div className="text-[#F5F8FA] font-bold text-base leading-none">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#5C7386]/20 py-10 px-6 bg-[#0B0F14]">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tulpar-logo-v3.png" alt="Tulpar" className="h-7 w-auto" />
            <div className="font-black text-lg italic tracking-tight">Tulpar<span className="text-[#00D4FF]">Assist</span></div>
          </div>
          <div className="flex gap-6 text-sm text-[#5C7386] font-semibold">
            <a href="/hakkimizda" className="hover:text-[#9DB4C6] transition">Hakkımızda</a>
            <a href="/gizlilik" className="hover:text-[#9DB4C6] transition">Gizlilik</a>
            <a href="/kullanim-sartlari" className="hover:text-[#9DB4C6] transition">Kullanım Şartları</a>
            <a href="mailto:tunahank@tulparassist.com" className="hover:text-[#9DB4C6] transition">İletişim</a>
          </div>
          <div className="text-sm text-[#5C7386] font-semibold">© 2026 Tulpar Assist</div>
        </div>
      </footer>
    </main>
  );
}

import Link from "next/link";

export const metadata = { title: "Hakkımızda — Tulpar Assist" };

export default function Hakkimizda() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-[#F5F8FA]" style={{ fontFamily: "var(--font-barlow), Arial, sans-serif" }}>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex justify-center mb-14">
          <Link href="/" className="font-black italic tracking-tight flex items-center gap-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tulpar-logo-v3.png" alt="Tulpar" className="w-auto object-contain flex-shrink-0" style={{ height: "clamp(3.5rem, 9vw, 6rem)" }} />
            <span>Tulpar<span className="text-[#00D4FF]">Assist</span></span>
          </Link>
        </div>

        {/* HERO */}
        <div className="mb-16">
          <div className="text-[#00D4FF] text-xs font-black tracking-widest uppercase mb-4">Hakkımızda</div>
          <h1 className="font-black italic uppercase leading-none mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", letterSpacing: "-0.02em" }}>
            Yolu da biliriz,<br />yolda kalmayı da.
          </h1>
          <p className="text-[#9DB4C6] text-lg leading-relaxed max-w-2xl">
            Tulpar Assist, çekici ve yol yardım sektöründe <span className="text-[#F5F8FA] font-bold">20 yılı aşkın saha tecrübesinin</span> üzerine
            kuruldu. Gece yarısı otoyolda çalan telefonları, panik halindeki sürücüleri ve işini hakkıyla yapan
            firmaların emeğini yakından tanıyoruz — çünkü bu işin içinden geliyoruz.
          </p>
        </div>

        {/* HİKAYE */}
        <div className="bg-[#1E2A39] border border-[#5C7386]/30 rounded-3xl p-8 md:p-12 mb-8">
          <h2 className="font-black text-2xl md:text-3xl uppercase italic mb-4" style={{ letterSpacing: "-0.01em" }}>
            Neden Tulpar?
          </h2>
          <div className="text-[#9DB4C6] text-sm md:text-base leading-relaxed space-y-4">
            <p>
              Türk mitolojisinde Tulpar, darda kalana yetişen kanatlı attır. Biz de aynı işi yapıyoruz:
              yolda kalan sürücüyü, ona en hızlı ulaşacak güvenilir ekiple buluşturuyoruz.
            </p>
            <p>
              Yirmi yılı aşkın süredir bu sektörde gördük ki sorun hizmet verecek firma bulunmaması değil —
              <span className="text-[#F5F8FA] font-semibold"> doğru firmaya, doğru fiyatla, güven içinde ulaşamamak.</span> Tulpar
              Assist&apos;i tam olarak bu boşluğu kapatmak için kurduk.
            </p>
          </div>
        </div>

        {/* İKİ TARAF İÇİN ÖZEN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1E2A39] border border-[#00D4FF]/20 rounded-2xl p-8">
            <div className="text-xs font-black tracking-widest uppercase bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 px-3 py-1.5 rounded-full inline-block mb-6">
              Sürücülere Özenimiz
            </div>
            <ul className="space-y-3 text-sm text-[#D6DEE6]">
              {[
                "Fiyatı yola çıkmadan önce görürsünüz — sürpriz yok",
                "Aracınız 3 aşamalı fotoğrafla kayıt altında taşınır",
                "Çekiciyi haritada canlı izlersiniz, kimse sizi bekletemez",
                "Her hizmet sonrası değerlendirmeniz sistemde iz bırakır",
              ].map((m) => (
                <li key={m} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] text-xs flex items-center justify-center font-black flex-shrink-0 mt-0.5">✓</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#1E2A39] border border-[#5C7386]/30 rounded-2xl p-8">
            <div className="text-xs font-black tracking-widest uppercase bg-[#5C7386]/10 text-[#9DB4C6] border border-[#5C7386]/30 px-3 py-1.5 rounded-full inline-block mb-6">
              Tedarikçilere Özenimiz
            </div>
            <ul className="space-y-3 text-sm text-[#D6DEE6]">
              {[
                "Komisyon almayız — kazancınız tamamen sizindir",
                "Fiyatınızı biz değil, siz belirlersiniz",
                "Belgeli ve onaylı firma ağı: emeğiniz korsanla yarışmaz",
                "Fotoğraflı teslim kaydı haksız şikayetlere karşı sizi korur",
              ].map((m) => (
                <li key={m} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#9DB4C6]/10 border border-[#9DB4C6]/30 text-[#9DB4C6] text-xs flex items-center justify-center font-black flex-shrink-0 mt-0.5">✓</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* DEĞERLER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {[
            { baslik: "Saha Tecrübesi", desc: "20+ yıldır bu sektörün mutfağındayız. Masa başından değil, yolun kenarından öğrendik." },
            { baslik: "İki Taraflı Güven", desc: "Sürücü de tedarikçi de korunur. Sistemimizdeki her kayıt iki tarafın da güvencesidir." },
            { baslik: "Dürüst Teknoloji", desc: "Gizli ücret, sahte yorum, şişirilmiş rakam yok. Ne görüyorsanız o." },
          ].map((d) => (
            <div key={d.baslik} className="bg-[#0B0F14] border border-[#5C7386]/20 rounded-2xl p-6 hover:border-[#00D4FF]/20 transition">
              <div className="font-black text-base uppercase tracking-tight text-[#F5F8FA] mb-2">{d.baslik}</div>
              <div className="text-[#9DB4C6] text-sm leading-relaxed">{d.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center border-t border-[#5C7386]/20 pt-12">
          <h2 className="font-black text-3xl uppercase italic mb-6">Yolda buluşalım.</h2>
          <div className="flex gap-4 flex-wrap justify-center">
            <a href="/giris" className="px-8 py-4 bg-[#00D4FF] text-[#0B0F14] rounded-xl font-black text-base hover:bg-[#0099BB] transition uppercase tracking-wide">
              Hemen Kayıt Ol!
            </a>
            <a href="/firma/kayit" className="px-8 py-4 rounded-xl font-bold text-base border border-[#5C7386]/50 text-[#9DB4C6] hover:border-[#9DB4C6] hover:text-[#F5F8FA] transition uppercase tracking-wide">
              Tedarikçi Olarak Katıl →
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#5C7386]/20 flex gap-6 text-sm">
          <Link href="/" className="text-[#5C7386] hover:text-[#9DB4C6] transition">← Ana Sayfa</Link>
          <Link href="/gizlilik" className="text-[#5C7386] hover:text-[#9DB4C6] transition">Gizlilik</Link>
          <Link href="/kullanim-sartlari" className="text-[#5C7386] hover:text-[#9DB4C6] transition">Kullanım Şartları</Link>
        </div>
      </div>
    </main>
  );
}

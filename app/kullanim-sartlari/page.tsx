import Link from "next/link";

export const metadata = { title: "Kullanım Şartları — Tulpar Assist" };

export default function KullanimSartlari() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] px-6 py-16" style={{ fontFamily: "var(--font-barlow), Arial, sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="font-black italic text-2xl tracking-tight inline-flex items-center gap-2 mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tulpar-logo-v3.png" alt="Tulpar" className="h-9 w-auto" />
          <span>Tulpar<span className="text-[var(--accent-text)]">Assist</span></span>
        </Link>

        <h1 className="font-black text-4xl italic uppercase mb-2">Kullanım Şartları</h1>
        <p className="text-[var(--text-3)] text-sm mb-10">Son güncelleme: Temmuz 2026</p>

        <div className="space-y-8 text-[var(--text-2)] text-sm leading-relaxed">
          <section>
            <h2 className="text-[var(--text)] font-black text-lg uppercase mb-2">1. Hizmetin Tanımı</h2>
            <p>Tulpar Assist, yolda kalan sürücüleri çekici, kurtarma, lastik, akü, yakıt ve çilingir hizmeti veren bağımsız tedarikçi firmalarla buluşturan bir <span className="text-[var(--text)] font-semibold">aracı platformdur</span>. Yol yardım hizmetinin kendisi, platforma kayıtlı bağımsız tedarikçiler tarafından verilir.</p>
          </section>

          <section>
            <h2 className="text-[var(--text)] font-black text-lg uppercase mb-2">2. Tarafların Sorumlulukları</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Hizmet bedeli, tedarikçinin verdiği ve sizin onayladığınız fiyat teklifi üzerinden tedarikçiye ödenir; Tulpar Assist ödemeye taraf değildir.</li>
              <li>Hizmetin ifasından (aracın taşınması, hasar, gecikme vb.) hizmeti veren tedarikçi firma sorumludur.</li>
              <li>Kullanıcı, platformda doğru ve güncel bilgi vermekle yükümlüdür.</li>
              <li>Tedarikçi firmalar; yasal yeterlilik belgelerine (K1 yetki belgesi vb.) sahip olduklarını beyan eder.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[var(--text)] font-black text-lg uppercase mb-2">3. Fotoğraflı Teslim Kaydı</h2>
            <p>Hizmet sürecinde şoför tarafından aracın teslim alma, yükleme ve teslim aşamalarında fotoğraf çekilir. Bu kayıtlar iki tarafın da korunması ve olası uyuşmazlıklarda delil sunulması amacıyla saklanır.</p>
          </section>

          <section>
            <h2 className="text-[var(--text)] font-black text-lg uppercase mb-2">4. Hesap ve Kullanım</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Platformu kötüye kullanmak (sahte talep, taciz, yanıltıcı bilgi) hesabın kapatılmasına yol açar.</li>
              <li>Değerlendirme ve yorumlar gerçek deneyime dayanmalıdır.</li>
              <li>Platform, hizmeti geliştirmek amacıyla özelliklerde değişiklik yapma hakkını saklı tutar.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[var(--text)] font-black text-lg uppercase mb-2">5. Sorumluluk Sınırı</h2>
            <p>Tulpar Assist, tedarikçi ile kullanıcı arasındaki hizmet ilişkisinde aracıdır; tedarikçinin verdiği hizmetin kalitesi, süresi ve sonuçlarından doğan zararlardan platform sorumlu tutulamaz. Platform, kesintisiz erişim için makul çabayı gösterir ancak teknik kesintilerden sorumluluk kabul etmez.</p>
          </section>

          <section>
            <h2 className="text-[var(--text)] font-black text-lg uppercase mb-2">6. İletişim</h2>
            <p>Sorularınız için: <a href="mailto:tunahank@tulparassist.com" className="text-[var(--accent-text)]">tunahank@tulparassist.com</a></p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border)] flex gap-6 text-sm">
          <Link href="/" className="text-[var(--text-3)] hover:text-[var(--text-2)] transition">← Ana Sayfa</Link>
          <Link href="/gizlilik" className="text-[var(--accent-text)] font-semibold">Gizlilik Politikası →</Link>
        </div>
      </div>
    </main>
  );
}

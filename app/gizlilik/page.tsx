import Link from "next/link";

export const metadata = { title: "Gizlilik Politikası — Tulpar Assist" };

export default function Gizlilik() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-[#F5F8FA] px-6 py-16" style={{ fontFamily: "var(--font-barlow), Arial, sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="font-black italic text-2xl tracking-tight inline-flex items-center gap-2 mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tulpar-logo-v3.png" alt="Tulpar" className="h-9 w-auto" />
          <span>Tulpar<span className="text-[#00D4FF]">Assist</span></span>
        </Link>

        <h1 className="font-black text-4xl italic uppercase mb-2">Gizlilik Politikası</h1>
        <p className="text-[#5C7386] text-sm mb-10">KVKK Aydınlatma Metni · Son güncelleme: Temmuz 2026</p>

        <div className="space-y-8 text-[#9DB4C6] text-sm leading-relaxed">
          <section>
            <h2 className="text-[#F5F8FA] font-black text-lg uppercase mb-2">1. Veri Sorumlusu</h2>
            <p>Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında, Tulpar Assist platformunu işleten veri sorumlusu tarafından hazırlanmıştır. İletişim: <a href="mailto:tunahank@tulparassist.com" className="text-[#00D4FF]">tunahank@tulparassist.com</a></p>
          </section>

          <section>
            <h2 className="text-[#F5F8FA] font-black text-lg uppercase mb-2">2. Hangi Verileri Topluyoruz?</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="text-[#F5F8FA] font-semibold">Kimlik ve iletişim:</span> ad, soyad, telefon numarası</li>
              <li><span className="text-[#F5F8FA] font-semibold">Araç bilgileri:</span> marka, model, plaka, çekiş türü, yakıt tipi</li>
              <li><span className="text-[#F5F8FA] font-semibold">Konum:</span> yardım talebi sırasında GPS konumunuz (izninizle)</li>
              <li><span className="text-[#F5F8FA] font-semibold">Tedarikçiler için:</span> firma unvanı, vergi bilgileri, banka/IBAN, yasal belgeler (K1Ö, ticaret sicil)</li>
              <li><span className="text-[#F5F8FA] font-semibold">Hizmet kayıtları:</span> talep geçmişi, fotoğraflar, değerlendirmeler</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F5F8FA] font-black text-lg uppercase mb-2">3. Verileri Ne İçin Kullanıyoruz?</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Yol yardım talebinizi size en yakın tedarikçiye iletmek</li>
              <li>Çekici/şoför konumunu size canlı göstermek</li>
              <li>Hizmet kalitesini ölçmek ve uyuşmazlıklarda kayıt sunmak (fotoğraflı teslim)</li>
              <li>Yasal yükümlülüklerimizi yerine getirmek</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F5F8FA] font-black text-lg uppercase mb-2">4. Verileriniz Kimlerle Paylaşılıyor?</h2>
            <p>Yardım talebi oluşturduğunuzda adınız, telefonunuz, konumunuz ve araç bilgileriniz yalnızca <span className="text-[#F5F8FA] font-semibold">talebi karşılayacak tedarikçi firma ve görevli şoför</span> ile paylaşılır. Verileriniz pazarlama amacıyla üçüncü taraflara satılmaz. Altyapı sağlayıcılarımız (barındırma ve veritabanı hizmetleri) verileri yalnızca hizmetin çalışması için işler.</p>
          </section>

          <section>
            <h2 className="text-[#F5F8FA] font-black text-lg uppercase mb-2">5. Verileriniz Ne Kadar Saklanıyor?</h2>
            <p>Hesabınız aktif olduğu sürece ve yasal saklama sürelerince saklanır. Hesabınızın ve verilerinizin silinmesini istediğinizde aşağıdaki iletişim adresinden talepte bulunabilirsiniz.</p>
          </section>

          <section>
            <h2 className="text-[#F5F8FA] font-black text-lg uppercase mb-2">6. KVKK Kapsamındaki Haklarınız</h2>
            <p>KVKK m.11 uyarınca: verilerinize erişme, düzeltilmesini veya silinmesini isteme, işlenmesine itiraz etme ve zararınızın giderilmesini talep etme hakkına sahipsiniz. Talepleriniz için: <a href="mailto:tunahank@tulparassist.com" className="text-[#00D4FF]">tunahank@tulparassist.com</a></p>
          </section>

          <section>
            <h2 className="text-[#F5F8FA] font-black text-lg uppercase mb-2">7. Çerezler</h2>
            <p>Platform, oturumunuzu hatırlamak için tarayıcınızın yerel depolamasını kullanır; üçüncü taraf reklam/izleme çerezi kullanılmaz. Harita hizmeti Google Maps tarafından sağlanır ve Google&apos;ın kendi gizlilik politikasına tabidir.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-[#5C7386]/20 flex gap-6 text-sm">
          <Link href="/" className="text-[#5C7386] hover:text-[#9DB4C6] transition">← Ana Sayfa</Link>
          <Link href="/kullanim-sartlari" className="text-[#00D4FF] font-semibold">Kullanım Şartları →</Link>
        </div>
      </div>
    </main>
  );
}

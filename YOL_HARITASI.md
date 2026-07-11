# TulparAssist — Yol Haritası

Güncelleme: 11 Temmuz 2026

## Mevcut durum

Çalışan bir MVP var: müşteri (harita + SOS talebi + canlı takip + puanlama),
tedarikçi paneli (talep/teklif/araç/şoför yönetimi), şoför paneli (iş akışı +
foto + GPS km sayacı), admin paneli (firma onayı). Web canlıda
(tulparassist.com), Capacitor ile iOS/Android sarmalayıcı hazır.

**Kritik engel:** Supabase projesi silinmiş — veritabanı yok, site fiilen
çalışmıyor. İlk iş: `supabase/KURULUM.md` adımlarıyla yeni proje kurmak.

## Faz 0 — Yeniden ayağa kaldırma (hemen)
- [ ] Yeni Supabase projesi + `supabase/schema.sql` çalıştır
- [ ] `.env.local` ve Vercel env değerlerini güncelle (proje seviyesinde!)
- [ ] `ADMIN_SIFRE` env'ini Vercel'e ekle (yeni bir şifreyle)
- [ ] Redeploy + uçtan uca test (kayıt → talep → teklif → tamamlama)
- [ ] Supabase Pro plan ($25/ay): ücretsiz planda 1 hafta işlem görmeyen
      proje duraklatılır — canlı ürün için kabul edilemez risk

## Faz 1 — Güvenlik temeli (canlı kullanıcı almadan önce ŞART)
- [ ] **Telefon OTP doğrulaması** (Supabase Auth + SMS sağlayıcı, örn. Twilio/Netgsm).
      Şu an herkes başkasının numarasını yazıp onun hesabına girebiliyor.
- [ ] API route'larına yetki kontrolü: talep güncellemeyi yalnızca ilgili
      müşteri/firma/şoför yapabilmeli. Şu an /api/talepler'e herkes istek atabilir.
- [ ] RLS politikalarını daraltma: auth geldikten sonra "herkes okuyabilir"
      politikaları kullanıcı-bazlı politikalarla değiştirilecek.
- [ ] Admin paneli: localStorage bayrağı yerine sunucu taraflı oturum (cookie).
- [ ] `belgeler` bucket'ını private yap: vergi levhası/ticaret sicil gibi evraklar
      şu an public URL ile erişilebilir. İş fotoğrafları için ayrı bucket.
- [ ] Google Maps anahtarına HTTP referrer kısıtı (Google Cloud Console).
- [ ] IBAN/vergi bilgilerini yalnızca sahibi ve admin görebilsin.

## Faz 2 — Sağlamlaştırma
- [ ] Polling (10 sn'de bir sorgu) yerine Supabase Realtime aboneliği
- [ ] Push bildirimleri (Capacitor + FCM/APNs) — teklif geldi, şoför yolda vb.
- [ ] Foto yükleme sıkıştırma (mobil veri) + yükleme hatalarında tekrar deneme
- [ ] Hata izleme (Sentry) + Vercel Analytics
- [ ] `firma/kayit` SolPanel ve `sofor/panel` FotoBlok bileşenlerinin render
      içinde tanımlanması düzeltilecek (input focus kaybı riski)
- [ ] Panellerdeki tekrarlanan tip tanımları ve harita stili `lib/`e taşınacak
- [ ] Temel e2e test akışı (Playwright): kayıt → talep → teklif → tamamlama

## Faz 3 — Ürünleşme
- [ ] Gerçek istatistikler (ana sayfadaki 1.200+ firma / 4.8★ şu an placeholder —
      canlıya çıkmadan gerçek değerlerle değiştir veya kaldır, güven sorunu yaratır)
- [ ] Ödeme altyapısı kararı: komisyon mu abonelik mi? (iyzico/PayTR entegrasyonu)
- [ ] Tedarikçi abonelik yönetimi + faturalama
- [ ] KVKK: aydınlatma metni, açık rıza, gizlilik politikası, kullanım şartları
      (footer'daki linkler şu an boş "#")
- [ ] App Store / Google Play yayını (Codemagic pipeline hazır)
- [ ] Kurumsal müşteri (sigorta/garanti şirketi) tarife sistemi

## Faz 4 — Büyüme
- [ ] Tedarikçi puanı/rozet sistemi, sıralama algoritması
- [ ] Bölge bazlı talep havuzu (firma seçilmezse yakındaki tüm firmalara düşsün)
- [ ] Fiyat pazarlığı / çoklu teklif karşılaştırma
- [ ] Operasyon paneli: canlı harita üzerinde tüm aktif işler
- [ ] Muhasebe raporları, aylık tedarikçi hakediş özetleri

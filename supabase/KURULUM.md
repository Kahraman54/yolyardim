# Supabase Yeniden Kurulum Rehberi

Eski Supabase projesi (`dhwhnwkczsrflejvpmhf.supabase.co`) artık DNS'te yok —
silinmiş veya kalıcı olarak kaldırılmış. Site bu yüzden çalışmıyor (giriş,
kayıt, tüm API'ler). Eski verileri Supabase panelinden geri alma şansı yoksa
sıfırdan kurulum gerekiyor:

## 1. Yeni proje aç
1. https://supabase.com/dashboard → **New project**
2. İsim: `tulparassist`, bölge: **Frankfurt (eu-central-1)** (Türkiye'ye en yakın)
3. Güçlü bir database şifresi belirle ve sakla.

## 2. Şemayı kur
1. Sol menü → **SQL Editor** → **New query**
2. `supabase/schema.sql` dosyasının tamamını yapıştır → **Run**
3. "Success" görmelisin. Tablolar, indeksler, RLS politikaları ve
   `belgeler` storage bucket'ı otomatik kurulur.

## 3. API anahtarlarını al
**Project Settings → API** sayfasından üç değer:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key (gizli!) → `SUPABASE_SERVICE_ROLE_KEY`

## 4. Env değerlerini güncelle
**Lokal:** `.env.local` içindeki üç değeri yenileriyle değiştir.

**Vercel:** Proje (yolyardim) → **Settings → Environment Variables**:
- Üç değişkeni de **proje seviyesinde** ekle/güncelle
  (takım seviyesi "Shared" değişken projeye bağlanmadıysa fonksiyonlara ulaşmaz —
  önceki 500 hatalarının bir nedeni de buydu).
- `ADMIN_SIFRE` değişkenini de ekle (admin paneli girişi artık bunu kullanıyor).
  Eski şifre git geçmişinde göründüğü için YENİ bir şifre belirle.
- Kaydettikten sonra **Deployments → son deployment → ⋯ → Redeploy**.

## 5. Doğrula
- `https://www.tulparassist.com/api/talepler` → `[]` dönmeli (500 değil)
- Ana sayfadan müşteri girişi → telefonla kayıt olmalı
- `/firma/kayit` → tedarikçi başvurusu + belge yüklemesi çalışmalı

## Notlar
- Ücretsiz plandaki projeler 1 hafta işlem görmeyince duraklatılır,
  90 gün duraklatılmış kalırsa silinebilir. Canlıya çıkmadan önce
  **Pro plana geçmek** ($25/ay) bu riski tamamen kaldırır.
- `schema.sql` içindeki RLS politikaları şu anki uygulamayla birebir uyumlu
  ama gevşektir (anon okuma/yazma). Telefon OTP doğrulaması eklendiğinde
  daraltılmalı — yol haritasında Faz 1.

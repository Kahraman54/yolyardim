-- ============================================================
-- TulparAssist — Supabase şeması (koddan türetildi)
-- Yeni bir Supabase projesinde: SQL Editor > New query > tümünü yapıştır > Run
-- ============================================================

-- ---------- TABLOLAR ----------

create table if not exists musteriler (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tel text not null,
  ad text,
  soyad text,
  arac_marka text,
  arac_model text,
  arac_plaka text,
  cekis_turu text,
  yakit_tipi text
);
create index if not exists musteriler_tel_idx on musteriler (tel);

create table if not exists firmalar (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  firma_ad text not null,
  sahip_ad text,
  sahip_soyad text,
  tel text not null,
  email text,
  vergi_no text,
  vergi_dairesi text,
  il text,
  ilce text,
  adres text,
  hizmet_bolgesi text,
  hizmet_tipi text,              -- 'cekici' | 'lastikci' | 'her_ikisi'
  durum text not null default 'bekliyor',  -- 'bekliyor' | 'aktif' | 'reddedildi'
  banka text,
  iban text,
  lat double precision,
  lng double precision,
  k1o_url text,
  ticaret_sicil_url text
);
create index if not exists firmalar_tel_idx on firmalar (tel);
create index if not exists firmalar_durum_idx on firmalar (durum);

create table if not exists soforler (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  firma_id uuid references firmalar(id) on delete cascade,
  ad text not null,
  soyad text,
  tel text
);
create index if not exists soforler_firma_idx on soforler (firma_id);
create index if not exists soforler_tel_idx on soforler (tel);

create table if not exists araclar (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  firma_id uuid references firmalar(id) on delete cascade,
  plaka text not null,
  tur text,                      -- örn: 'cekici', 'kurtarici'
  marka text,
  model text,
  model_yili text,
  arac_turu text
);
create index if not exists araclar_firma_idx on araclar (firma_id);

create table if not exists talepler (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  musteri_id uuid references musteriler(id) on delete set null,
  musteri_ad text,
  musteri_tel text,
  arac_plaka text,
  firma_id uuid references firmalar(id) on delete set null,
  atanan_sofor uuid references soforler(id) on delete set null,
  atanan_arac uuid references araclar(id) on delete set null,
  tip text not null,             -- 'Çekici' | 'Kurtarma' | 'Lastik' | 'Akü' | 'Yakıt' | 'Çilingir'
  durum text not null default 'yeni',  -- 'yeni' | 'teklif' | 'kabul' | 'yolda' | 'tamamlandi' | 'reddedildi'
  is_adim text,                  -- 'yolda' | 'yukleniyor' | 'teslimat_yolunda' | 'teslimatta' | 'tutanak' | 'tamamlandi'
  hedef_adres text,
  aciklama text,
  konum_lat double precision,
  konum_lng double precision,
  konum_adres text,
  baslangic_lat double precision,
  baslangic_lng double precision,
  sofor_konum_lat double precision,
  sofor_konum_lng double precision,
  sofor_konum_updated_at timestamptz,
  fiyat_teklifi numeric,
  musteri_puani smallint,
  musteri_yorumu text,
  toplam_km numeric,
  ise_baslama_zamani timestamptz,
  ise_bitis_zamani timestamptz,
  foto_teslim_alma text[],
  foto_yukleme text[],
  foto_teslim text[],
  foto_tutanak text[]
);
create index if not exists talepler_musteri_idx on talepler (musteri_id);
create index if not exists talepler_firma_idx on talepler (firma_id);
create index if not exists talepler_sofor_idx on talepler (atanan_sofor);
create index if not exists talepler_durum_idx on talepler (durum);

-- ---------- RLS ----------
-- NOT: Uygulama şu an anon key ile client'tan okuyup yazıyor.
-- Bu politikalar mevcut uygulamayı birebir çalıştırır; anon DELETE engellenir
-- (silmeler API route'larındaki service role üzerinden yapılır, RLS'i baypas eder).
-- Gerçek auth (OTP) eklendiğinde bu politikalar daraltılmalı — bkz. supabase/KURULUM.md

alter table musteriler enable row level security;
alter table firmalar   enable row level security;
alter table soforler   enable row level security;
alter table araclar    enable row level security;
alter table talepler   enable row level security;

create policy "anon read musteriler"   on musteriler for select using (true);
create policy "anon insert musteriler" on musteriler for insert with check (true);
create policy "anon update musteriler" on musteriler for update using (true);

create policy "anon read firmalar"   on firmalar for select using (true);
create policy "anon insert firmalar" on firmalar for insert with check (true);
create policy "anon update firmalar" on firmalar for update using (true);

create policy "anon read soforler"   on soforler for select using (true);
create policy "anon insert soforler" on soforler for insert with check (true);

create policy "anon read araclar"   on araclar for select using (true);
create policy "anon insert araclar" on araclar for insert with check (true);

create policy "anon read talepler"   on talepler for select using (true);

-- ---------- STORAGE ----------
-- 'belgeler' bucket'ı: firma evrakları (K1Ö, ticaret sicil) + iş fotoğrafları.
-- Şoför paneli getPublicUrl kullandığı için bucket public olmalı.

insert into storage.buckets (id, name, public)
values ('belgeler', 'belgeler', true)
on conflict (id) do nothing;

create policy "anon upload belgeler" on storage.objects
  for insert with check (bucket_id = 'belgeler');
create policy "anon update belgeler" on storage.objects
  for update using (bucket_id = 'belgeler');
create policy "anon read belgeler" on storage.objects
  for select using (bucket_id = 'belgeler');

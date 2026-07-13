"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminGiris() {
  const router = useRouter();
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function giris() {
    setYukleniyor(true);
    try {
      const res = await fetch("/api/admin-giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre }),
      });
      if (res.ok) {
        localStorage.setItem("admin", "1");
        router.push("/admin/panel");
      } else {
        setHata(true);
      }
    } catch {
      setHata(true);
    }
    setYukleniyor(false);
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-black italic tracking-tight mb-6 flex items-center gap-4" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tulpar-logo-v3.png" alt="" className="w-auto object-contain flex-shrink-0" style={{ height: "clamp(4rem, 12vw, 6rem)" }} />
          <span>Tulpar<span className="text-[var(--accent-text)]">Assist</span></span>
        </Link>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7">
          <h1 className="font-black text-xl mb-1">Admin Paneli Girişi</h1>
          <p className="text-[var(--text-3)] text-sm mb-6">Yönetici şifrenle giriş yap.</p>

          {hata && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4">
              ⚠️ Şifre hatalı.
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[var(--text-2)] mb-2">Şifre *</label>
            <input
              type="password"
              value={sifre}
              onChange={e => { setSifre(e.target.value); setHata(false); }}
              onKeyDown={e => e.key === "Enter" && giris()}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={giris}
            disabled={!sifre || yukleniyor}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[#0B0F14] font-bold py-3 rounded-xl transition text-sm"
          >
            {yukleniyor ? "Kontrol ediliyor..." : "Giriş Yap →"}
          </button>

          <div className="text-center mt-4">
            <Link href="/" className="text-xs text-[var(--text-3)] hover:text-[var(--text)] transition">← Ana sayfaya dön</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

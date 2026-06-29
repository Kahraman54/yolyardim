"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_SIFRE = "356890Tuna";

export default function AdminGiris() {
  const router = useRouter();
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState(false);

  function giris() {
    if (sifre === ADMIN_SIFRE) {
      localStorage.setItem("admin", "1");
      router.push("/admin/panel");
    } else {
      setHata(true);
    }
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-5">
      <div className="w-full max-w-xs">
        <div className="font-black text-xl mb-8">
          Tulpar<span className="text-[#00D4FF]"> Assist</span>
          <div className="text-[10px] text-gray-500 font-normal mt-0.5 tracking-widest uppercase">Admin Paneli</div>
        </div>
        <h1 className="font-black text-2xl mb-6">Giriş</h1>
        {hata && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4">
            ⚠️ Şifre hatalı.
          </div>
        )}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-400 mb-2">Şifre</label>
          <input
            type="password"
            value={sifre}
            onChange={e => { setSifre(e.target.value); setHata(false); }}
            onKeyDown={e => e.key === "Enter" && giris()}
            className="w-full bg-[#1A1A1A] border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00D4FF] transition"
            placeholder="••••••••"
          />
        </div>
        <button
          onClick={giris}
          className="w-full bg-[#00D4FF] hover:bg-[#0099BB] text-[#0B0F14] font-bold py-3 rounded-xl transition text-sm"
        >
          Giriş Yap →
        </button>
      </div>
    </main>
  );
}

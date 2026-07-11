"use client";
import { useState } from "react";
import Link from "next/link";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/firma/kayit", label: "Tedarikçimiz Ol" },
    { href: "/firma/giris", label: "Tedarikçi Paneli" },
    { href: "/sofor", label: "Şoför Paneli" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-trans)] backdrop-blur-md border-b border-[var(--border)]">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tulpar-logo-v3.png" alt="Tulpar" className="h-11 w-auto" />
          <div className="font-black text-2xl italic tracking-tight">
            Tulpar<span className="text-[var(--accent-text)]">Assist</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-2">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[var(--text-2)] border border-[var(--border-2)] hover:border-[var(--text-3)] hover:text-[var(--text)] transition tracking-wide">
              {l.label}
            </a>
          ))}
          <a href="/giris" className="px-5 py-2.5 rounded-lg bg-[#00D4FF] text-[#0B0F14] text-sm font-bold hover:bg-[#0099BB] transition tracking-wide">
            Giriş Yap
          </a>
        </div>

        {/* Mobile: Giriş + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <a href="/giris" className="px-4 py-2 rounded-lg bg-[#00D4FF] text-[#0B0F14] text-sm font-bold">
            Giriş
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg border border-[var(--border-2)] text-[var(--text-2)] hover:border-[var(--text-3)] transition"
            aria-label="Menü"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] px-6 py-4 flex flex-col gap-2 bg-[var(--bg-trans)]">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-lg text-sm font-semibold text-[var(--text-2)] border border-[var(--border-2)] hover:border-[var(--text-3)] hover:text-[var(--text)] transition"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

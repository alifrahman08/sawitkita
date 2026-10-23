import React from "react";
import Link from "next/link";
import { Trees, Phone, Mail, MapPin, Shield } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#2d6a4f] to-[#40916c] flex items-center justify-center text-white">
                <Trees className="w-6 h-6 text-emerald-300" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Sawit<span className="text-[#d4a373]">Kita</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Kelola Panen, Transparansi Pembayaran, Koperasi Lebih Maju." Platform manajemen modern untuk koperasi produsen kelapa sawit di Indonesia.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>Sistem Terverifikasi & Audit Trail</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Menu Utama</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="#beranda" className="hover:text-emerald-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="#fitur" className="hover:text-emerald-400 transition-colors">
                  Fitur Unggulan
                </Link>
              </li>
              <li>
                <Link href="#cara-kerja" className="hover:text-emerald-400 transition-colors">
                  Alur & Cara Kerja
                </Link>
              </li>
              <li>
                <Link href="#manfaat" className="hover:text-emerald-400 transition-colors">
                  Manfaat Petani & Pengurus
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-emerald-400 transition-colors">
                  Tanya Jawab (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Portal Akses */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Akses Aplikasi</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Masuk Portal Pengurus
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Masuk Portal Petani Mandiri
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-400 transition-colors">
                  Pendaftaran Anggota Baru
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Sekretariat Koperasi</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Jl. Raya Pekanbaru - Bangkinang Km. 24, Kab. Kampar, Riau 28461</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>0761-884210 / 0812-7000-8990</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>kontak@sawitmakmur.co.id</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2026 SawitKita. Seluruh hak cipta dilindungi undang-undang.</p>
        </div>
      </div>
    </footer>
  );
}

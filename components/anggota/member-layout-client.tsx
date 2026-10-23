"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Trees,
  LayoutDashboard,
  MapPin,
  Scale,
  CreditCard,
  PiggyBank,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberLayoutClientProps {
  children: React.ReactNode;
  initialUser: {
    id: string;
    email: string;
    name: string;
    role: string;
    memberId?: string | null;
  };
}

export function MemberLayoutClient({ children, initialUser }: MemberLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const navItems = [
    {
      label: "Dashboard Petani",
      href: "/anggota/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Kebun Saya",
      href: "/anggota/kebun",
      icon: MapPin,
    },
    {
      label: "Riwayat Timbang",
      href: "/anggota/transaksi",
      icon: Scale,
    },
    {
      label: "Pembayaran Diterima",
      href: "/anggota/pembayaran",
      icon: CreditCard,
    },
    {
      label: "Buku Simpanan",
      href: "/anggota/simpanan",
      icon: PiggyBank,
    },
    {
      label: "Pengumuman Koperasi",
      href: "/anggota/pengumuman",
      icon: Bell,
    },
    {
      label: "Profil Saya",
      href: "/anggota/profil",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#1b4332] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm print:hidden">
        <Link href="/anggota/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/80 flex items-center justify-center">
            <Trees className="w-5 h-5 text-emerald-200" />
          </div>
          <span className="font-bold text-base tracking-tight">Portal Petani</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-emerald-200 hover:bg-emerald-800"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#1b4332] text-slate-100 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto print:hidden shadow-xl md:shadow-none",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-5 border-b border-emerald-800/80 flex items-center justify-between">
          <Link href="/anggota/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-[#2d6a4f] flex items-center justify-center text-white shadow-xs">
              <Trees className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                Sawit<span className="text-[#d4a373]">Kita</span>
              </span>
              <p className="text-[10px] text-emerald-300 font-medium -mt-1">
                Portal Petani Mandiri
              </p>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-emerald-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#2d6a4f] text-white font-semibold shadow-2xs"
                    : "text-emerald-100 hover:bg-emerald-800/60 hover:text-white"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#d4a373]" : "text-emerald-300")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-800/80 bg-emerald-950/40">
          <div className="flex items-center gap-2.5 mb-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initialUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{initialUser.name}</p>
              <span className="text-[10px] text-emerald-300 font-medium block">
                Petani Anggota Koperasi
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-900/80 hover:bg-red-800/80 text-xs font-medium text-emerald-200 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-30 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Portal Mandiri Petani</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800">Sawit Makmur Bersama</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-800">{initialUser.name}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#1b4332]">
              Anggota Petani
            </span>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

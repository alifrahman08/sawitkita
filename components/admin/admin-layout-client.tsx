"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Trees,
  LayoutDashboard,
  Users,
  MapPin,
  TrendingUp,
  Scale,
  CreditCard,
  PiggyBank,
  FileBarChart2,
  Bell,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  initialUser: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function AdminLayoutClient({ children, initialUser }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePrice, setActivePrice] = useState<number | null>(null);

  useEffect(() => {
    // Fetch active price for header ticker
    fetch("/api/prices")
      .then((res) => res.json())
      .then((data) => {
        if (data.currentActive) {
          setActivePrice(Number(data.currentActive.pricePerKg));
        }
      })
      .catch(() => {});
  }, []);

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
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Data Anggota",
      href: "/admin/anggota",
      icon: Users,
    },
    {
      label: "Data Kebun",
      href: "/admin/kebun",
      icon: MapPin,
    },
    {
      label: "Harga TBS",
      href: "/admin/harga-tbs",
      icon: TrendingUp,
    },
    {
      label: "Timbang TBS",
      href: "/admin/transaksi",
      icon: Scale,
    },
    {
      label: "Pembayaran Petani",
      href: "/admin/pembayaran",
      icon: CreditCard,
    },
    {
      label: "Simpanan Anggota",
      href: "/admin/simpanan",
      icon: PiggyBank,
    },
    {
      label: "Laporan & Rekap",
      href: "/admin/laporan",
      icon: FileBarChart2,
    },
    {
      label: "Pengumuman",
      href: "/admin/pengumuman",
      icon: Bell,
    },
    {
      label: "Audit Log",
      href: "/admin/audit-log",
      icon: History,
      superAdminOnly: true,
    },
    {
      label: "Pengaturan Koperasi",
      href: "/admin/pengaturan",
      icon: Settings,
      superAdminOnly: true,
    },
  ];

  const filteredNav = navItems.filter((item) => {
    if (item.superAdminOnly && initialUser.role !== "SUPER_ADMIN") {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#1b4332] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm print:hidden">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/80 flex items-center justify-center">
            <Trees className="w-5 h-5 text-emerald-200" />
          </div>
          <span className="font-bold text-base tracking-tight">SawitKita</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-emerald-200 hover:bg-emerald-800"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#1b4332] text-slate-100 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto print:hidden shadow-xl md:shadow-none",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Area */}
        <div className="p-5 border-b border-emerald-800/80 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-[#2d6a4f] flex items-center justify-center text-white shadow-xs">
              <Trees className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                Sawit<span className="text-[#d4a373]">Kita</span>
              </span>
              <p className="text-[10px] text-emerald-300 font-medium -mt-1">
                Portal Manajemen
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

        {/* Active TBS Price Ticker */}
        {activePrice && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-emerald-900/60 border border-emerald-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-emerald-300 block">
                Harga TBS Aktif
              </span>
              <span className="text-sm font-bold text-white">
                Rp {activePrice.toLocaleString("id-ID")}
                <span className="text-[10px] text-emerald-300 font-normal"> / kg</span>
              </span>
            </div>
            <Link
              href="/admin/harga-tbs"
              className="text-[11px] text-[#d4a373] hover:underline font-semibold"
            >
              Ubah
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
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

        {/* User Card & Logout */}
        <div className="p-4 border-t border-emerald-800/80 bg-emerald-950/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {initialUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{initialUser.name}</p>
                <span className="text-[10px] text-emerald-300 font-medium block truncate">
                  {initialUser.role === "SUPER_ADMIN" ? "Super Admin" : "Pengurus Koperasi"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-900/80 hover:bg-red-800/80 text-xs font-medium text-emerald-200 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar for Desktop */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-30 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Koperasi Produsen</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-800">
              Sawit Makmur Bersama (KPS-MB)
            </span>
          </div>

          <div className="flex items-center gap-4">
            {activePrice && (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-600 font-medium">Harga TBS:</span>
                <span className="font-bold text-[#1b4332]">
                  Rp {activePrice.toLocaleString("id-ID")} / kg
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
              <span className="font-semibold text-slate-800">{initialUser.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#1b4332]">
                {initialUser.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page Children */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

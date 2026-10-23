"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trees, Menu, X, ArrowRight, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#1b4332] to-[#2d6a4f] flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
              <Trees className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#1b4332]">
                Sawit<span className="text-[#d4a373]">Kita</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">
                Sistem Manajemen Koperasi Sawit
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#beranda"
              className="text-sm font-medium text-slate-700 hover:text-[#1b4332] transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="#fitur"
              className="text-sm font-medium text-slate-700 hover:text-[#1b4332] transition-colors"
            >
              Fitur Utama
            </Link>
            <Link
              href="#cara-kerja"
              className="text-sm font-medium text-slate-700 hover:text-[#1b4332] transition-colors"
            >
              Cara Kerja
            </Link>
            <Link
              href="#manfaat"
              className="text-sm font-medium text-slate-700 hover:text-[#1b4332] transition-colors"
            >
              Manfaat
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-slate-700 hover:text-[#1b4332] transition-colors"
            >
              FAQ
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm" className="font-semibold gap-1.5">
                <User className="w-4 h-4 text-slate-500" />
                Masuk Sistem
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="gap-1.5">
                Daftar Petani
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Buka menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            href="#beranda"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Beranda
          </Link>
          <Link
            href="#fitur"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Fitur Utama
          </Link>
          <Link
            href="#cara-kerja"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Cara Kerja
          </Link>
          <Link
            href="#manfaat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Manfaat
          </Link>
          <Link
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            FAQ
          </Link>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                Masuk Sistem
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full justify-center">
                Daftar Petani Baru
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

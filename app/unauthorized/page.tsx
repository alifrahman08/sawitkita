import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900">Akses Ditolak</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Anda tidak memiliki hak akses (kewenangan peran) untuk membuka halaman ini. Silakan kembali ke dashboard yang sesuai dengan peran akun Anda.
        </p>

        <div className="pt-4 flex flex-col gap-2">
          <Link href="/login">
            <Button variant="primary" className="w-full">
              Masuk dengan Akun Lain
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

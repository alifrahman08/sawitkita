"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trees, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
        setIsLoading(false);
        return;
      }

      router.push(data.redirectUrl || "/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMessage("Terjadi gangguan koneksi ke server. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#1b4332] to-[#2d6a4f] flex items-center justify-center text-white shadow-md">
            <Trees className="w-7 h-7 text-emerald-300" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#1b4332]">
            Sawit<span className="text-[#d4a373]">Kita</span>
          </span>
        </Link>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
          Masuk ke Akun Koperasi
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Kelola operasional dan pantau transaksi kelapa sawit Anda
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-lg border-slate-200">
          <CardContent className="pt-6">
            {errorMessage && (
              <div className="mb-4">
                <Alert type="error" message={errorMessage} />
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Alamat Email"
                type="email"
                required
                placeholder="nama@sawitkita.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Kata Sandi"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                type="submit"
                className="w-full font-semibold mt-2"
                size="lg"
                isLoading={isLoading}
              >
                Masuk ke Sistem
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2.5 text-center">
                Pilih Akun Demo Cepat
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fillDemoAccount("superadmin@sawitkita.id", "Admin123!")}
                  className="p-2 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 text-left transition-colors"
                >
                  <span className="font-bold block text-emerald-800">Super Admin</span>
                  <span className="text-[10px] text-slate-500 block truncate">superadmin@</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount("pengurus@sawitkita.id", "Pengurus123!")}
                  className="p-2 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 text-left transition-colors"
                >
                  <span className="font-bold block text-emerald-800">Pengurus</span>
                  <span className="text-[10px] text-slate-500 block truncate">pengurus@</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount("budi@petani.id", "Petani123!")}
                  className="p-2 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 text-left transition-colors"
                >
                  <span className="font-bold block text-emerald-800">Petani</span>
                  <span className="text-[10px] text-slate-500 block truncate">budi@petani</span>
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-center text-xs text-slate-500 border-t border-slate-100 py-3">
            Belum terdaftar sebagai anggota?{" "}
            <Link href="/register" className="ml-1 text-[#1b4332] font-semibold hover:underline">
              Daftar Petani Baru
            </Link>
          </CardFooter>
        </Card>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800">
            ← Kembali ke Beranda Utama
          </Link>
        </div>
      </div>
    </div>
  );
}

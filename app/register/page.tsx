"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trees, ArrowRight, UserPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nik: "",
    address: "",
    password: "",
    bankName: "BRI",
    bankAccount: "",
    bankHolder: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Pendaftaran gagal. Periksa kembali formulir Anda.");
        setIsLoading(false);
        return;
      }

      router.push(data.redirectUrl || "/anggota/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMessage("Terjadi gangguan koneksi ke server. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#1b4332] to-[#2d6a4f] flex items-center justify-center text-white shadow-md">
            <Trees className="w-7 h-7 text-emerald-300" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#1b4332]">
            Sawit<span className="text-[#d4a373]">Kita</span>
          </span>
        </Link>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
          Pendaftaran Anggota Petani Sawit
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Daftarkan diri Anda untuk memantau hasil timbang, pencairan TBS, dan tabungan koperasi
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <Card className="shadow-lg border-slate-200">
          <CardContent className="pt-6">
            {errorMessage && (
              <div className="mb-4">
                <Alert type="error" message={errorMessage} />
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nama Lengkap Petani"
                  name="fullName"
                  required
                  placeholder="cth: Budi Santoso"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <Input
                  label="Nomor KTP / NIK (16 digit)"
                  name="nik"
                  required
                  placeholder="140102XXXXXXXXXX"
                  maxLength={16}
                  value={formData.nik}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Alamat Email"
                  name="email"
                  type="email"
                  required
                  placeholder="budi@petani.id"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Input
                  label="Nomor Telepon / WhatsApp"
                  name="phone"
                  required
                  placeholder="0812XXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <Textarea
                label="Alamat Tempat Tinggal Lengkap"
                name="address"
                required
                rows={2}
                placeholder="Dusun, RT/RW, Desa, Kecamatan, Kabupaten"
                value={formData.address}
                onChange={handleChange}
              />

              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Informasi Rekening Bank Pencairan Hasil Panen (Opsional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Nama Bank"
                    name="bankName"
                    placeholder="BRI / Mandiri / BNI"
                    value={formData.bankName}
                    onChange={handleChange}
                  />
                  <Input
                    label="Nomor Rekening"
                    name="bankAccount"
                    placeholder="0123-XXXX-XXXX"
                    value={formData.bankAccount}
                    onChange={handleChange}
                  />
                  <Input
                    label="Nama Pemilik Rekening"
                    name="bankHolder"
                    placeholder="Nama sesuai buku tabungan"
                    value={formData.bankHolder}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Input
                  label="Buat Kata Sandi Akun"
                  name="password"
                  type="password"
                  required
                  helperText="Minimal 6 karakter untuk masuk ke portal anggota"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full font-semibold mt-4"
                size="lg"
                isLoading={isLoading}
              >
                Daftar Sebagai Anggota
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-xs text-slate-500 border-t border-slate-100 py-3">
            Sudah memiliki akun anggota?{" "}
            <Link href="/login" className="ml-1 text-[#1b4332] font-semibold hover:underline">
              Masuk di sini
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

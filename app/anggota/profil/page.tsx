"use client";

import React, { useState, useEffect } from "react";
import { User, CreditCard, Save, CheckCircle, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { formatDateIndo } from "@/lib/utils";

export default function MemberProfilPage() {
  const [profile, setProfile] = useState<any>(null);
  const [bankData, setBankData] = useState({
    bankName: "",
    bankAccount: "",
    bankHolder: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/members")
      .then((r) => r.json())
      .then((d) => {
        const item = d.items?.[0];
        if (item) {
          setProfile(item);
          setBankData({
            bankName: item.bankName || "BRI",
            bankAccount: item.bankAccount || "",
            bankHolder: item.bankHolder || item.fullName,
            phone: item.phone || "",
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/members/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankData),
      });

      if (!res.ok) {
        setFeedback({ type: "error", message: "Gagal memperbarui informasi profil." });
        setIsSaving(false);
        return;
      }

      setFeedback({
        type: "success",
        message: "Informasi rekening bank dan kontak Anda berhasil diperbarui!",
      });
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan koneksi." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return <div className="p-8 text-center text-slate-400">Memuat data profil Anda...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil & Rekening Saya</h1>
        <p className="text-xs text-slate-500 mt-1">
          Periksa data keanggotaan dan pastikan nomor rekening bank pencairan Anda akurat
        </p>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} className="mb-4" />}

      {/* Member Identity Card */}
      <Card>
        <CardHeader className="py-4 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-[#1b4332]" />
            Identitas Keanggotaan Koperasi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block text-xs">Nomor Anggota</span>
              <span className="font-mono font-bold text-base text-[#1b4332]">
                {profile.memberNo}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Nomor KTP / NIK</span>
              <span className="font-semibold text-slate-800">{profile.nik || "-"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Nama Lengkap</span>
              <span className="font-semibold text-slate-900">{profile.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Tanggal Bergabung</span>
              <span className="text-slate-700">{formatDateIndo(profile.joinDate)}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block text-xs">Alamat Domisili</span>
              <span className="text-slate-700">{profile.address}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Settings */}
      <Card>
        <CardHeader className="py-4 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#1b4332]" />
            Rekening Bank Pencairan Hasil TBS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Bank"
                required
                placeholder="cth: BRI / Bank Mandiri / BNI"
                value={bankData.bankName}
                onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
              />

              <Input
                label="Nomor Rekening"
                required
                placeholder="cth: 0123-01-XXXXXX-XX"
                value={bankData.bankAccount}
                onChange={(e) => setBankData({ ...bankData, bankAccount: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Pemilik Rekening"
                required
                placeholder="Nama sesuai buku tabungan"
                value={bankData.bankHolder}
                onChange={(e) => setBankData({ ...bankData, bankHolder: e.target.value })}
              />

              <Input
                label="Nomor Telepon / WhatsApp"
                required
                value={bankData.phone}
                onChange={(e) => setBankData({ ...bankData, phone: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isSaving} className="gap-2">
                <Save className="w-4 h-4" />
                Simpan Perubahan Rekening
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle, Building2, Scale, PiggyBank, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export default function PengaturanPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    cooperativeName: "Koperasi Produsen Sawit Makmur Bersama",
    cooperativeCode: "KPS-MB-RIAU",
    phone: "0761-884210",
    email: "kontak@sawitmakmur.co.id",
    address: "Jl. Raya Pekanbaru - Bangkinang Km. 24, Kab. Kampar, Riau 28461",
    bankInfo: "Bank BRI: 0123-01-000888-30-5 a.n Koperasi Sawit Makmur Bersama",
    standardDeductionPercent: "3.0",
    principalSavingsAmount: "500000",
    mandatorySavingsAmount: "100000",
    publicRegistrationEnabled: "true",
    ticketFooterNote: "Tiket timbang resmi. Harap disimpan sebagai bukti transaksi sah.",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settingsMap) {
          setSettings((prev) => ({ ...prev, ...d.settingsMap }));
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        setFeedback({ type: "error", message: "Gagal menyimpan pengaturan koperasi." });
        setIsSaving(false);
        return;
      }

      setFeedback({
        type: "success",
        message: "Pengaturan koperasi berhasil diperbarui dan tersimpan di database!",
      });
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan koneksi." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Memuat konfigurasi sistem...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#1b4332]" />
            Pengaturan Sistem Koperasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi identitas lembaga, aturan simpanan, standar potongan timbang, dan profil cetak
          </p>
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} className="mb-4" />}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identitas Koperasi */}
        <Card>
          <CardHeader className="py-4 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1b4332]" />
              1. Identitas Resmi Badan Hukum Koperasi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Resmi Koperasi"
                name="cooperativeName"
                required
                value={settings.cooperativeName}
                onChange={handleChange}
              />
              <Input
                label="Kode / Nomor Badan Hukum"
                name="cooperativeCode"
                required
                value={settings.cooperativeCode}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nomor Telepon / Layanan WhatsApp"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
              />
              <Input
                label="Alamat Email Koperasi"
                name="email"
                type="email"
                value={settings.email}
                onChange={handleChange}
              />
            </div>

            <Textarea
              label="Alamat Sekretariat & Lokasi Jembatan Timbang"
              name="address"
              rows={2}
              value={settings.address}
              onChange={handleChange}
            />

            <Input
              label="Informasi Rekening Resmi Koperasi (Untuk Cetak Kuitansi)"
              name="bankInfo"
              value={settings.bankInfo}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* Kebijakan Penimbangan & Potongan */}
        <Card>
          <CardHeader className="py-4 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#1b4332]" />
              2. Standar Penimbangan & Tiket Timbang
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Standar Potongan Fraksi TBS (%)"
                name="standardDeductionPercent"
                type="number"
                step="0.1"
                value={settings.standardDeductionPercent}
                onChange={handleChange}
                helperText="Nilai default saat membuka formulir timbang baru"
              />
            </div>

            <Textarea
              label="Catatan Kaki Tiket Timbang (Footer Note)"
              name="ticketFooterNote"
              rows={2}
              value={settings.ticketFooterNote}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* Kebijakan Simpanan Anggota */}
        <Card>
          <CardHeader className="py-4 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-[#1b4332]" />
              3. Aturan Simpanan Koperasi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Besaran Simpanan Pokok (Rp)"
                name="principalSavingsAmount"
                type="number"
                value={settings.principalSavingsAmount}
                onChange={handleChange}
                helperText="Dibayarkan 1x saat pendaftaran anggota baru"
              />
              <Input
                label="Besaran Simpanan Wajib Bulanan (Rp)"
                name="mandatorySavingsAmount"
                type="number"
                value={settings.mandatorySavingsAmount}
                onChange={handleChange}
                helperText="Iuran rutin bulanan per anggota"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg" isLoading={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            Simpan Seluruh Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
}

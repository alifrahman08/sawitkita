"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scale,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Save,
  Calculator,
  User,
  MapPin,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { calculateTransaction } from "@/lib/calculations";
import { formatRupiah, formatKg } from "@/lib/utils";

export default function TambahTransaksiPage() {
  const router = useRouter();

  const [members, setMembers] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [activePrice, setActivePrice] = useState<number>(2850);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Form Fields
  const [memberId, setMemberId] = useState("");
  const [farmId, setFarmId] = useState("");
  const [ticketNo, setTicketNo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [grossWeight, setGrossWeight] = useState<number | "">("");
  const [tareWeight, setTareWeight] = useState<number | "">("");
  const [deductionPercentage, setDeductionPercentage] = useState<number>(3.0);
  const [deductionWeightKg, setDeductionWeightKg] = useState<number>(0);
  const [qualityCategory, setQualityCategory] = useState("Standar");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load Initial Master Data
  useEffect(() => {
    async function loadData() {
      try {
        const [memberRes, farmRes, priceRes] = await Promise.all([
          fetch("/api/members?limit=1000&status=AKTIF"),
          fetch("/api/farms"),
          fetch("/api/prices"),
        ]);
        const memberData = await memberRes.json();
        const farmData = await farmRes.json();
        const priceData = await priceRes.json();

        setMembers(memberData.items || []);
        setFarms(farmData.items || []);

        if (priceData.currentActive) {
          setActivePrice(Number(priceData.currentActive.pricePerKg));
        }

        if (memberData.items?.length > 0) {
          setMemberId(memberData.items[0].id);
        }
      } catch (err) {
        console.error("Error loading master data:", err);
      } finally {
        setIsLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  // Filter farms by selected member
  const availableFarms = farms.filter((f) => f.memberId === memberId);

  // Automatically select first available farm when member changes
  useEffect(() => {
    if (availableFarms.length > 0) {
      setFarmId(availableFarms[0].id);
    } else {
      setFarmId("");
    }
  }, [memberId]);

  // Real-time calculation using core business module
  const calculation = calculateTransaction({
    grossWeight: Number(grossWeight) || 0,
    tareWeight: Number(tareWeight) || 0,
    deductionPercentage: Number(deductionPercentage) || 0,
    deductionWeightKg: Number(deductionWeightKg) || 0,
    pricePerKg: activePrice,
  });

  const handleSubmit = async (targetStatus: "DRAFT" | "MENUNGGU_VERIFIKASI") => {
    setSubmitError("");

    if (!memberId) {
      setSubmitError("Silakan pilih anggota petani.");
      return;
    }
    if (!farmId) {
      setSubmitError("Silakan pilih kebun sawit yang ditimbang.");
      return;
    }
    if (!grossWeight || Number(grossWeight) <= 0) {
      setSubmitError("Berat bruto timbang harus lebih besar dari 0 kg.");
      return;
    }
    if (Number(tareWeight) < 0) {
      setSubmitError("Berat tara tidak boleh bernilai negatif.");
      return;
    }
    if (!calculation.isValid) {
      setSubmitError(calculation.errors.join(". "));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        memberId,
        farmId,
        ticketNo: ticketNo.trim() || undefined,
        date: new Date(date).toISOString(),
        grossWeight: Number(grossWeight),
        tareWeight: Number(tareWeight) || 0,
        deductionPercentage: Number(deductionPercentage) || 0,
        deductionWeightKg: Number(deductionWeightKg) || 0,
        pricePerKg: activePrice,
        qualityCategory,
        notes: notes.trim() || undefined,
        status: targetStatus,
      };

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Gagal mencatat transaksi timbang.");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin/transaksi");
      router.refresh();
    } catch {
      setSubmitError("Terjadi gangguan koneksi ke server.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/transaksi">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pencatatan Penimbangan TBS
            </h1>
            <p className="text-xs text-slate-500">
              Formulir digital jembatan timbang terhubung dengan harga snapshot dan validasi server
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
          <span className="text-slate-600 font-medium">Harga TBS Aktif:</span>
          <span className="font-bold text-[#1b4332]">Rp {activePrice.toLocaleString("id-ID")} / kg</span>
        </div>
      </div>

      {submitError && <Alert type="error" message={submitError} className="mb-4" />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="py-4 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-[#1b4332]" />
                1. Data Identitas Petani & Kebun
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <Select
                label="Anggota Petani Sawit"
                required
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.memberNo}) - {m.phone}
                  </option>
                ))}
              </Select>

              <Select
                label="Lahan Kebun Asal TBS"
                required
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
              >
                {availableFarms.length === 0 ? (
                  <option value="">Belum ada kebun terdaftar untuk anggota ini</option>
                ) : (
                  availableFarms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code}) - {f.village}, {f.areaHectares} Ha
                    </option>
                  ))
                )}
              </Select>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nomor Tiket Fisik (Opsional)"
                  placeholder="cth: TKT-1025-01"
                  value={ticketNo}
                  onChange={(e) => setTicketNo(e.target.value)}
                />
                <Input
                  label="Tanggal & Waktu Timbang"
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#1b4332]" />
                2. Data Pengukuran Berat & Potongan Fraksi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Berat Bruto (kg)"
                  type="number"
                  step="0.01"
                  required
                  placeholder="cth: 5200"
                  value={grossWeight}
                  onChange={(e) =>
                    setGrossWeight(e.target.value === "" ? "" : parseFloat(e.target.value))
                  }
                  helperText="Berat truk + muatan TBS"
                />

                <Input
                  label="Berat Tara (kg)"
                  type="number"
                  step="0.01"
                  required
                  placeholder="cth: 1200"
                  value={tareWeight}
                  onChange={(e) =>
                    setTareWeight(e.target.value === "" ? "" : parseFloat(e.target.value))
                  }
                  helperText="Berat truk kosong setelah bongkar"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Potongan Persentase (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={deductionPercentage}
                  onChange={(e) => setDeductionPercentage(parseFloat(e.target.value) || 0)}
                  helperText="Potongan fraksi/sampah standar"
                />

                <Input
                  label="Potongan Berat Tambahan (kg)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={deductionWeightKg}
                  onChange={(e) => setDeductionWeightKg(parseFloat(e.target.value) || 0)}
                  helperText="Potongan tangkai panjang / pasir manual"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Kategori Kualitas TBS"
                  value={qualityCategory}
                  onChange={(e) => setQualityCategory(e.target.value)}
                >
                  <option value="Standar">Kualitas Standar</option>
                  <option value="Super">Kualitas Super / Prima</option>
                  <option value="Kurang Matang">Fraksi Mengkal / Kurang Matang</option>
                </Select>

                <Input
                  label="Harga TBS per kg (Rp)"
                  type="number"
                  disabled
                  value={activePrice}
                  helperText="Terkunci ke harga aktif saat ini"
                />
              </div>

              <Textarea
                label="Catatan Lapangan"
                rows={2}
                placeholder="Catatan kondisi buah, nomor polisi armada, atau nama supir..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Live Calculation Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="sticky top-20 border-emerald-200 shadow-md overflow-hidden">
            <div className="bg-[#1b4332] text-white p-5">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200 block">
                Rincian Kalkulasi Timbang
              </span>
              <h3 className="text-xl font-bold mt-1">Hasil Perhitungan Nyata</h3>
            </div>

            <CardContent className="p-5 space-y-4 bg-white text-xs sm:text-sm">
              <div className="space-y-2.5 pb-4 border-b border-slate-100">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Berat Bruto:</span>
                  <span className="font-semibold text-slate-900">
                    {formatKg(Number(grossWeight) || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Berat Tara Truk:</span>
                  <span className="font-semibold text-slate-900">
                    {formatKg(Number(tareWeight) || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center font-medium text-slate-800 pt-1 border-t border-dashed border-slate-200">
                  <span>Berat Setelah Tara:</span>
                  <span>{formatKg(calculation.weightAfterTare)}</span>
                </div>
              </div>

              <div className="space-y-2.5 pb-4 border-b border-slate-100 text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Potongan Persen ({deductionPercentage}%):</span>
                  <span className="font-medium text-amber-700">
                    -{formatKg(calculation.deductionPercentKg)}
                  </span>
                </div>
                {deductionWeightKg > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Potongan Tambahan (kg):</span>
                    <span className="font-medium text-amber-700">
                      -{formatKg(deductionWeightKg)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center font-semibold text-amber-800 pt-1 border-t border-dashed border-slate-200">
                  <span>Total Potongan Berat:</span>
                  <span>-{formatKg(calculation.totalDeductionKg)}</span>
                </div>
              </div>

              {/* Net Weight Highlight */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 uppercase block">
                    Berat Bersih (Netto)
                  </span>
                  <span className="text-2xl font-black text-[#1b4332]">
                    {formatKg(calculation.netWeight)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Harga Satuan</span>
                  <span className="text-sm font-bold text-slate-800">
                    Rp {activePrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Gross Amount Highlight */}
              <div className="p-4 bg-linear-to-r from-emerald-950 to-[#1b4332] text-white rounded-xl">
                <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold block">
                  Nilai Kotor Transaksi (Hak Petani)
                </span>
                <span className="text-2xl font-black tracking-tight text-white block mt-0.5">
                  {formatRupiah(calculation.grossAmount)}
                </span>
                <span className="text-[10px] text-emerald-200 block mt-1">
                  * Belum termasuk alokasi simpanan sukarela / potongan kredit (jika ada)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <Button
                  type="button"
                  onClick={() => handleSubmit("MENUNGGU_VERIFIKASI")}
                  className="w-full font-bold shadow-md"
                  size="lg"
                  isLoading={isSubmitting}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Kirim & Minta Verifikasi
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSubmit("DRAFT")}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2 text-slate-500" />
                  Simpan sebagai Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

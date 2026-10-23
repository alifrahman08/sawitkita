"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Plus,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { formatRupiah, formatDateIndo } from "@/lib/utils";

export default function TbsPricePage() {
  const [prices, setPrices] = useState<any[]>([]);
  const [currentActive, setCurrentActive] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pricePerKg: 2900,
    effectiveFrom: new Date().toISOString().slice(0, 16),
    sourceNotes: "Penetapan Disbun Prov. Riau & Rapat Pengurus Koperasi",
    category: "Standar",
    status: "AKTIF",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/prices");
      const data = await res.json();
      if (res.ok) {
        setPrices(data.prices || []);
        setCurrentActive(data.currentActive || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleCreatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          pricePerKg: Number(formData.pricePerKg),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Gagal menetapkan harga TBS");
        setIsSubmitting(false);
        return;
      }

      setIsAddModalOpen(false);
      setFeedback({
        type: "success",
        message: `Harga TBS baru Rp ${Number(formData.pricePerKg).toLocaleString("id-ID")}/kg berhasil ditetapkan!`,
      });
      fetchPrices();
    } catch {
      setFormError("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recharts data format
  const chartData = [...prices]
    .reverse()
    .map((p) => ({
      date: new Date(p.effectiveFrom).toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      harga: Number(p.pricePerKg),
      keterangan: p.sourceNotes || "Harga TBS",
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengelolaan Harga TBS</h1>
          <p className="text-xs text-slate-500 mt-1">
            Penetapan harga Tandan Buah Segar kelapa sawit per kg, riwayat perubahan, dan penetapan periode efektif
          </p>
        </div>

        <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-1.5 shadow-xs">
          <Plus className="w-4 h-4" />
          Tetapkan Harga TBS Baru
        </Button>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} className="mb-4" />}

      {/* Prominent Active Price Banner */}
      {currentActive && (
        <Card className="bg-linear-to-r from-[#1b4332] via-[#245942] to-[#2d6a4f] text-white shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#d4a373] text-[#1b4332]">
                    HARGA AKTIF BERLAKU
                  </span>
                  <span className="text-xs text-emerald-200">
                    Kategori: {currentActive.category || "Standar"}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    Rp {Number(currentActive.pricePerKg).toLocaleString("id-ID")}
                  </span>
                  <span className="text-sm font-medium text-emerald-200">/ kilogram</span>
                </div>
                <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
                  {currentActive.sourceNotes || "Penetapan resmi harga TBS Dinas Perkebunan"}
                </p>
              </div>

              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-700/60 text-xs space-y-2">
                <div>
                  <span className="text-emerald-300 block text-[11px]">Mulai Berlaku</span>
                  <span className="font-semibold text-white">
                    {formatDateIndo(currentActive.effectiveFrom, true)}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-300 block text-[11px]">Pemberlakuan Transaksi</span>
                  <span className="text-emerald-100">
                    Setiap penimbangan baru otomatis menggunakan harga snapshot ini.
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Trend Graph */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Grafik Tren Riwayat Harga TBS (Rp / kg)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  formatter={(val: any) => [formatRupiah(val), "Harga TBS / kg"]}
                  labelFormatter={(l, p: any) => p?.[0]?.payload?.keterangan || l}
                />
                <Line
                  type="monotone"
                  dataKey="harga"
                  stroke="#2d6a4f"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#2d6a4f", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Price History Table */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Daftar Arsip & Riwayat Penetapan Harga TBS</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Tanggal Mulai Berlaku</th>
                  <th className="px-4 py-3">Berlaku Sampai</th>
                  <th className="px-4 py-3 text-right">Harga per kg</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Dasar & Sumber Penetapan</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prices.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      {formatDateIndo(p.effectiveFrom)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {p.effectiveTo ? formatDateIndo(p.effectiveTo) : "Sekarang"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatRupiah(p.pricePerKg)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{p.category || "Standar"}</td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs">{p.sourceNotes || "-"}</td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={
                          p.status === "AKTIF"
                            ? "success"
                            : p.status === "TERJADWAL"
                            ? "info"
                            : "outline"
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Tambah Harga */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tetapkan Harga TBS Baru"
        description="Pemberlakuan harga baru tidak akan merubah nilai transaksi yang telah terkonfirmasi sebelumnya"
      >
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        <form onSubmit={handleCreatePrice} className="space-y-4">
          <Input
            label="Harga TBS per Kilogram (Rupiah)"
            type="number"
            required
            placeholder="cth: 2900"
            value={formData.pricePerKg}
            onChange={(e) => setFormData({ ...formData, pricePerKg: parseFloat(e.target.value) || 0 })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tanggal & Jam Mulai Berlaku"
              type="datetime-local"
              required
              value={formData.effectiveFrom}
              onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
            />
            <Select
              label="Status Harga"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="AKTIF">AKTIF (Langsung Berlaku)</option>
              <option value="TERJADWAL">TERJADWAL (Periode Mendatang)</option>
            </Select>
          </div>

          <Input
            label="Kategori Mutu / Kualitas TBS"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          <Textarea
            label="Catatan Dasar Penetapan Harga"
            required
            rows={3}
            placeholder="cth: Penetapan Dinas Perkebunan Riau Periode X & Hasil Musyawarah Anggota"
            value={formData.sourceNotes}
            onChange={(e) => setFormData({ ...formData, sourceNotes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan & Tetapkan Harga
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

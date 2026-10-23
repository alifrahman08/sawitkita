"use client";

import React, { useState, useEffect } from "react";
import {
  FileBarChart2,
  Calendar,
  Download,
  Printer,
  Scale,
  DollarSign,
  TrendingUp,
  MapPin,
  Users,
  PiggyBank,
  CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatKg, formatDateIndo } from "@/lib/utils";

export default function LaporanPage() {
  const [data, setData] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const res = await fetch(`/api/reports?${query.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-md w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { summary, farmProduction, memberActivity, expenses } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Laporan Keuangan & Rekapitulasi Operasional
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data rekapitulasi timbang TBS, pembelian hasil panen, kewajiban petani, dan pembukuan simpanan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 shadow-xs">
            <Printer className="w-4 h-4" />
            Cetak Laporan Resmi (PDF)
          </Button>
        </div>
      </div>

      {/* Date Filter Card */}
      <Card className="print:hidden">
        <CardContent className="p-4">
          <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Periode Laporan:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 text-xs bg-white"
            />
            <span className="text-xs text-slate-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 text-xs bg-white"
            />
            <Button type="submit" size="sm" variant="secondary">
              Terapkan Periode
            </Button>
            {(startDate || endDate) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  fetchReports();
                }}
              >
                Reset
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Printable Report Header */}
      <div className="hidden print:block text-center pb-4 border-b-2 border-slate-800 space-y-1">
        <h2 className="text-lg font-bold uppercase tracking-tight">
          KOPERASI PRODUSEN SAWIT MAKMUR BERSAMA
        </h2>
        <p className="text-xs">
          LAPORAN OPERASIONAL & KEUANGAN PENIMBANGAN TBS KELAPA SAWIT
        </p>
        <p className="text-[10px] text-slate-500">
          Periode: {startDate ? formatDateIndo(startDate) : "Awal Operasional"} s/d{" "}
          {endDate ? formatDateIndo(endDate) : "Sekarang"} • Dicetak pada: {formatDateIndo(new Date(), true)}
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-emerald-50/50 border-emerald-200">
          <CardContent className="p-5">
            <span className="text-xs text-emerald-800 font-semibold block">Total Netto TBS Diterima</span>
            <span className="text-2xl font-black text-[#1b4332] mt-1 block">
              {formatKg(summary.totalNetWeight)}
            </span>
            <span className="text-[11px] text-emerald-600 mt-1 block">
              Dari {summary.totalTransactions} transaksi timbang
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-medium block">Total Nilai Pembelian TBS</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {formatRupiah(summary.totalGrossAmount)}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Kewajiban bruto koperasi</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-medium block">Realisasi Pembayaran Kas</span>
            <span className="text-xl font-bold text-emerald-700 mt-1 block">
              {formatRupiah(summary.totalPaidToFarmers)}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Telah ditransfer ke anggota</span>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-200">
          <CardContent className="p-5">
            <span className="text-xs text-amber-800 font-semibold block">Sisa Hutang TBS (Tunggakan)</span>
            <span className="text-xl font-bold text-amber-900 mt-1 block">
              {formatRupiah(summary.totalPendingPay)}
            </span>
            <span className="text-[11px] text-amber-700 mt-1 block">Menunggu jadwal pencairan</span>
          </CardContent>
        </Card>
      </div>

      {/* Farm Production Breakdown */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1b4332]" />
            Rekapitulasi Produksi TBS per Lahan Kebun
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Kode Kebun</th>
                  <th className="px-4 py-3">Nama Lahan Kebun</th>
                  <th className="px-4 py-3">Anggota Pemilik</th>
                  <th className="px-4 py-3 text-center">Jumlah Panen</th>
                  <th className="px-4 py-3 text-right">Total Netto TBS</th>
                  <th className="px-4 py-3 text-right">Total Nilai Pembelian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {farmProduction.map((fp: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold font-mono text-[#1b4332]">{fp.code}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{fp.name}</td>
                    <td className="px-4 py-3.5 text-slate-700">{fp.member}</td>
                    <td className="px-4 py-3.5 text-center text-slate-600">{fp.count} rit/timbang</td>
                    <td className="px-4 py-3.5 text-right font-black text-[#1b4332]">
                      {formatKg(fp.netWeight)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatRupiah(fp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Member Activity Breakdown */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1b4332]" />
            Rekapitulasi Penjualan & Pembayaran per Anggota Petani
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No. Anggota</th>
                  <th className="px-4 py-3">Nama Lengkap</th>
                  <th className="px-4 py-3 text-right">Total Netto TBS</th>
                  <th className="px-4 py-3 text-right">Nilai Kotor Hak TBS</th>
                  <th className="px-4 py-3 text-right">Sudah Dibayarkan</th>
                  <th className="px-4 py-3 text-right">Sisa Kewajiban</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberActivity.map((ma: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold font-mono text-[#1b4332]">{ma.memberNo}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{ma.name}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-800">
                      {formatKg(ma.netWeight)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatRupiah(ma.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-emerald-700">
                      {formatRupiah(ma.paid)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-amber-700">
                      {formatRupiah(ma.remaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Operational Expenses */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Biaya Operasional Koperasi (Pengeluaran Kantor & Timbangan)</span>
            <span className="text-sm font-bold text-rose-700">
              Total: {formatRupiah(summary.totalExpenses)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No. Biaya</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Deskripsi Kebutuhan</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{e.expenseNo}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDateIndo(e.date)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{e.category}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-sm">{e.description}</td>
                    <td className="px-4 py-3 text-right font-bold text-rose-700">
                      {formatRupiah(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Signatures for Print */}
      <div className="hidden print:grid grid-cols-2 pt-12 text-center text-xs">
        <div>
          <p>Ketua Koperasi,</p>
          <div className="h-16" />
          <p className="font-bold border-t border-slate-400 mx-12 pt-1">
            ( Bambang Sudarmono, S.P. )
          </p>
        </div>
        <div>
          <p>Bendahara Koperasi,</p>
          <div className="h-16" />
          <p className="font-bold border-t border-slate-400 mx-12 pt-1">
            ( Rina Kusuma Dewi )
          </p>
        </div>
      </div>
    </div>
  );
}

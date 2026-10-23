"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  DollarSign,
  CheckCircle,
  Clock,
  PiggyBank,
  TrendingUp,
  MapPin,
  Bell,
  Printer,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionStatusBadge } from "@/components/ui/badge";
import { formatRupiah, formatKg, formatDateIndo, formatShortDate } from "@/lib/utils";

export default function MemberDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-md w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, recentTransactions, recentPayments, announcements } = data;
  const { member, totalNetWeight, totalGrossAmount, totalPaidReceived, totalRemaining, savings, activePrice } = stats;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-[#1b4332] via-[#245942] to-[#2d6a4f] text-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold text-emerald-200 tracking-wider">
              Portal Mandiri Anggota Petani
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Selamat Datang, {member?.fullName}
            </h1>
            <p className="text-xs text-emerald-100 mt-1">
              No. Anggota: <span className="font-mono font-bold text-white">{member?.memberNo}</span> • Rekening {member?.bankName || "BRI"}: {member?.bankAccount || "-"}
            </p>
          </div>

          {activePrice && (
            <div className="p-3.5 bg-emerald-950/60 rounded-xl border border-emerald-700/60 shrink-0">
              <span className="text-[11px] text-emerald-300 block">Harga TBS Aktif Hari Ini:</span>
              <span className="text-xl font-black text-white">
                Rp {Number(activePrice.pricePerKg).toLocaleString("id-ID")}
                <span className="text-xs font-normal text-emerald-200"> / kg</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-emerald-300 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Total Netto TBS Panen</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                {formatKg(totalNetWeight)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Dari {stats.totalTransactions} penimbangan
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-300 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Nilai Kotor Hasil Timbang</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                {formatRupiah(totalGrossAmount)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Total hak bruto</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-300 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Telah Diterima (Dicairkan)</span>
              <span className="text-xl font-bold text-emerald-800 mt-1 block">
                {formatRupiah(totalPaidReceived)}
              </span>
              <span className="text-[11px] text-emerald-600 mt-1 block">Ditransfer ke rekening</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-amber-300 transition-all bg-amber-50/40 border-amber-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-800 block">Sisa Hak Belum Dicairkan</span>
              <span className="text-xl font-black text-amber-900 mt-1 block">
                {formatRupiah(totalRemaining)}
              </span>
              <span className="text-[11px] text-amber-700 mt-1 block">Menunggu pencairan</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Box & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Savings Card */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-700" />
                Saldo Tabungan Koperasi Anda
              </CardTitle>
              <Link href="/anggota/simpanan" className="text-xs text-[#1b4332] font-semibold hover:underline">
                Buku Simpanan →
              </Link>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-800 font-medium block">Total Saldo Simpanan</span>
                  <span className="text-2xl font-black text-[#1b4332]">
                    {formatRupiah(savings.totalBalance)}
                  </span>
                </div>
                <Link href="/anggota/simpanan">
                  <Button size="sm" variant="secondary">
                    Mutasi
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Simpanan Pokok</span>
                  <span className="font-semibold text-slate-800">
                    {formatRupiah(savings.principalBalance)}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Simpanan Wajib</span>
                  <span className="font-semibold text-slate-800">
                    {formatRupiah(savings.mandatoryBalance)}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Simpanan Sukarela</span>
                  <span className="font-semibold text-emerald-700">
                    {formatRupiah(savings.voluntaryBalance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-700" />
                Pengumuman Terbaru Koperasi
              </CardTitle>
              <Link href="/anggota/pengumuman" className="text-xs text-[#1b4332] font-semibold hover:underline">
                Lihat Semua →
              </Link>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {announcements.length === 0 ? (
                <p className="text-xs text-slate-400">Belum ada pengumuman baru dari pengurus.</p>
              ) : (
                announcements.map((ann: any) => (
                  <div key={ann.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                        {ann.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatShortDate(ann.publishedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{ann.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Personal Weighing Transactions */}
      <Card>
        <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Hasil Timbang TBS Terakhir Anda</CardTitle>
          <Link href="/anggota/transaksi" className="text-xs text-[#1b4332] font-semibold hover:underline">
            Lihat Semua Transaksi →
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No Transaksi & Tanggal</th>
                  <th className="px-4 py-3">Kebun</th>
                  <th className="px-4 py-3 text-right">Netto (kg)</th>
                  <th className="px-4 py-3 text-right">Harga/kg</th>
                  <th className="px-4 py-3 text-right">Nilai Kotor</th>
                  <th className="px-4 py-3 text-right">Sudah Dibayar</th>
                  <th className="px-4 py-3 text-right">Sisa Hak</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      Belum ada transaksi timbang tercatat untuk akun Anda.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((trx: any) => (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold font-mono text-[#1b4332]">{trx.transactionNo}</div>
                        <div className="text-[11px] text-slate-400">{formatShortDate(trx.date)}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{trx.farm?.name || "Kebun"}</td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                        {formatKg(trx.netWeight)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-600">
                        Rp {Number(trx.pricePerKg).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                        {formatRupiah(trx.grossAmount)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-emerald-700">
                        {formatRupiah(trx.paidAmount)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-amber-700">
                        {formatRupiah(trx.remainingAmount)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <TransactionStatusBadge status={trx.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

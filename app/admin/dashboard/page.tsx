"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  MapPin,
  Scale,
  DollarSign,
  CreditCard,
  Clock,
  PiggyBank,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, TransactionStatusBadge } from "@/components/ui/badge";
import { formatRupiah, formatKg, formatDateIndo } from "@/lib/utils";

export default function AdminDashboardPage() {
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
        console.error("Dashboard error:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-md w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const { stats, recentTransactions, recentPayments, currentPrice, chartData } = data;

  const statCards = [
    {
      title: "Anggota Aktif",
      value: stats.totalActiveMembers,
      unit: "petani",
      icon: Users,
      href: "/admin/anggota?status=AKTIF",
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      title: "Kebun Terdaftar",
      value: stats.totalFarms,
      unit: "lahan",
      icon: MapPin,
      href: "/admin/kebun",
      color: "text-blue-700 bg-blue-50",
    },
    {
      title: "Netto TBS Bulan Ini",
      value: formatKg(stats.totalMonthlyNetWeight),
      icon: Scale,
      href: "/admin/transaksi",
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      title: "Nilai Panen Bulan Ini",
      value: formatRupiah(stats.totalMonthlyGrossAmount),
      icon: DollarSign,
      href: "/admin/transaksi",
      color: "text-teal-700 bg-teal-50",
    },
    {
      title: "Sudah Dibayarkan",
      value: formatRupiah(stats.totalPaid),
      icon: CheckCircle,
      href: "/admin/pembayaran",
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      title: "Kewajiban Tertunda",
      value: formatRupiah(stats.totalPendingPayment),
      icon: Clock,
      href: "/admin/pembayaran",
      color: "text-amber-700 bg-amber-50",
    },
    {
      title: "Total Simpanan Anggota",
      value: formatRupiah(stats.totalSavings),
      icon: PiggyBank,
      href: "/admin/simpanan",
      color: "text-indigo-700 bg-indigo-50",
    },
    {
      title: "Perlu Verifikasi Timbang",
      value: `${stats.pendingVerificationCount} transaksi`,
      icon: AlertCircle,
      href: "/admin/transaksi?status=MENUNGGU_VERIFIKASI",
      color:
        stats.pendingVerificationCount > 0
          ? "text-rose-700 bg-rose-50 border-rose-200"
          : "text-slate-700 bg-slate-50",
      highlight: stats.pendingVerificationCount > 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Operasional Koperasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan data transaksi timbang, pembayaran petani, dan simpanan koperasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/transaksi/tambah">
            <Button size="sm" className="gap-1.5 shadow-xs">
              <Plus className="w-4 h-4" />
              Timbang TBS Baru
            </Button>
          </Link>
          <Link href="/admin/pembayaran">
            <Button variant="outline" size="sm" className="gap-1.5 shadow-xs">
              <CreditCard className="w-4 h-4" />
              Proses Pembayaran
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} href={card.href} className="block group">
              <Card className="hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 block">
                      {card.title}
                    </span>
                    <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      {card.value}
                      {card.unit && (
                        <span className="text-xs font-normal text-slate-400 ml-1">
                          {card.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Harvest Weight Trend Chart */}
        <div className="lg:col-span-8">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle>Tren Tonase TBS & Nilai Transaksi</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  10 transaksi penimbangan kelapa sawit terakhir
                </p>
              </div>
              <Link href="/admin/transaksi" className="text-xs text-[#1b4332] font-semibold hover:underline">
                Lihat Semua
              </Link>
            </CardHeader>
            <CardContent className="pt-2 pb-6">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      formatter={(val: any, name: any) => [
                        name === "netto" ? formatKg(val) : formatRupiah(val),
                        name === "netto" ? "Netto TBS" : "Nilai Kotor",
                      ]}
                      labelFormatter={(label, payload: any) => {
                        const item = payload?.[0]?.payload;
                        return item ? `${item.petani} (${label})` : label;
                      }}
                    />
                    <Bar dataKey="netto" fill="#2d6a4f" radius={[4, 4, 0, 0]} name="netto" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current TBS Price Card & Quick Status */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-linear-to-br from-[#1b4332] to-[#2d6a4f] text-white">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-emerald-200 tracking-wider">
                  Harga TBS Resmi Koperasi
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373] text-[#1b4332]">
                  AKTIF
                </span>
              </div>

              <div>
                <span className="text-3xl font-extrabold tracking-tight">
                  Rp {Number(currentPrice?.pricePerKg || 0).toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-emerald-200 ml-1">/ kilogram</span>
              </div>

              <div className="text-xs text-emerald-100/90 pt-2 border-t border-emerald-700/60 leading-relaxed">
                <p className="line-clamp-2">{currentPrice?.sourceNotes || "Penetapan Disbun & Koperasi"}</p>
                <p className="text-[10px] text-emerald-300 mt-1">
                  Berlaku sejak: {formatDateIndo(currentPrice?.effectiveFrom)}
                </p>
              </div>

              <Link href="/admin/harga-tbs" className="block pt-1">
                <Button variant="gold" size="sm" className="w-full text-xs font-semibold">
                  Kelola Riwayat Harga TBS
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Action Card */}
          <Card>
            <CardHeader className="py-3.5">
              <CardTitle className="text-sm">Aksi Cepat Pengurus</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs">
              <Link
                href="/admin/transaksi/tambah"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-slate-800">Catat Penimbangan TBS Lapangan</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href="/admin/anggota"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-slate-800">Tambah Anggota Petani Baru</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href="/admin/simpanan"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-slate-800">Catat Setoran / Penarikan Simpanan</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tables Section: Recent Weighing & Recent Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle>Transaksi Timbang Terbaru</CardTitle>
            <Link href="/admin/transaksi" className="text-xs text-[#1b4332] font-semibold hover:underline">
              Semua Transaksi →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-100">
                  <tr>
                    <th className="px-4 py-3">No Transaksi</th>
                    <th className="px-4 py-3">Petani</th>
                    <th className="px-4 py-3 text-right">Netto</th>
                    <th className="px-4 py-3 text-right">Nilai Kotor</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTransactions.map((trx: any) => (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link href={`/admin/transaksi`} className="hover:text-emerald-700">
                          {trx.transactionNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{trx.member?.fullName || "-"}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatKg(trx.netWeight)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {formatRupiah(trx.grossAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <TransactionStatusBadge status={trx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle>Pencairan Pembayaran Terbaru</CardTitle>
            <Link href="/admin/pembayaran" className="text-xs text-[#1b4332] font-semibold hover:underline">
              Semua Pembayaran →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-100">
                  <tr>
                    <th className="px-4 py-3">No Pembayaran</th>
                    <th className="px-4 py-3">Penerima</th>
                    <th className="px-4 py-3">Metode</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPayments.map((pay: any) => (
                    <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{pay.paymentNo}</td>
                      <td className="px-4 py-3 text-slate-700">{pay.member?.fullName || "-"}</td>
                      <td className="px-4 py-3 text-slate-500">
                        <span className="font-semibold">{pay.paymentMethod}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-800">
                        {formatRupiah(pay.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="success">Diverifikasi</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

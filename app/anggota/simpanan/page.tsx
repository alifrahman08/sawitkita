"use client";

import React, { useState, useEffect } from "react";
import { PiggyBank, Printer, ArrowDownLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDateIndo, formatShortDate } from "@/lib/utils";

export default function MemberSimpananPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/savings")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return <div className="p-8 text-center text-slate-400">Memuat buku simpanan Anda...</div>;
  }

  const { mutations, accounts } = data;
  const myAccount = accounts?.[0] || {
    totalBalance: 0,
    principalBalance: 0,
    mandatoryBalance: 0,
    voluntaryBalance: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Buku Simpanan Koperasi Saya
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi tabungan pokok, iuran wajib bulanan, dan simpanan sukarela anggota koperasi
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 shadow-xs">
          <Printer className="w-4 h-4" />
          Cetak Buku Simpanan
        </Button>
      </div>

      {/* Saldo Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-[#1b4332] to-[#2d6a4f] text-white">
          <CardContent className="p-5">
            <span className="text-xs text-emerald-200 uppercase font-semibold tracking-wider block">
              Total Saldo Simpanan
            </span>
            <span className="text-2xl font-black mt-1 block">
              {formatRupiah(myAccount.totalBalance)}
            </span>
            <span className="text-[11px] text-emerald-200 mt-1 block">Tersimpan aman di koperasi</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-medium block">Simpanan Pokok</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {formatRupiah(myAccount.principalBalance)}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Iuran awal anggota</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-medium block">Simpanan Wajib</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {formatRupiah(myAccount.mandatoryBalance)}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Akumulasi iuran bulanan</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-medium block">Simpanan Sukarela</span>
            <span className="text-xl font-bold text-emerald-700 mt-1 block">
              {formatRupiah(myAccount.voluntaryBalance)}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Bisa ditarik sewaktu-waktu</span>
          </CardContent>
        </Card>
      </div>

      {/* Mutations Ledger Table */}
      <Card>
        <CardHeader className="py-4 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-emerald-700" />
            Buku Catatan Mutasi Simpanan Anda
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No Mutasi & Tanggal</th>
                  <th className="px-4 py-3">Jenis & Kategori</th>
                  <th className="px-4 py-3 text-right">Nominal Transaksi</th>
                  <th className="px-4 py-3 text-right">Saldo Berjalan</th>
                  <th className="px-4 py-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mutations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                      Belum ada catatan mutasi simpanan untuk akun Anda.
                    </td>
                  </tr>
                ) : (
                  mutations.map((mut: any) => (
                    <tr key={mut.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold font-mono text-[#1b4332]">{mut.mutationNo}</div>
                        <div className="text-[11px] text-slate-400">{formatShortDate(mut.mutationDate)}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            mut.type === "SETORAN"
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-rose-50 text-rose-800"
                          }`}
                        >
                          {mut.type}
                        </span>
                        <span className="ml-2 text-xs text-slate-600 font-medium">
                          Simpanan {mut.category}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3.5 text-right font-bold ${
                          mut.type === "SETORAN" ? "text-emerald-800" : "text-rose-700"
                        }`}
                      >
                        {mut.type === "SETORAN" ? "+" : "-"}
                        {formatRupiah(mut.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-slate-900">
                        {formatRupiah(mut.balanceAfter)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-xs">{mut.notes || "-"}</td>
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

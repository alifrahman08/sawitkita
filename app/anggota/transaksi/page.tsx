"use client";

import React, { useState, useEffect } from "react";
import { Scale, Printer, Search, Calendar, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, TransactionStatusBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatRupiah, formatKg, formatDateIndo, formatShortDate } from "@/lib/utils";

export default function MemberTransaksiPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/transactions?limit=100")
      .then((r) => r.json())
      .then((d) => setTransactions(d.items || []))
      .finally(() => setIsLoading(false));
  }, []);

  const openTicket = (trx: any) => {
    setSelectedTrx(trx);
    setIsTicketModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Riwayat Penimbangan TBS Saya
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data lengkap hasil timbang, berat kotor, tara, potongan fraksi, dan rincian hak bayar panen Anda
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No Transaksi & Tanggal</th>
                  <th className="px-4 py-3">Kebun Asal</th>
                  <th className="px-4 py-3 text-right">Bruto - Tara</th>
                  <th className="px-4 py-3 text-right">Potongan (%)</th>
                  <th className="px-4 py-3 text-right">Netto Bersih</th>
                  <th className="px-4 py-3 text-right">Harga/kg</th>
                  <th className="px-4 py-3 text-right">Nilai Kotor</th>
                  <th className="px-4 py-3 text-right">Sudah Dibayar</th>
                  <th className="px-4 py-3 text-right">Sisa Hak</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Tiket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                      Memuat transaksi penimbangan Anda...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-slate-400">
                      Belum ada riwayat penimbangan tercatat untuk akun Anda.
                    </td>
                  </tr>
                ) : (
                  transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold font-mono text-[#1b4332]">{trx.transactionNo}</div>
                        <div className="text-[11px] text-slate-400">{formatShortDate(trx.date)}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{trx.farm?.name || "Kebun"}</td>
                      <td className="px-4 py-3.5 text-right text-slate-600">
                        <div>{formatKg(trx.grossWeight)}</div>
                        <div className="text-[10px] text-slate-400">-{formatKg(trx.tareWeight)}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right text-amber-700 font-medium">
                        {trx.deductionPercentage}%
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-[#1b4332]">
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
                      <td className="px-4 py-3.5 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTicket(trx)}
                          className="h-8 gap-1 text-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Tiket
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Printable Ticket Modal */}
      {selectedTrx && (
        <Modal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          title="Tiket Resmi Penimbangan TBS Anda"
          maxWidth="xl"
        >
          <div className="space-y-6">
            <div className="ticket-print-area p-6 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900 space-y-4">
              <div className="text-center pb-3 border-b-2 border-slate-800">
                <h3 className="font-bold text-base uppercase">
                  Koperasi Produsen Sawit Makmur Bersama
                </h3>
                <p className="text-[10px] text-slate-600">
                  TIKET PENIMBANGAN TANDAN BUAH SEGAR (TBS)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">NO. TRANSAKSI:</span>
                  <span className="font-bold">{selectedTrx.transactionNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TANGGAL:</span>
                  <span>{formatDateIndo(selectedTrx.date, true)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">PETANI ANGGOTA:</span>
                  <span className="font-bold">{selectedTrx.member?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">KEBUN:</span>
                  <span>{selectedTrx.farm?.name}</span>
                </div>
              </div>

              <div className="border-t border-b border-slate-300 py-3 space-y-1.5">
                <div className="flex justify-between">
                  <span>BERAT BRUTO:</span>
                  <span className="font-bold">{formatKg(selectedTrx.grossWeight)}</span>
                </div>
                <div className="flex justify-between">
                  <span>BERAT TARA:</span>
                  <span>-{formatKg(selectedTrx.tareWeight)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>POTONGAN FRAKSI ({selectedTrx.deductionPercentage}%):</span>
                  <span>
                    -
                    {formatKg(
                      (Math.max(0, Number(selectedTrx.grossWeight) - Number(selectedTrx.tareWeight)) *
                        Number(selectedTrx.deductionPercentage)) /
                        100
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-200">
                  <span>BERAT BERSIH (NETTO):</span>
                  <span>{formatKg(selectedTrx.netWeight)}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span>HARGA TBS AKTIF:</span>
                  <span className="font-bold">
                    Rp {Number(selectedTrx.pricePerKg).toLocaleString("id-ID")} / kg
                  </span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>NILAI KOTOR HAK ANDA:</span>
                  <span>{formatRupiah(selectedTrx.grossAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-800">
                  <span>TELAH DICAIRKAN:</span>
                  <span>{formatRupiah(selectedTrx.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-amber-800 font-bold">
                  <span>SISA HAK PEMBAYARAN:</span>
                  <span>{formatRupiah(selectedTrx.remainingAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 print:hidden">
              <Button variant="ghost" onClick={() => setIsTicketModalOpen(false)}>
                Tutup
              </Button>
              <Button onClick={() => window.print()} className="gap-2">
                <Printer className="w-4 h-4" />
                Cetak Tiket
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

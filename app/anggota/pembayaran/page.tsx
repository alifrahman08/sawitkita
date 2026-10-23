"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Printer, CheckCircle, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatRupiah, formatDateIndo, formatShortDate } from "@/lib/utils";

export default function MemberPembayaranPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPay, setSelectedPay] = useState<any>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/payments?limit=100")
      .then((r) => r.json())
      .then((d) => setPayments(d.items || []))
      .finally(() => setIsLoading(false));
  }, []);

  const totalDiterima = payments.reduce((acc, p) => acc + Number(p.totalAmount), 0);

  const openReceipt = async (pay: any) => {
    try {
      const res = await fetch(`/api/payments/${pay.id}`);
      const detailed = await res.json();
      setSelectedPay(detailed);
      setIsReceiptModalOpen(true);
    } catch {
      setSelectedPay(pay);
      setIsReceiptModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Riwayat Pembayaran Diterima
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar pencairan dana hasil penjualan TBS kelapa sawit ke rekening bank atau kas Anda
          </p>
        </div>
      </div>

      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-700" />
          <span className="font-semibold text-emerald-900">Total Dana Telah Diterima:</span>
        </div>
        <span className="text-xl font-black text-[#1b4332]">{formatRupiah(totalDiterima)}</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No Pembayaran & Tanggal</th>
                  <th className="px-4 py-3">Metode & No Referensi Bank</th>
                  <th className="px-4 py-3 text-right">Nominal Pencairan</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Kuitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Memuat riwayat pembayaran Anda...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                      Belum ada catatan pencairan dana yang diterima.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold font-mono text-[#1b4332]">{p.paymentNo}</div>
                        <div className="text-[11px] text-slate-400">{formatShortDate(p.paymentDate)}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        <span className="font-semibold">{p.paymentMethod}</span>
                        {p.bankReference && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            Ref: {p.bankReference}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-emerald-800">
                        {formatRupiah(p.totalAmount)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge variant="success">Diverifikasi</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReceipt(p)}
                          className="h-8 gap-1 text-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Kuitansi
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

      {/* Modal Kuitansi Resmi */}
      {selectedPay && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Kuitansi Resmi Pembayaran TBS"
          maxWidth="xl"
        >
          <div className="space-y-6">
            <div className="ticket-print-area p-6 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900 space-y-4">
              <div className="text-center pb-3 border-b-2 border-slate-800">
                <h3 className="font-bold text-base uppercase">
                  Koperasi Produsen Sawit Makmur Bersama
                </h3>
                <p className="text-[10px] text-slate-600">
                  KUITANSI RESMI PENCAIRAN PEMBAYARAN HASIL PANEN TBS
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">NO. KUITANSI:</span>
                  <span className="font-bold">{selectedPay.paymentNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TANGGAL PENCAIRAN:</span>
                  <span>{formatDateIndo(selectedPay.paymentDate, true)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">PENERIMA (PETANI):</span>
                  <span className="font-bold">{selectedPay.member?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">METODE PEMBAYARAN:</span>
                  <span>
                    {selectedPay.paymentMethod} {selectedPay.bankReference && `(Ref: ${selectedPay.bankReference})`}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                <span>DANA YANG TELAH DITRANSFER:</span>
                <span className="text-emerald-800">{formatRupiah(selectedPay.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 print:hidden">
              <Button variant="ghost" onClick={() => setIsReceiptModalOpen(false)}>
                Tutup
              </Button>
              <Button onClick={() => window.print()} className="gap-2">
                <Printer className="w-4 h-4" />
                Cetak Kuitansi
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

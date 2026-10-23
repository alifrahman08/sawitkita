"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Plus,
  Download,
  Printer,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { formatRupiah, formatKg, formatDateIndo, formatShortDate } from "@/lib/utils";

export default function PembayaranPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [memberFilter, setMemberFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalObligation: 0,
    totalPaid: 0,
    totalPending: 0,
  });

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Form State for creating payment
  const [payMemberId, setPayMemberId] = useState("");
  const [memberEligibleTrx, setMemberEligibleTrx] = useState<any[]>([]);
  const [selectedTrxId, setSelectedTrxId] = useState("");
  const [payAmount, setPayAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<"TRANSFER" | "TUNAI">("TRANSFER");
  const [bankReference, setBankReference] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(methodFilter !== "ALL" && { method: methodFilter }),
        ...(memberFilter !== "ALL" && { memberId: memberFilter }),
      });

      const [payRes, memRes, trxRes] = await Promise.all([
        fetch(`/api/payments?${query.toString()}`),
        fetch("/api/members?limit=1000"),
        fetch("/api/transactions?limit=1000"),
      ]);

      const payData = await payRes.json();
      const memData = await memRes.json();
      const trxData = await trxRes.json();

      setPayments(payData.items || []);
      setTotal(payData.total || 0);
      setTotalPages(payData.totalPages || 1);
      setMembers(memData.items || []);

      // Calculate totals
      const validTrx = (trxData.items || []).filter((t: any) => t.status !== "DIBATALKAN");
      const grossTotal = validTrx.reduce((acc: number, t: any) => acc + Number(t.grossAmount), 0);
      const paidTotal = validTrx.reduce((acc: number, t: any) => acc + Number(t.paidAmount), 0);
      const pendingTotal = validTrx.reduce((acc: number, t: any) => acc + Number(t.remainingAmount), 0);

      setStats({
        totalObligation: grossTotal,
        totalPaid: paidTotal,
        totalPending: pendingTotal,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, methodFilter, memberFilter]);

  // Load unpaid transactions for selected member in modal
  useEffect(() => {
    if (!payMemberId) {
      setMemberEligibleTrx([]);
      setSelectedTrxId("");
      return;
    }

    fetch(`/api/transactions?memberId=${payMemberId}&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        const unpaid = (data.items || []).filter(
          (t: any) =>
            (t.status === "TERKONFIRMASI" ||
              t.status === "SIAP_DIBAYAR" ||
              t.status === "DIBAYAR_SEBAGIAN") &&
            Number(t.remainingAmount) > 0
        );
        setMemberEligibleTrx(unpaid);
        if (unpaid.length > 0) {
          setSelectedTrxId(unpaid[0].id);
          setPayAmount(Number(unpaid[0].remainingAmount));
        } else {
          setSelectedTrxId("");
          setPayAmount("");
        }
      });
  }, [payMemberId]);

  // When selected transaction changes, prefill amount with full remaining
  useEffect(() => {
    const selected = memberEligibleTrx.find((t) => t.id === selectedTrxId);
    if (selected) {
      setPayAmount(Number(selected.remainingAmount));
    }
  }, [selectedTrxId]);

  const openCreateModal = () => {
    setPayMemberId(members[0]?.id || "");
    setPaymentMethod("TRANSFER");
    setBankReference(`TRF-${Date.now().toString().slice(-6)}`);
    setPayNotes("");
    setFormError("");
    setIsCreateModalOpen(true);
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!payMemberId) {
      setFormError("Silakan pilih anggota petani penerima.");
      return;
    }
    if (!selectedTrxId) {
      setFormError("Tidak ada transaksi timbang terkonfirmasi yang dapat dibayarkan.");
      return;
    }
    if (!payAmount || Number(payAmount) <= 0) {
      setFormError("Nominal pembayaran harus lebih besar dari 0.");
      return;
    }

    const currentTrx = memberEligibleTrx.find((t) => t.id === selectedTrxId);
    if (currentTrx && Number(payAmount) > Number(currentTrx.remainingAmount)) {
      setFormError(
        `Nominal pembayaran (${formatRupiah(Number(payAmount))}) tidak boleh melebihi sisa kewajiban (${formatRupiah(Number(currentTrx.remainingAmount))}).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: payMemberId,
          paymentMethod,
          bankReference: bankReference.trim() || undefined,
          notes: payNotes.trim() || undefined,
          allocations: [
            {
              transactionId: selectedTrxId,
              allocatedAmount: Number(payAmount),
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Gagal mencatat pembayaran");
        setIsSubmitting(false);
        return;
      }

      setIsCreateModalOpen(false);
      setFeedback({
        type: "success",
        message: `Pembayaran ${data.payment.paymentNo} sebesar ${formatRupiah(Number(payAmount))} berhasil diproses!`,
      });
      fetchPayments();
    } catch {
      setFormError("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReceiptModal = async (pay: any) => {
    try {
      const res = await fetch(`/api/payments/${pay.id}`);
      const detailed = await res.json();
      setSelectedPayment(detailed);
      setIsReceiptModalOpen(true);
    } catch {
      setSelectedPayment(pay);
      setIsReceiptModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pembayaran Hasil Panen Petani
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Realisasi pencairan dana timbang TBS, pelunasan bertahap, dan kuitansi pembayaran resmi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a href="/api/payments?export=csv" download>
            <Button variant="outline" size="sm" className="gap-1.5 shadow-xs">
              <Download className="w-4 h-4" />
              Ekspor CSV
            </Button>
          </a>
          <Button size="sm" onClick={openCreateModal} className="gap-1.5 shadow-xs">
            <Plus className="w-4 h-4" />
            Catat Pembayaran Baru
          </Button>
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} className="mb-4" />}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Total Hak TBS Petani</span>
              <span className="text-xl font-bold text-slate-900">
                {formatRupiah(stats.totalObligation)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Telah Dibayarkan (Kas Keluar)</span>
              <span className="text-xl font-bold text-emerald-800">
                {formatRupiah(stats.totalPaid)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Sisa Kewajiban Belum Dicairkan</span>
              <span className="text-xl font-bold text-amber-700">
                {formatRupiah(stats.totalPending)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchPayments();
            }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nomor pembayaran, no referensi bank, atau nama petani..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1b4332]/20"
              />
            </div>

            <div className="w-full sm:w-56">
              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white"
              >
                <option value="ALL">Semua Anggota Penerima</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-44">
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white"
              >
                <option value="ALL">Semua Metode</option>
                <option value="TRANSFER">Transfer Bank</option>
                <option value="TUNAI">Tunai / Kas</option>
              </select>
            </div>

            <Button type="submit" size="sm" variant="secondary" className="w-full sm:w-auto">
              Cari
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payments History Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No Pembayaran & Tanggal</th>
                  <th className="px-4 py-3">Petani Penerima</th>
                  <th className="px-4 py-3">Metode & Ref Bank</th>
                  <th className="px-4 py-3 text-right">Nominal Pencairan</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Kuitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Memuat riwayat pembayaran...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      Belum ada catatan pencairan pembayaran yang sesuai.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold font-mono text-[#1b4332]">{p.paymentNo}</div>
                        <div className="text-[11px] text-slate-400">{formatShortDate(p.paymentDate)}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{p.member?.fullName}</div>
                        <div className="text-[11px] text-slate-400">{p.member?.bankName || "Kas Koperasi"}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800">{p.paymentMethod}</span>
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
                          onClick={() => openReceiptModal(p)}
                          className="h-8 gap-1.5 text-xs"
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

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Halaman {page} dari {totalPages} (Total {total} pembayaran)
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Catat Pembayaran Baru */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Pencairan Pembayaran Hasil Panen"
        description="Pilih transaksi terkonfirmasi yang akan dibayarkan secara penuh atau bertahap"
      >
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <Select
            label="Pilih Anggota Petani Penerima"
            required
            value={payMemberId}
            onChange={(e) => setPayMemberId(e.target.value)}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.memberNo})
              </option>
            ))}
          </Select>

          {/* Transaction selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Transaksi Timbang yang Dibayar <span className="text-red-500">*</span>
            </label>
            {memberEligibleTrx.length === 0 ? (
              <p className="text-xs text-amber-700 p-3 bg-amber-50 rounded-lg border border-amber-200">
                Anggota ini tidak memiliki transaksi terkonfirmasi yang menunggu pembayaran.
              </p>
            ) : (
              <select
                required
                value={selectedTrxId}
                onChange={(e) => setSelectedTrxId(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                {memberEligibleTrx.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.transactionNo} - Netto {formatKg(t.netWeight)} (Sisa Kewajiban:{" "}
                    {formatRupiah(t.remainingAmount)})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nominal Pembayaran (Rp)"
              type="number"
              required
              value={payAmount}
              onChange={(e) =>
                setPayAmount(e.target.value === "" ? "" : parseFloat(e.target.value))
              }
              helperText="Bisa diisi sebagian atau penuh"
            />

            <Select
              label="Metode Pembayaran"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
            >
              <option value="TRANSFER">Transfer Bank</option>
              <option value="TUNAI">Tunai / Kas Koperasi</option>
            </Select>
          </div>

          <Input
            label="Nomor Referensi Bank / No Bukti"
            placeholder="cth: BRI-776211990"
            value={bankReference}
            onChange={(e) => setBankReference(e.target.value)}
          />

          <Textarea
            label="Catatan Pembayaran"
            rows={2}
            placeholder="Keterangan pencairan..."
            value={payNotes}
            onChange={(e) => setPayNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={memberEligibleTrx.length === 0}
              isLoading={isSubmitting}
            >
              Proses Pembayaran
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Kuitansi Pembayaran Resmi (Printable Receipt) */}
      {selectedPayment && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Kuitansi Resmi Pembayaran TBS"
          maxWidth="xl"
        >
          <div className="space-y-6">
            <div className="ticket-print-area p-6 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900 space-y-4">
              {/* Header */}
              <div className="text-center pb-3 border-b-2 border-slate-800">
                <h3 className="font-bold text-base uppercase tracking-tight">
                  Koperasi Produsen Sawit Makmur Bersama
                </h3>
                <p className="text-[10px] text-slate-600">
                  Jl. Raya Pekanbaru - Bangkinang Km. 24, Kampar, Riau • Telp. 0761-884210
                </p>
                <div className="mt-2 text-xs font-bold bg-slate-100 py-1 uppercase tracking-widest border border-slate-200">
                  KUITANSI PEMBAYARAN HASIL PANEN TBS
                </div>
              </div>

              {/* Data Kuitansi */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">NO. KUITANSI:</span>
                  <span className="font-bold">{selectedPayment.paymentNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TANGGAL PENCAIRAN:</span>
                  <span>{formatDateIndo(selectedPayment.paymentDate, true)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">DIBAYARKAN KEPADA:</span>
                  <span className="font-bold">
                    {selectedPayment.member?.fullName} ({selectedPayment.member?.memberNo})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">METODE PEMBAYARAN:</span>
                  <span>
                    {selectedPayment.paymentMethod}{" "}
                    {selectedPayment.bankReference && `(Ref: ${selectedPayment.bankReference})`}
                  </span>
                </div>
              </div>

              {/* Alokasi Transaksi yang Dibayar */}
              <div className="border-t border-b border-slate-300 py-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">
                  ALOKASI TRANSAKSI PENIMBANGAN:
                </span>
                {selectedPayment.allocations?.map((alloc: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span>
                      {alloc.transaction?.transactionNo || "Transaksi TBS"}{" "}
                      {alloc.transaction?.netWeight && `(${formatKg(alloc.transaction.netWeight)})`}
                    </span>
                    <span className="font-bold">{formatRupiah(alloc.allocatedAmount)}</span>
                  </div>
                ))}
              </div>

              {/* Total Payout */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                <span>TOTAL DANA DICAIRKAN:</span>
                <span className="text-base text-emerald-800">
                  {formatRupiah(selectedPayment.totalAmount)}
                </span>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 text-center text-xs">
                <div>
                  <p className="text-slate-500">Bendahara / Kasir Koperasi,</p>
                  <div className="h-14" />
                  <p className="font-bold border-t border-slate-400 mx-6 pt-1">
                    ( {selectedPayment.createdBy?.name || "Bagian Keuangan"} )
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Penerima (Petani Anggota),</p>
                  <div className="h-14" />
                  <p className="font-bold border-t border-slate-400 mx-6 pt-1">
                    ( {selectedPayment.member?.fullName || "Anggota"} )
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 print:hidden">
              <Button variant="ghost" onClick={() => setIsReceiptModalOpen(false)}>
                Tutup
              </Button>
              <Button onClick={() => window.print()} className="gap-2">
                <Printer className="w-4 h-4" />
                Cetak Kuitansi Resmi
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  Search,
  Filter,
  Plus,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, TransactionStatusBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { formatRupiah, formatKg, formatDateIndo, formatShortDate } from "@/lib/utils";

export default function TransaksiListPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [memberFilter, setMemberFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(memberFilter !== "ALL" && { memberId: memberFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const res = await fetch(`/api/transactions?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/members?limit=1000")
      .then((r) => r.json())
      .then((d) => setMembers(d.items || []));
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter, memberFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleVerify = async (trx: any) => {
    if (!confirm(`Verifikasi transaksi timbang ${trx.transactionNo} milik ${trx.member?.fullName}?`)) return;

    try {
      const res = await fetch(`/api/transactions/${trx.id}/verify`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Gagal verifikasi" });
        return;
      }
      setFeedback({ type: "success", message: `Transaksi ${trx.transactionNo} berhasil diverifikasi!` });
      fetchTransactions();
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan koneksi" });
    }
  };

  const openTicketModal = (trx: any) => {
    setSelectedTrx(trx);
    setIsTicketModalOpen(true);
  };

  const openCancelModal = (trx: any) => {
    setSelectedTrx(trx);
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrx || !cancelReason.trim()) return;

    setIsSubmittingCancel(true);
    try {
      const res = await fetch(`/api/transactions/${selectedTrx.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Gagal membatalkan transaksi" });
        setIsSubmittingCancel(false);
        return;
      }

      setIsCancelModalOpen(false);
      setFeedback({
        type: "success",
        message: `Transaksi ${selectedTrx.transactionNo} berhasil dibatalkan.`,
      });
      fetchTransactions();
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan koneksi" });
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const printTicket = () => {
    window.print();
  };

  const exportUrl = `/api/transactions?export=csv${memberFilter !== "ALL" ? `&memberId=${memberFilter}` : ""}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}${startDate ? `&startDate=${startDate}` : ""}${endDate ? `&endDate=${endDate}` : ""}`;

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Transaksi Penimbangan TBS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data operasional jembatan timbang, verifikasi hasil panen, dan pencetakan tiket timbang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a href={exportUrl} download>
            <Button variant="outline" size="sm" className="gap-1.5 shadow-xs">
              <Download className="w-4 h-4" />
              Ekspor CSV
            </Button>
          </a>
          <Link href="/admin/transaksi/tambah">
            <Button size="sm" className="gap-1.5 shadow-xs">
              <Plus className="w-4 h-4" />
              Timbang TBS Baru
            </Button>
          </Link>
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} className="mb-4" />}

      {/* Filter and Date Range Card */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative w-full lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari no. transaksi, tiket, nama petani..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1b4332]/20"
              />
            </div>

            <div>
              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white"
              >
                <option value="ALL">Semua Petani</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white"
              >
                <option value="ALL">Semua Status</option>
                <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
                <option value="TERKONFIRMASI">Terkonfirmasi</option>
                <option value="SIAP_DIBAYAR">Siap Dibayar</option>
                <option value="DIBAYAR_SEBAGIAN">Dibayar Sebagian</option>
                <option value="LUNAS">Lunas</option>
                <option value="DRAFT">Draft</option>
                <option value="DIBATALKAN">Dibatalkan</option>
              </select>
            </div>

            <Button type="submit" size="sm" variant="secondary" className="w-full">
              Terapkan Filter
            </Button>
          </form>

          {/* Date range filter sub-row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-medium">Filter Rentang Tanggal:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="py-1 px-2 rounded-md border border-slate-200 text-xs bg-white"
            />
            <span>s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="py-1 px-2 rounded-md border border-slate-200 text-xs bg-white"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  fetchTransactions();
                }}
                className="text-xs text-rose-600 hover:underline"
              >
                Reset Tanggal
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No Transaksi & Tanggal</th>
                  <th className="px-4 py-3">Petani & Kebun</th>
                  <th className="px-4 py-3 text-right">Bruto - Tara</th>
                  <th className="px-4 py-3 text-right">Potongan</th>
                  <th className="px-4 py-3 text-right">Netto (kg)</th>
                  <th className="px-4 py-3 text-right">Nilai Kotor</th>
                  <th className="px-4 py-3 text-right">Sisa Hak</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      Memuat transaksi timbang TBS...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      Tidak ada transaksi timbang yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold font-mono text-[#1b4332]">{trx.transactionNo}</div>
                        <div className="text-[11px] text-slate-400">
                          {formatShortDate(trx.date)} {trx.ticketNo && `• Tiket: ${trx.ticketNo}`}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{trx.member?.fullName}</div>
                        <div className="text-[11px] text-slate-400">{trx.farm?.name}</div>
                      </td>
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
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                        {formatRupiah(trx.grossAmount)}
                        <span className="block text-[10px] font-normal text-slate-400">
                          @Rp {Number(trx.pricePerKg).toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-amber-800">
                        {formatRupiah(trx.remainingAmount)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <TransactionStatusBadge status={trx.status} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openTicketModal(trx)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-md hover:bg-slate-100"
                            title="Cetak Tiket Timbang"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {(trx.status === "MENUNGGU_VERIFIKASI" || trx.status === "DRAFT") && (
                            <button
                              onClick={() => handleVerify(trx)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-md hover:bg-emerald-50"
                              title="Verifikasi Transaksi"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {trx.status !== "DIBATALKAN" && Number(trx.paidAmount) === 0 && (
                            <button
                              onClick={() => openCancelModal(trx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100"
                              title="Batalkan Transaksi"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
                Halaman {page} dari {totalPages} (Total {total} transaksi timbang)
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

      {/* Modal Cetak Tiket Timbang (Printable Weighbridge Ticket) */}
      {selectedTrx && (
        <Modal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          title="Tiket Resmi Penimbangan TBS"
          maxWidth="xl"
        >
          <div className="space-y-6">
            {/* Ticket Print Sheet Area */}
            <div className="ticket-print-area p-6 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900 space-y-4">
              {/* Header Tiket */}
              <div className="text-center pb-3 border-b-2 border-slate-800">
                <h3 className="font-bold text-base uppercase tracking-tight">
                  Koperasi Produsen Sawit Makmur Bersama
                </h3>
                <p className="text-[10px] text-slate-600">
                  Badan Hukum No. 518/BH/DISKOP/2018 • Telp. 0761-884210
                </p>
                <p className="text-[10px] text-slate-600">
                  Pos Jembatan Timbang Jl. Raya Pekanbaru - Bangkinang Km. 24, Kampar, Riau
                </p>
                <div className="mt-2 text-xs font-bold bg-slate-100 py-1 uppercase tracking-widest border border-slate-200">
                  TIKET PENIMBANGAN TANDAN BUAH SEGAR (TBS)
                </div>
              </div>

              {/* Data Identitas */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">NO. TRANSAKSI:</span>
                  <span className="font-bold">{selectedTrx.transactionNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TANGGAL & WAKTU:</span>
                  <span>{formatDateIndo(selectedTrx.date, true)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">PETANI / ANGGOTA:</span>
                  <span className="font-bold">
                    {selectedTrx.member?.fullName} ({selectedTrx.member?.memberNo})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">LAHAN KEBUN:</span>
                  <span>
                    {selectedTrx.farm?.name} ({selectedTrx.farm?.code})
                  </span>
                </div>
              </div>

              {/* Rincian Timbang */}
              <div className="border-t border-b border-slate-300 py-3 space-y-1.5">
                <div className="flex justify-between">
                  <span>BERAT BRUTO (MUATAN):</span>
                  <span className="font-bold">{formatKg(selectedTrx.grossWeight)}</span>
                </div>
                <div className="flex justify-between">
                  <span>BERAT TARA (KOSONG):</span>
                  <span>-{formatKg(selectedTrx.tareWeight)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>BERAT SETELAH TARA:</span>
                  <span>
                    {formatKg(
                      Math.max(0, Number(selectedTrx.grossWeight) - Number(selectedTrx.tareWeight))
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>POTONGAN FRAKSI/SAMPAH ({selectedTrx.deductionPercentage}%):</span>
                  <span>
                    -
                    {formatKg(
                      (Math.max(0, Number(selectedTrx.grossWeight) - Number(selectedTrx.tareWeight)) *
                        Number(selectedTrx.deductionPercentage)) /
                        100
                    )}
                  </span>
                </div>
                {Number(selectedTrx.deductionWeightKg) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>POTONGAN TAMBAHAN:</span>
                    <span>-{formatKg(selectedTrx.deductionWeightKg)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-slate-200">
                  <span>BERAT BERSIH (NETTO TBS):</span>
                  <span>{formatKg(selectedTrx.netWeight)}</span>
                </div>
              </div>

              {/* Harga & Nilai */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span>HARGA TBS SATUAN:</span>
                  <span className="font-bold">
                    Rp {Number(selectedTrx.pricePerKg).toLocaleString("id-ID")} / kg
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL NILAI TRANSAKSI:</span>
                  <span>{formatRupiah(selectedTrx.grossAmount)}</span>
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="pt-6 grid grid-cols-2 text-center text-xs">
                <div>
                  <p className="text-slate-500">Petugas Timbang,</p>
                  <div className="h-14" />
                  <p className="font-bold border-t border-slate-400 mx-6 pt-1">
                    ( {selectedTrx.recordedBy?.name || "Petugas Lapangan"} )
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Petani / Supir Armada,</p>
                  <div className="h-14" />
                  <p className="font-bold border-t border-slate-400 mx-6 pt-1">
                    ( {selectedTrx.member?.fullName || "Anggota"} )
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 print:hidden">
              <Button variant="ghost" onClick={() => setIsTicketModalOpen(false)}>
                Tutup
              </Button>
              <Button onClick={printTicket} className="gap-2">
                <Printer className="w-4 h-4" />
                Cetak Tiket Sekarang
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Batalkan Transaksi */}
      {selectedTrx && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Pembatalan Transaksi Timbang"
          description={`Membatalkan nomor transaksi: ${selectedTrx.transactionNo}`}
        >
          <form onSubmit={handleCancelSubmit} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              Perhatian: Pembatalan transaksi akan dicatat permanen dalam Audit Log. Transaksi yang telah memiliki pembayaran tidak dapat dibatalkan.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan Pembatalan Transaksi <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="cth: Kesalahan input armada atau timbangan dikalibrasi ulang"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCancelModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="danger"
                isLoading={isSubmittingCancel}
              >
                Konfirmasi Batalkan Transaksi
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

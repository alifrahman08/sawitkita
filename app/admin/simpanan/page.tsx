"use client";

import React, { useState, useEffect } from "react";
import {
  PiggyBank,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { formatRupiah, formatDateIndo, formatShortDate } from "@/lib/utils";

export default function SimpananPage() {
  const [mutations, setMutations] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [memberFilter, setMemberFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"mutations" | "accounts">("mutations");

  // Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedMutation, setSelectedMutation] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    memberId: "",
    type: "SETORAN" as "SETORAN" | "PENARIKAN" | "KOREKSI",
    category: "SUKARELA" as "POKOK" | "WAJIB" | "SUKARELA",
    amount: 100000,
    referenceNo: "",
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        ...(search && { search }),
        ...(typeFilter !== "ALL" && { type: typeFilter }),
        ...(categoryFilter !== "ALL" && { category: categoryFilter }),
        ...(memberFilter !== "ALL" && { memberId: memberFilter }),
      });

      const [savingsRes, memRes] = await Promise.all([
        fetch(`/api/savings?${query.toString()}`),
        fetch("/api/members?limit=1000"),
      ]);

      const savingsData = await savingsRes.json();
      const memData = await memRes.json();

      setMutations(savingsData.mutations || []);
      setAccounts(savingsData.accounts || []);
      setMembers(memData.items || []);

      if (memData.items?.length > 0 && !formData.memberId) {
        setFormData((prev) => ({ ...prev, memberId: memData.items[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, categoryFilter, memberFilter]);

  // Aggregate stats
  const totalSimpananSemua = accounts.reduce((acc, a) => acc + Number(a.totalBalance), 0);
  const totalPokokSemua = accounts.reduce((acc, a) => acc + Number(a.principalBalance), 0);
  const totalWajibSemua = accounts.reduce((acc, a) => acc + Number(a.mandatoryBalance), 0);
  const totalSukarelaSemua = accounts.reduce((acc, a) => acc + Number(a.voluntaryBalance), 0);

  const openRecordModal = (defaultType: "SETORAN" | "PENARIKAN") => {
    setFormData({
      memberId: members[0]?.id || "",
      type: defaultType,
      category: defaultType === "PENARIKAN" ? "SUKARELA" : "WAJIB",
      amount: 100000,
      referenceNo: `MUT-${Date.now().toString().slice(-6)}`,
      notes: defaultType === "SETORAN" ? "Setoran simpanan rutin" : "Penarikan simpanan sukarela",
    });
    setFormError("");
    setIsRecordModalOpen(true);
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.memberId) {
      setFormError("Silakan pilih anggota petani.");
      return;
    }
    if (formData.amount <= 0) {
      setFormError("Nominal mutasi harus lebih besar dari 0 Rupiah.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Gagal mencatat mutasi simpanan.");
        setIsSubmitting(false);
        return;
      }

      setIsRecordModalOpen(false);
      setFeedback({
        type: "success",
        message: `Mutasi ${formData.type} ${formData.category} sebesar ${formatRupiah(formData.amount)} berhasil dicatat!`,
      });
      fetchData();
    } catch {
      setFormError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReceipt = (mut: any) => {
    setSelectedMutation(mut);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Buku Besar Simpanan Anggota
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan buku simpanan pokok, wajib, dan sukarela dengan jejak mutasi lengkap
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a href="/api/savings?export=csv" download>
            <Button variant="outline" size="sm" className="gap-1.5 shadow-xs">
              <Download className="w-4 h-4" />
              Ekspor CSV
            </Button>
          </a>
          <Button
            size="sm"
            onClick={() => openRecordModal("SETORAN")}
            className="gap-1.5 shadow-xs bg-[#1b4332]"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Catat Setoran
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openRecordModal("PENARIKAN")}
            className="gap-1.5 shadow-xs"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
            Tarik Simpanan
          </Button>
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} className="mb-4" />}

      {/* Aggregate Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-[#1b4332] to-[#2d6a4f] text-white">
          <CardContent className="p-5">
            <span className="text-xs text-emerald-200 uppercase font-semibold tracking-wider block">
              Total Dana Simpanan
            </span>
            <span className="text-2xl font-black mt-1 block">
              {formatRupiah(totalSimpananSemua)}
            </span>
            <span className="text-[11px] text-emerald-200 mt-1 block">
              Dari {accounts.length} rekening anggota
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-medium block">Total Simpanan Pokok</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {formatRupiah(totalPokokSemua)}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Modal dasar keanggotaan</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-medium block">Total Simpanan Wajib</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {formatRupiah(totalWajibSemua)}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Iuran bulanan anggota</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-medium block">Total Simpanan Sukarela</span>
            <span className="text-xl font-bold text-emerald-700 mt-1 block">
              {formatRupiah(totalSukarelaSemua)}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Dapat ditarik sewaktu-waktu</span>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("mutations")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "mutations"
              ? "border-[#1b4332] text-[#1b4332]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Jurnal Mutasi Simpanan
        </button>
        <button
          onClick={() => setActiveTab("accounts")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "accounts"
              ? "border-[#1b4332] text-[#1b4332]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Daftar Rekening & Saldo Anggota ({accounts.length})
        </button>
      </div>

      {activeTab === "mutations" ? (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <select
                    value={memberFilter}
                    onChange={(e) => setMemberFilter(e.target.value)}
                    className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="ALL">Semua Anggota</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="ALL">Semua Jenis Mutasi</option>
                    <option value="SETORAN">Setoran (+)</option>
                    <option value="PENARIKAN">Penarikan (-)</option>
                    <option value="KOREKSI">Koreksi Pembukuan</option>
                  </select>
                </div>

                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="POKOK">Simpanan Pokok</option>
                    <option value="WAJIB">Simpanan Wajib</option>
                    <option value="SUKARELA">Simpanan Sukarela</option>
                  </select>
                </div>

                <div>
                  <Input
                    placeholder="Cari no mutasi / referensi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mutations Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">No Mutasi & Tanggal</th>
                      <th className="px-4 py-3">Nama Anggota</th>
                      <th className="px-4 py-3">Jenis & Kategori</th>
                      <th className="px-4 py-3 text-right">Nominal</th>
                      <th className="px-4 py-3 text-right">Saldo Berjalan</th>
                      <th className="px-4 py-3">Keterangan</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                          Memuat mutasi simpanan...
                        </td>
                      </tr>
                    ) : mutations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                          Belum ada transaksi mutasi simpanan.
                        </td>
                      </tr>
                    ) : (
                      mutations.map((mut) => (
                        <tr key={mut.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-bold font-mono text-[#1b4332]">{mut.mutationNo}</div>
                            <div className="text-[11px] text-slate-400">{formatShortDate(mut.mutationDate)}</div>
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-900">
                            {mut.member?.fullName}
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
                            <span className="ml-2 text-xs text-slate-500">
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
                          <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                            {formatRupiah(mut.balanceAfter)}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 text-xs max-w-xs truncate">
                            {mut.notes || "-"}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReceipt(mut)}
                              className="h-8 gap-1 text-xs"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Bukti
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
        </>
      ) : (
        /* Accounts Table */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">No. Anggota</th>
                    <th className="px-4 py-3">Nama Lengkap</th>
                    <th className="px-4 py-3 text-right">Simpanan Pokok</th>
                    <th className="px-4 py-3 text-right">Simpanan Wajib</th>
                    <th className="px-4 py-3 text-right">Simpanan Sukarela</th>
                    <th className="px-4 py-3 text-right">Total Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold font-mono text-[#1b4332]">
                        {acc.member?.memberNo || "-"}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        {acc.member?.fullName}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-700">
                        {formatRupiah(acc.principalBalance)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-700">
                        {formatRupiah(acc.mandatoryBalance)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-700">
                        {formatRupiah(acc.voluntaryBalance)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-emerald-800">
                        {formatRupiah(acc.totalBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Catat Mutasi */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title={`Pencatatan ${formData.type} Simpanan`}
        description="Pencatatan langsung memperbarui buku besar dan mencatat audit log mutasi"
      >
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <Select
            label="Pilih Anggota Petani"
            required
            value={formData.memberId}
            onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.memberNo})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Jenis Mutasi"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="SETORAN">Setoran (+)</option>
              <option value="PENARIKAN">Penarikan (-)</option>
              <option value="KOREKSI">Koreksi</option>
            </Select>

            <Select
              label="Kategori Simpanan"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            >
              <option value="POKOK">Simpanan Pokok</option>
              <option value="WAJIB">Simpanan Wajib</option>
              <option value="SUKARELA">Simpanan Sukarela</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nominal (Rupiah)"
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Nomor Referensi / Slip"
              placeholder="cth: SLIP-1025-01"
              value={formData.referenceNo}
              onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
            />
          </div>

          <Textarea
            label="Keterangan Transaksi"
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsRecordModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan Mutasi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Bukti Mutasi Simpanan */}
      {selectedMutation && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Bukti Mutasi Simpanan Koperasi"
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div className="ticket-print-area p-6 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900 space-y-4">
              <div className="text-center pb-3 border-b-2 border-slate-800">
                <h3 className="font-bold text-base uppercase">
                  Koperasi Produsen Sawit Makmur Bersama
                </h3>
                <p className="text-[10px] text-slate-600">
                  BUKTI TRANSAKSI SIMPANAN ANGGOTA KOPERASI
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">NO. MUTASI:</span>
                  <span className="font-bold">{selectedMutation.mutationNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TANGGAL:</span>
                  <span>{formatDateIndo(selectedMutation.mutationDate, true)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">NAMA ANGGOTA:</span>
                  <span className="font-bold">{selectedMutation.member?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">KATEGORI:</span>
                  <span>Simpanan {selectedMutation.category}</span>
                </div>
              </div>

              <div className="border-t border-b border-slate-300 py-3 flex justify-between items-center text-sm">
                <span>NOMINAL {selectedMutation.type}:</span>
                <span className="font-black text-emerald-800">
                  {formatRupiah(selectedMutation.amount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span>SALDO SETELAH TRANSAKSI:</span>
                <span className="font-bold">{formatRupiah(selectedMutation.balanceAfter)}</span>
              </div>

              <div className="pt-6 grid grid-cols-2 text-center text-xs">
                <div>
                  <p className="text-slate-500">Petugas Koperasi,</p>
                  <div className="h-12" />
                  <p className="font-bold border-t border-slate-400 mx-6 pt-1">
                    ( Bagian Simpan Pinjam )
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Anggota,</p>
                  <div className="h-12" />
                  <p className="font-bold border-t border-slate-400 mx-6 pt-1">
                    ( {selectedMutation.member?.fullName} )
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
                Cetak Slip Bukti
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

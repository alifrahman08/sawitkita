"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  CreditCard,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge, MemberStatusBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { formatRupiah, formatKg, formatDateIndo } from "@/lib/utils";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    memberNo: "",
    fullName: "",
    nik: "",
    phone: "",
    address: "",
    bankName: "BRI",
    bankAccount: "",
    bankHolder: "",
    status: "AKTIF",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      });

      const res = await fetch(`/api/members?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setMembers(data.items || []);
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
    fetchMembers();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  };

  const openAddModal = () => {
    const nextNum = total + 1;
    setFormData({
      memberNo: `ANG-${String(nextNum).padStart(3, "0")}`,
      fullName: "",
      nik: "",
      phone: "",
      address: "",
      bankName: "BRI",
      bankAccount: "",
      bankHolder: "",
      status: "AKTIF",
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const openEditModal = (member: any) => {
    setSelectedMember(member);
    setFormData({
      memberNo: member.memberNo,
      fullName: member.fullName,
      nik: member.nik || "",
      phone: member.phone,
      address: member.address,
      bankName: member.bankName || "BRI",
      bankAccount: member.bankAccount || "",
      bankHolder: member.bankHolder || "",
      status: member.status,
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const openDetailModal = async (member: any) => {
    try {
      const res = await fetch(`/api/members/${member.id}`);
      const detailed = await res.json();
      setSelectedMember(detailed);
      setIsDetailModalOpen(true);
    } catch {
      setSelectedMember(member);
      setIsDetailModalOpen(true);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Gagal menambahkan anggota");
        setIsSubmitting(false);
        return;
      }

      setIsAddModalOpen(false);
      setFeedback({ type: "success", message: `Anggota ${formData.fullName} berhasil ditambahkan!` });
      fetchMembers();
    } catch (err: any) {
      setFormError("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/members/${selectedMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Gagal memperbarui data anggota");
        setIsSubmitting(false);
        return;
      }

      setIsEditModalOpen(false);
      setFeedback({ type: "success", message: `Data anggota ${formData.fullName} berhasil diperbarui!` });
      fetchMembers();
    } catch {
      setFormError("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (member: any) => {
    const isDeactivating = member.status === "AKTIF";
    const confirmMsg = isDeactivating
      ? `Apakah Anda yakin ingin menonaktifkan anggota ${member.fullName}? Data historis transaksi akan tetap tersimpan.`
      : `Aktifkan kembali anggota ${member.fullName}?`;

    if (!confirm(confirmMsg)) return;

    try {
      if (isDeactivating) {
        await fetch(`/api/members/${member.id}`, { method: "DELETE" });
      } else {
        await fetch(`/api/members/${member.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "AKTIF" }),
        });
      }
      setFeedback({
        type: "success",
        message: `Status anggota ${member.fullName} berhasil diubah!`,
      });
      fetchMembers();
    } catch {
      setFeedback({ type: "error", message: "Gagal memperbarui status anggota." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Anggota Petani</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data registrasi anggota koperasi, nomor anggota, NIK, dan rekening bank
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a href="/api/members?export=csv" download>
            <Button variant="outline" size="sm" className="gap-1.5 shadow-xs">
              <Download className="w-4 h-4" />
              Ekspor CSV
            </Button>
          </a>
          <Button size="sm" onClick={openAddModal} className="gap-1.5 shadow-xs">
            <Plus className="w-4 h-4" />
            Tambah Anggota Baru
          </Button>
        </div>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          className="mb-4"
        />
      )}

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, No Anggota, NIK, atau nomor HP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1b4332]/20 focus:border-[#1b4332]"
              />
            </div>

            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1b4332]/20"
              >
                <option value="ALL">Semua Status</option>
                <option value="AKTIF">Status: Aktif</option>
                <option value="NONAKTIF">Status: Nonaktif</option>
                <option value="PENDING">Status: Pending</option>
              </select>
            </div>

            <Button type="submit" size="sm" variant="secondary" className="w-full sm:w-auto">
              Cari
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID Anggota</th>
                  <th className="px-4 py-3">Nama Lengkap & NIK</th>
                  <th className="px-4 py-3">Kontak & Alamat</th>
                  <th className="px-4 py-3 text-center">Kebun</th>
                  <th className="px-4 py-3 text-right">Total Netto TBS</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Memuat data anggota koperasi...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      Tidak ada data anggota yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold font-mono text-[#1b4332]">
                        {member.memberNo}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{member.fullName}</div>
                        <div className="text-[11px] text-slate-400">NIK: {member.nik || "-"}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-slate-700 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {member.phone}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {member.address}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {member.farmCount || 0} kebun
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-900">
                        {formatKg(member.totalNetWeight)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <MemberStatusBadge status={member.status} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openDetailModal(member)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-md hover:bg-slate-100"
                            title="Lihat Detail Profil & Kebun"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 rounded-md hover:bg-slate-100"
                            title="Edit Data Anggota"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(member)}
                            className={`p-1.5 rounded-md hover:bg-slate-100 ${
                              member.status === "AKTIF"
                                ? "text-slate-500 hover:text-rose-600"
                                : "text-emerald-600 hover:text-emerald-700"
                            }`}
                            title={member.status === "AKTIF" ? "Nonaktifkan Anggota" : "Aktifkan Anggota"}
                          >
                            {member.status === "AKTIF" ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Menampilkan halaman <span className="font-semibold text-slate-800">{page}</span> dari{" "}
                <span className="font-semibold text-slate-800">{totalPages}</span> (Total {total} anggota)
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

      {/* Modal Tambah Anggota */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Pendaftaran Anggota Petani Baru"
        description="Lengkapi data profil anggota koperasi beserta informasi rekening pencairan"
      >
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        <form onSubmit={handleCreateMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nomor Anggota"
              required
              value={formData.memberNo}
              onChange={(e) => setFormData({ ...formData, memberNo: e.target.value })}
            />
            <Input
              label="Nomor KTP / NIK"
              placeholder="16 digit NIK"
              maxLength={16}
              value={formData.nik}
              onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nama Lengkap Petani"
              required
              placeholder="Nama sesuai KTP"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <Input
              label="Nomor Telepon / WhatsApp"
              required
              placeholder="0812XXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Textarea
            label="Alamat Lengkap Domisili"
            required
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Rekening Bank Pencairan Hasil Panen (Opsional)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Bank"
                placeholder="BRI / Mandiri"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
              <Input
                label="No. Rekening"
                placeholder="0123-XXXX-XXXX"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
              />
              <Input
                label="Nama Pemilik"
                placeholder="Atas nama"
                value={formData.bankHolder}
                onChange={(e) => setFormData({ ...formData, bankHolder: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan Anggota Baru
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Anggota */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Data Anggota Petani"
        description="Perbarui informasi profil atau status keanggotaan"
      >
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        <form onSubmit={handleUpdateMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nomor Anggota"
              required
              disabled
              value={formData.memberNo}
              onChange={(e) => setFormData({ ...formData, memberNo: e.target.value })}
            />
            <Select
              label="Status Keanggotaan"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="AKTIF">AKTIF</option>
              <option value="NONAKTIF">NONAKTIF</option>
              <option value="PENDING">PENDING</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nama Lengkap Petani"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <Input
              label="Nomor KTP / NIK"
              maxLength={16}
              value={formData.nik}
              onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
            />
          </div>

          <Input
            label="Nomor Telepon / WhatsApp"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Textarea
            label="Alamat Lengkap Domisili"
            required
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Rekening Bank Pencairan
            </span>
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Bank"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
              <Input
                label="No. Rekening"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
              />
              <Input
                label="Nama Pemilik"
                value={formData.bankHolder}
                onChange={(e) => setFormData({ ...formData, bankHolder: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Perbarui Data
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Anggota */}
      {selectedMember && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Detail Anggota: ${selectedMember.fullName}`}
          description={`Nomor Registrasi Koperasi: ${selectedMember.memberNo}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Profil Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-slate-400 block text-xs">Status Anggota</span>
                <MemberStatusBadge status={selectedMember.status} />
              </div>
              <div>
                <span className="text-slate-400 block text-xs">NIK KTP</span>
                <span className="font-semibold text-slate-800">{selectedMember.nik || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">No. Telepon / WA</span>
                <span className="font-semibold text-slate-800">{selectedMember.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Tanggal Bergabung</span>
                <span className="font-semibold text-slate-800">{formatDateIndo(selectedMember.joinDate)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-xs">Rekening Bank</span>
                <span className="font-semibold text-slate-800">
                  {selectedMember.bankName ? `${selectedMember.bankName} - ${selectedMember.bankAccount} a.n ${selectedMember.bankHolder}` : "Belum didaftarkan"}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-slate-400 block text-xs">Alamat Domisili</span>
                <span className="text-slate-700">{selectedMember.address}</span>
              </div>
            </div>

            {/* Simpanan Overview */}
            {selectedMember.savings && (
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Buku Simpanan Koperasi</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-emerald-700 block text-[10px] font-medium">Total Simpanan</span>
                    <span className="font-bold text-emerald-950 text-base">
                      {formatRupiah(selectedMember.savings.totalBalance)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Simpanan Pokok</span>
                    <span className="font-semibold text-slate-800">
                      {formatRupiah(selectedMember.savings.principalBalance)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Simpanan Wajib</span>
                    <span className="font-semibold text-slate-800">
                      {formatRupiah(selectedMember.savings.mandatoryBalance)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Simpanan Sukarela</span>
                    <span className="font-semibold text-slate-800">
                      {formatRupiah(selectedMember.savings.voluntaryBalance)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Farms Registered */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Lahan Kebun Terdaftar ({selectedMember.farms?.length || 0})</h4>
              {selectedMember.farms && selectedMember.farms.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedMember.farms.map((f: any) => (
                    <div key={f.id} className="p-3 flex items-center justify-between bg-white text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{f.name}</span>
                        <span className="font-mono text-emerald-700 ml-2">({f.code})</span>
                        <p className="text-slate-500 text-[11px]">
                          {f.village}, Kec. {f.district}, {f.regency} {f.plantingYear && `• Th Tanam ${f.plantingYear}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{f.areaHectares} Ha</span>
                        <span className="block text-[10px] text-emerald-600 font-medium">{f.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">Belum ada lahan kebun yang didaftarkan untuk anggota ini.</p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Layers,
  Scale,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { formatKg } from "@/lib/utils";

export default function FarmsPage() {
  const [farms, setFarms] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [memberFilter, setMemberFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    memberId: "",
    areaHectares: 2.0,
    village: "",
    district: "",
    regency: "Kampar",
    plantingYear: 2018,
    status: "PRODUKTIF",
    notes: "",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const farmQuery = new URLSearchParams({
        ...(search && { search }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(memberFilter !== "ALL" && { memberId: memberFilter }),
      });

      const [farmRes, memberRes] = await Promise.all([
        fetch(`/api/farms?${farmQuery.toString()}`),
        fetch("/api/members?limit=1000"),
      ]);

      const farmData = await farmRes.json();
      const memberData = await memberRes.json();

      setFarms(farmData.items || []);
      setMembers(memberData.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, memberFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const openAddModal = () => {
    const nextCode = `KBN-${String(farms.length + 1).padStart(3, "0")}`;
    setFormData({
      code: nextCode,
      name: "",
      memberId: members[0]?.id || "",
      areaHectares: 2.5,
      village: "Sei Suka",
      district: "Tapung",
      regency: "Kampar",
      plantingYear: 2018,
      status: "PRODUKTIF",
      notes: "",
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const openEditModal = (farm: any) => {
    setSelectedFarm(farm);
    setFormData({
      code: farm.code,
      name: farm.name,
      memberId: farm.memberId,
      areaHectares: Number(farm.areaHectares),
      village: farm.village,
      district: farm.district,
      regency: farm.regency,
      plantingYear: farm.plantingYear || 2018,
      status: farm.status,
      notes: farm.notes || "",
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          areaHectares: Number(formData.areaHectares),
          plantingYear: formData.plantingYear ? Number(formData.plantingYear) : null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Gagal menyimpan data kebun");
        setIsSubmitting(false);
        return;
      }

      setIsAddModalOpen(false);
      setFeedback({ type: "success", message: `Kebun ${formData.name} berhasil didaftarkan!` });
      fetchData();
    } catch {
      setFormError("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarm) return;
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/farms/${selectedFarm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          areaHectares: Number(formData.areaHectares),
          plantingYear: formData.plantingYear ? Number(formData.plantingYear) : null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Gagal memperbarui kebun");
        setIsSubmitting(false);
        return;
      }

      setIsEditModalOpen(false);
      setFeedback({ type: "success", message: `Data kebun ${formData.name} berhasil diperbarui!` });
      fetchData();
    } catch {
      setFormError("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFarm = async (farm: any) => {
    if (!confirm(`Apakah Anda yakin ingin menonaktifkan kebun ${farm.name} (${farm.code})?`)) return;

    try {
      await fetch(`/api/farms/${farm.id}`, { method: "DELETE" });
      setFeedback({ type: "success", message: `Kebun ${farm.name} dinonaktifkan.` });
      fetchData();
    } catch {
      setFeedback({ type: "error", message: "Gagal menghapus kebun." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Lahan Kebun Sawit</h1>
          <p className="text-xs text-slate-500 mt-1">
            Data kebun anggota petani, luas areal (hektare), lokasi administratif, dan tahun tanam
          </p>
        </div>

        <Button size="sm" onClick={openAddModal} className="gap-1.5 shadow-xs">
          <Plus className="w-4 h-4" />
          Tambah Lahan Kebun Baru
        </Button>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} className="mb-4" />}

      {/* Filter and Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama kebun, kode, desa, atau kecamatan..."
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
                <option value="ALL">Semua Pemilik Anggota</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.memberNo})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white"
              >
                <option value="ALL">Semua Status</option>
                <option value="PRODUKTIF">Status: Produktif</option>
                <option value="PEREMAJAAN">Status: Peremajaan (Replanting)</option>
                <option value="NONAKTIF">Status: Nonaktif</option>
              </select>
            </div>

            <Button type="submit" size="sm" variant="secondary" className="w-full sm:w-auto">
              Cari
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Farms Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Kode Kebun</th>
                  <th className="px-4 py-3">Nama Lahan Kebun</th>
                  <th className="px-4 py-3">Anggota Pemilik</th>
                  <th className="px-4 py-3">Lokasi (Desa/Kec/Kab)</th>
                  <th className="px-4 py-3 text-right">Luas Lahan</th>
                  <th className="px-4 py-3 text-center">Th Tanam</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      Memuat data kebun sawit...
                    </td>
                  </tr>
                ) : farms.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      Tidak ada data kebun yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  farms.map((farm) => (
                    <tr key={farm.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold font-mono text-[#1b4332]">
                        {farm.code}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{farm.name}</div>
                        {farm.notes && <div className="text-[11px] text-slate-400">{farm.notes}</div>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{farm.memberName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{farm.memberNo}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {farm.village}, Kec. {farm.district}, {farm.regency}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                        {farm.areaHectares} Ha
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-600">
                        {farm.plantingYear || "-"}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge
                          variant={
                            farm.status === "PRODUKTIF"
                              ? "success"
                              : farm.status === "PEREMAJAAN"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {farm.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(farm)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 rounded-md hover:bg-slate-100"
                            title="Edit Kebun"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFarm(farm)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md hover:bg-slate-100"
                            title="Hapus / Nonaktifkan Kebun"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Tambah Kebun */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Daftarkan Lahan Kebun Baru"
        description="Hubungkan lahan kebun dengan anggota pemilik dan isi koordinat administratif"
      >
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        <form onSubmit={handleCreateFarm} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Kode Kebun"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <Select
              label="Anggota Pemilik Kebun"
              required
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
            >
              <option value="">Pilih Anggota...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.memberNo})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nama / Label Kebun"
              required
              placeholder="cth: Kebun Sei Suka Blok A"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Luas Areal (Hektare)"
              type="number"
              step="0.01"
              required
              value={formData.areaHectares}
              onChange={(e) => setFormData({ ...formData, areaHectares: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Desa"
              required
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
            />
            <Input
              label="Kecamatan"
              required
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            />
            <Input
              label="Kabupaten"
              required
              value={formData.regency}
              onChange={(e) => setFormData({ ...formData, regency: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tahun Tanam"
              type="number"
              value={formData.plantingYear}
              onChange={(e) => setFormData({ ...formData, plantingYear: parseInt(e.target.value) || 0 })}
            />
            <Select
              label="Status Kebun"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="PRODUKTIF">PRODUKTIF</option>
              <option value="PEREMAJAAN">PEREMAJAAN (REPLANTING)</option>
              <option value="NONAKTIF">NONAKTIF</option>
            </Select>
          </div>

          <Textarea
            label="Catatan Kondisi Kebun / Jenis Bibit"
            rows={2}
            placeholder="cth: Varietas Marihat TM-4, topografi darat"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan Lahan Kebun
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Kebun */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Data Lahan Kebun"
        description="Perbarui informasi luas atau status produktivitas lahan"
      >
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        <form onSubmit={handleUpdateFarm} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Kode Kebun"
              required
              disabled
              value={formData.code}
            />
            <Select
              label="Anggota Pemilik"
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nama / Label Kebun"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Luas Areal (Hektare)"
              type="number"
              step="0.01"
              required
              value={formData.areaHectares}
              onChange={(e) => setFormData({ ...formData, areaHectares: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Desa"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
            />
            <Input
              label="Kecamatan"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            />
            <Input
              label="Kabupaten"
              value={formData.regency}
              onChange={(e) => setFormData({ ...formData, regency: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tahun Tanam"
              type="number"
              value={formData.plantingYear}
              onChange={(e) => setFormData({ ...formData, plantingYear: parseInt(e.target.value) || 0 })}
            />
            <Select
              label="Status Kebun"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="PRODUKTIF">PRODUKTIF</option>
              <option value="PEREMAJAAN">PEREMAJAAN</option>
              <option value="NONAKTIF">NONAKTIF</option>
            </Select>
          </div>

          <Textarea
            label="Catatan"
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Perbarui Data Kebun
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

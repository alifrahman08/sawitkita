"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Trash2,
  Calendar,
  Users,
  CheckCircle,
  Eye,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { formatDateIndo } from "@/lib/utils";

export default function PengumumanPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetRole: "SEMUA",
    isPublished: true,
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      setAnnouncements(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Gagal menerbitkan pengumuman");
        setIsSubmitting(false);
        return;
      }

      setIsAddModalOpen(false);
      setFeedback({ type: "success", message: "Pengumuman berhasil dipublikasikan!" });
      setFormData({
        title: "",
        content: "",
        targetRole: "SEMUA",
        isPublished: true,
      });
      fetchAnnouncements();
    } catch {
      setFormError("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Modul Pengumuman Koperasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Siarkan jadwal pencairan pembayaran, penetapan harga TBS, dan undangan rapat anggota
          </p>
        </div>

        <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-1.5 shadow-xs">
          <Plus className="w-4 h-4" />
          Buat Pengumuman Baru
        </Button>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} className="mb-4" />}

      {/* Announcements List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Memuat pengumuman...</div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Belum ada pengumuman yang diterbitkan.
          </div>
        ) : (
          announcements.map((ann) => (
            <Card key={ann.id} className="hover:border-slate-300 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-emerald-100 text-[#1b4332]">
                      <Bell className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{ann.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">
                      {formatDateIndo(ann.publishedAt, true)}
                    </span>
                    <Badge variant={ann.targetRole === "SEMUA" ? "default" : "info"}>
                      Target: {ann.targetRole}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-6 border-l-2 border-emerald-500">
                  {ann.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Tambah Pengumuman */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Publikasikan Pengumuman Koperasi"
        description="Pesan ini akan tampil di dashboard anggota dan portal manajemen"
      >
        {formError && <Alert type="error" message={formError} className="mb-4" />}
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Judul Pengumuman"
            required
            placeholder="cth: Jadwal Pencairan Pembayaran TBS Tahap II"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Select
            label="Target Penerima Pengumuman"
            value={formData.targetRole}
            onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
          >
            <option value="SEMUA">Semua Pengguna (Petani & Pengurus)</option>
            <option value="ANGGOTA">Khusus Anggota Petani</option>
            <option value="PENGURUS">Khusus Internal Pengurus</option>
          </Select>

          <Textarea
            label="Isi Pesan Pengumuman"
            required
            rows={5}
            placeholder="Tuliskan detail pengumuman secara jelas..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Publikasikan Sekarang
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

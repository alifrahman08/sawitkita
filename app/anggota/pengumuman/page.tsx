"use client";

import React, { useState, useEffect } from "react";
import { Bell, Calendar, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateIndo } from "@/lib/utils";

export default function MemberPengumumanPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.items || []))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Pengumuman Resmi Koperasi
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Informasi harga TBS terkini, jadwal pencairan, agenda pertemuan, dan pengumuman operasional
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Memuat pengumuman...</div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Belum ada pengumuman baru untuk anggota saat ini.
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
                  <span className="text-xs text-slate-400">
                    {formatDateIndo(ann.publishedAt, true)}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-6 border-l-2 border-emerald-500">
                  {ann.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

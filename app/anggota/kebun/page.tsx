"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Layers, Scale, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKg } from "@/lib/utils";

export default function MemberKebunPage() {
  const [farms, setFarms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/farms")
      .then((r) => r.json())
      .then((d) => setFarms(d.items || []))
      .finally(() => setIsLoading(false));
  }, []);

  const totalLuas = farms.reduce((acc, f) => acc + Number(f.areaHectares), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Lahan Kebun Saya</h1>
        <p className="text-xs text-slate-500 mt-1">
          Daftar lahan perkebunan kelapa sawit yang terdaftar di koperasi atas nama Anda
        </p>
      </div>

      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-700" />
          <span className="font-semibold text-emerald-900">Total Luas Lahan Terdaftar:</span>
        </div>
        <span className="text-lg font-black text-[#1b4332]">{totalLuas.toFixed(2)} Hektare ({farms.length} kebun)</span>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-400">Memuat data kebun Anda...</div>
      ) : farms.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-slate-400">
            Belum ada kebun yang didaftarkan atas nama Anda. Hubungi pengurus koperasi untuk mendaftarkan lahan kebun Anda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {farms.map((farm) => (
            <Card key={farm.id} className="hover:border-emerald-300 transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {farm.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1.5">{farm.name}</h3>
                  </div>
                  <Badge variant={farm.status === "PRODUKTIF" ? "success" : "warning"}>
                    {farm.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Luas Lahan</span>
                    <span className="font-bold text-slate-900 text-sm">{farm.areaHectares} Ha</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Tahun Tanam</span>
                    <span className="font-bold text-slate-900 text-sm">{farm.plantingYear || "-"}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{farm.village}, Kec. {farm.district}, Kab. {farm.regency}</span>
                  </div>
                  {farm.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-1">"{farm.notes}"</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

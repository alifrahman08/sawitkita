"use client";

import React, { useState, useEffect } from "react";
import { History, Shield, Search, User, Filter, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateIndo } from "@/lib/utils";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/audit-logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !search ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      (log.userName && log.userName.toLowerCase().includes(search.toLowerCase())) ||
      log.entity.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Badge variant="success">CREATE (+)</Badge>;
      case "UPDATE":
        return <Badge variant="info">UPDATE (✎)</Badge>;
      case "DELETE":
      case "CANCEL":
        return <Badge variant="danger">BATAL / HAPUS (✕)</Badge>;
      case "VERIFY":
        return <Badge variant="gold">VERIFIKASI (✓)</Badge>;
      case "LOGIN":
      case "LOGOUT":
        return <Badge variant="outline">{action}</Badge>;
      default:
        return <Badge>{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#1b4332]" />
            Audit Log & Keamanan Sistem
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Jejak rekaman aktivitas penting, perubahan transaksi keuangan, penetapan harga, dan otorisasi pengurus
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchLogs} className="gap-1.5 shadow-xs">
          <RefreshCw className="w-4 h-4" />
          Perbarui Log
        </Button>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kata kunci kejadian, nama operator, atau entitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1b4332]/20"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">Semua Jenis Aksi</option>
              <option value="CREATE">CREATE (Penambahan)</option>
              <option value="UPDATE">UPDATE (Perubahan)</option>
              <option value="VERIFY">VERIFY (Verifikasi)</option>
              <option value="CANCEL">CANCEL (Pembatalan)</option>
              <option value="DELETE">DELETE (Penonaktifan)</option>
              <option value="LOGIN">LOGIN / LOGOUT</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Waktu Kejadian (WIB)</th>
                  <th className="px-4 py-3">Pelaku / Pengguna</th>
                  <th className="px-4 py-3 text-center">Jenis Aksi</th>
                  <th className="px-4 py-3">Entitas Data</th>
                  <th className="px-4 py-3">Rincian Perubahan</th>
                  <th className="px-4 py-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Memuat rekaman log audit...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      Tidak ada rekaman log yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        {formatDateIndo(log.createdAt, true)}
                      </td>
                      <td className="px-4 py-3.5 font-sans font-semibold text-slate-900 whitespace-nowrap">
                        {log.userName || "Sistem"}
                      </td>
                      <td className="px-4 py-3.5 text-center font-sans">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-4 py-3.5 text-emerald-800 font-bold whitespace-nowrap">
                        {log.entity}
                      </td>
                      <td className="px-4 py-3.5 font-sans text-slate-700 leading-relaxed max-w-md">
                        {log.details}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-400 whitespace-nowrap">
                        {log.ipAddress || "127.0.0.1"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

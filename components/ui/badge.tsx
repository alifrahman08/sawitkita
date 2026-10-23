import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "outline"
    | "gold";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const styles = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    outline: "bg-white text-slate-700 border-slate-300",
    gold: "bg-amber-100 text-amber-900 border-amber-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Maps transaction status to badge variant and friendly label
 */
export function TransactionStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "LUNAS":
      return <Badge variant="success">Lunas</Badge>;
    case "DIBAYAR_SEBAGIAN":
      return <Badge variant="warning">Dibayar Sebagian</Badge>;
    case "SIAP_DIBAYAR":
      return <Badge variant="info">Siap Dibayar</Badge>;
    case "TERKONFIRMASI":
      return <Badge variant="info">Terkonfirmasi</Badge>;
    case "MENUNGGU_VERIFIKASI":
      return <Badge variant="warning">Menunggu Verifikasi</Badge>;
    case "DRAFT":
      return <Badge variant="default">Draft</Badge>;
    case "DIBATALKAN":
      return <Badge variant="danger">Dibatalkan</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

/**
 * Maps member status to badge
 */
export function MemberStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "AKTIF":
      return <Badge variant="success">Aktif</Badge>;
    case "NONAKTIF":
      return <Badge variant="danger">Nonaktif</Badge>;
    case "PENDING":
      return <Badge variant="warning">Menunggu Persetujuan</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

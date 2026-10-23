import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string | React.ReactNode;
  className?: string;
}

export function Alert({ type = "info", title, message, className }: AlertProps) {
  const config = {
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-800",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-800",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-800",
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
    },
  };

  const { bg, icon } = config[type];

  return (
    <div className={cn("p-4 rounded-xl border flex gap-3 text-sm", bg, className)}>
      {icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="text-xs sm:text-sm leading-relaxed">{message}</div>
      </div>
    </div>
  );
}

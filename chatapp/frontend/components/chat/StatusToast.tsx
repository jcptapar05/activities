"use client";

import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import type { ElementType } from "react";

type StatusType = "success" | "error" | "info";

interface StatusToastProps {
  type: StatusType;
  msg: string;
}

interface StatusConfig {
  wrapper: string;
  iconBg: string;
  IconComp: ElementType;
}

const CONFIG: Record<StatusType, StatusConfig> = {
  success: {
    wrapper: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    iconBg: "bg-emerald-500/20",
    IconComp: CheckCircle2,
  },
  error: {
    wrapper: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    iconBg: "bg-rose-500/20",
    IconComp: AlertCircle,
  },
  info: {
    wrapper: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    iconBg: "bg-blue-500/20",
    IconComp: RefreshCw,
  },
};

export function StatusToast({ type, msg }: StatusToastProps) {
  const { wrapper, iconBg, IconComp } = CONFIG[type];

  return (
    <div
      className={`fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 ${wrapper}`}
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        <IconComp
          className={`w-3.5 h-3.5 ${type === "info" ? "animate-spin" : ""}`}
        />
      </div>
      <div>
        <p className="font-bold text-[11px] uppercase tracking-tight">{type}</p>
        <p className="text-[11px] opacity-70">{msg}</p>
      </div>
    </div>
  );
}

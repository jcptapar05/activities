"use client";

import {
  MessageCircle,
  Compass,
  Settings as SettingsIcon,
  Palette,
  Wallet,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ThemeConfig } from "./themes";

type Tab = "chat" | "discover" | "profile";

const NAV_TABS = [
  { id: "chat" as Tab, label: "Messages", icon: MessageCircle },
  { id: "discover" as Tab, label: "Explore", icon: Compass },
  { id: "profile" as Tab, label: "Settings", icon: SettingsIcon },
];

interface HeaderProps {
  t: ThemeConfig;
  account: string;
  profileName: string | undefined;
  isLoading: boolean;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onConnectWallet: () => void;
  onOpenThemePicker: () => void;
  formatAddress: (addr: string) => string;
}

export function Header({
  t,
  account,
  profileName,
  isLoading,
  activeTab,
  onTabChange,
  onConnectWallet,
  onOpenThemePicker,
  formatAddress,
}: HeaderProps) {
  return (
    <header
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md shrink-0"
      style={{ background: t.headerBg, borderColor: t.border }}
    >
      {/* ── Brand ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 bg-gradient-to-tr from-primary to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
          <MessageCircle className="text-white w-4 h-4" />
        </div>
        <div className="hidden sm:block">
          <h1
            className="text-base font-extrabold leading-none tracking-tight"
            style={{ color: t.text }}
          >
            Web3 Chat by Juls
          </h1>
          <p
            className="text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: t.textMuted }}
          >
            Web3 Messenger
          </p>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav
        className="flex items-center mx-auto gap-1 p-1.5 rounded-2xl border"
        style={{ background: t.navBg, borderColor: t.border }}
      >
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 select-none"
              style={{
                color: isActive ? t.text : t.textMuted,
                background: isActive ? t.surface : "transparent",
              }}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary"
                />
              )}
              <Icon
                className="w-3.5 h-3.5 flex-shrink-0"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Right controls ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={onOpenThemePicker}
          title="Change theme"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            color: t.textMuted,
          }}
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Wallet button */}
        <Button
          onClick={onConnectWallet}
          disabled={isLoading || !!account}
          variant={account ? "outline" : "default"}
          size="sm"
          className={
            account
              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/10 text-xs gap-1.5"
              : "shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 text-xs gap-1.5"
          }
        >
          {account ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="max-w-[110px] truncate">
                {profileName || formatAddress(account)}
              </span>
            </>
          ) : isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">Connecting…</span>
            </>
          ) : (
            <>
              <Wallet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Connect Wallet</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
}

"use client";

import { User, Hash, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ThemeGrid } from "./ThemePicker";
import type { ThemeConfig, ThemeId } from "./themes";
import type { Friend } from "./types";

interface ProfileViewProps {
  t: ThemeConfig;
  account: string;
  name: string;
  ipfs: string;
  isLoading: boolean;
  friends: Friend[];
  currentThemeId: ThemeId;
  onNameChange: (val: string) => void;
  onIpfsChange: (val: string) => void;
  onSaveProfile: () => void;
  onThemeChange: (id: ThemeId) => void;
}

export function ProfileView({
  t,
  account,
  name,
  ipfs,
  isLoading,
  friends,
  currentThemeId,
  onNameChange,
  onIpfsChange,
  onSaveProfile,
  onThemeChange,
}: ProfileViewProps) {
  return (
    <div
      className="h-full flex flex-col rounded-2xl border overflow-hidden animate-in fade-in duration-300 slide-in-from-top-1"
      style={{ background: t.surface, borderColor: t.border }}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-10 space-y-6">
          {/* Avatar + title */}
          <ProfileHero t={t} />

          <Separator style={{ background: t.border }} />

          {/* Edit form */}
          <ProfileForm
            t={t}
            account={account}
            name={name}
            ipfs={ipfs}
            isLoading={isLoading}
            onNameChange={onNameChange}
            onIpfsChange={onIpfsChange}
            onSave={onSaveProfile}
          />

          {/* Stats widgets */}
          <StatsRow
            t={t}
            friends={friends}
          />

          {/* Theme section */}
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: t.textMuted }}
            >
              Appearance
            </p>
            <ThemeGrid
              currentThemeId={currentThemeId}
              t={t}
              onSelect={onThemeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────────────── */
function ProfileHero({ t }: { t: ThemeConfig }) {
  return (
    <div className="text-center space-y-2">
      <div
        className="w-16 h-16 rounded-[1.5rem] mx-auto flex items-center justify-center shadow-2xl shadow-primary/30 rotate-12"
        style={{
          background: "linear-gradient(135deg, var(--primary, #7c3aed), #3b82f6)",
        }}
      >
        <User className="w-8 h-8 text-white" />
      </div>
      <h2
        className="text-xl font-extrabold"
        style={{ color: t.text }}
      >
        Identity Hub
      </h2>
      <p
        className="text-sm"
        style={{ color: t.textMuted }}
      >
        Fine-tune your decentralized presence on the Nexus Protocol.
      </p>
    </div>
  );
}

/* ─── Form ─────────────────────────────────────────────────────────────── */
function ProfileForm({
  t,
  account,
  name,
  ipfs,
  isLoading,
  onNameChange,
  onIpfsChange,
  onSave,
}: {
  t: ThemeConfig;
  account: string;
  name: string;
  ipfs: string;
  isLoading: boolean;
  onNameChange: (v: string) => void;
  onIpfsChange: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: t.inputBg, borderColor: t.border }}
    >
      {/* Name field */}
      <FormField
        label="Public Alias"
        t={t}
      >
        <div className="relative">
          <Input
            placeholder="Type your name…"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="pr-10 h-10 rounded-xl border"
            style={{
              background: t.surface,
              borderColor: t.border,
              color: t.text,
            }}
          />
          <User
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: t.textMuted, opacity: 0.4 }}
          />
        </div>
      </FormField>

      {/* IPFS field */}
      <FormField
        label="Metadata Hash (IPFS)"
        t={t}
      >
        <div className="relative">
          <Input
            placeholder="Qm…"
            value={ipfs}
            onChange={(e) => onIpfsChange(e.target.value)}
            className="pr-10 h-10 rounded-xl border font-mono"
            style={{
              background: t.surface,
              borderColor: t.border,
              color: t.text,
            }}
          />
          <Hash
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: t.textMuted, opacity: 0.4 }}
          />
        </div>
      </FormField>

      {/* Save */}
      <Button
        onClick={onSave}
        disabled={isLoading || !account}
        className="w-full h-10 gap-2 shadow-lg shadow-primary/20"
      >
        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Commit Changes to Chain
      </Button>
    </div>
  );
}

function FormField({ label, t, children }: { label: string; t: ThemeConfig; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label
        className="text-[10px] font-bold uppercase tracking-[0.2em] block"
        style={{ color: t.textMuted }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── Stats ─────────────────────────────────────────────────────────────── */
function StatsRow({ t, friends }: { t: ThemeConfig; friends: Friend[] }) {
  const stats = [
    {
      label: "Status",
      value: (
        <span className="flex items-center justify-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          ONLINE
        </span>
      ),
    },
    {
      label: "Friends",
      value: <span style={{ color: t.text }}>{friends.length}</span>,
    },
    {
      label: "Version",
      value: <span style={{ color: t.textMuted }}>α 0.2.1</span>,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border p-3 text-center"
          style={{ background: t.surface, borderColor: t.border }}
        >
          <p
            className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
            style={{ color: t.textMuted }}
          >
            {item.label}
          </p>
          <p className="text-xs font-bold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

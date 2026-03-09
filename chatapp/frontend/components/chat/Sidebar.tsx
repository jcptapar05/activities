"use client";

import { UserCircle2, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ThemeConfig } from "./themes";
import type { Friend } from "./types";

/* ─────────────────────────────────────────────────────────────────────────── */

interface SidebarProps {
  t: ThemeConfig;
  account: string;
  profileName: string | undefined;
  friends: Friend[];
  messageReceiver: string;
  activeTab: string;
  formatAddress: (addr: string) => string;
  onSelectFriend: (wallet: string) => void;
}

export function Sidebar({
  t,
  friends,
  messageReceiver,
  activeTab,
  formatAddress,
  onSelectFriend,
}: SidebarProps) {
  return (
    <aside className="w-60 flex flex-col gap-3 overflow-hidden shrink-0">
      <div
        className="flex-1 flex flex-col rounded-2xl border overflow-hidden"
        style={{ background: t.surface, borderColor: t.border }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: t.border }}
        >
          <div className="flex items-center gap-2">
            <UserCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold" style={{ color: t.text }}>
              Contacts
            </span>
          </div>
          <Badge variant="secondary" className="text-[10px] h-5 px-2">
            {friends.length}
          </Badge>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          {friends.length === 0 ? (
            <EmptyContactsState t={t} />
          ) : (
            friends.map((friend, i) => (
              <ContactItem
                key={i}
                friend={friend}
                isActive={
                  !!messageReceiver &&
                  !!friend.wallet &&
                  messageReceiver.toLowerCase() === friend.wallet.toLowerCase() &&
                  activeTab === "chat"
                }
                t={t}
                formatAddress={formatAddress}
                onClick={() => onSelectFriend(friend.wallet)}
              />
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

/* ─── Empty state ──────────────────────────────────────────────────────────── */
function EmptyContactsState({ t }: { t: ThemeConfig }) {
  return (
    <div className="py-10 flex flex-col items-center justify-center text-center px-3 gap-2">
      <Compass className="w-7 h-7" style={{ color: t.textMuted, opacity: 0.4 }} />
      <p className="text-[11px] leading-snug" style={{ color: t.textMuted }}>
        No friends yet. Try Explore!
      </p>
    </div>
  );
}

/* ─── Contact item ─────────────────────────────────────────────────────────── */
interface ContactItemProps {
  friend: Friend;
  isActive: boolean;
  t: ThemeConfig;
  formatAddress: (addr: string) => string;
  onClick: () => void;
}

function ContactItem({ friend, isActive, t, formatAddress, onClick }: ContactItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left group"
      style={{
        background: isActive ? "rgba(139,92,246,0.18)" : "transparent",
        border: `1px solid ${isActive ? "rgba(139,92,246,0.35)" : "transparent"}`,
      }}
    >
      {/* Avatar letter */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 font-bold text-xs"
        style={{
          background: isActive ? "rgba(139,92,246,0.15)" : t.inputBg,
          borderColor: isActive ? "rgba(139,92,246,0.3)" : t.border,
          color: isActive ? "var(--primary, #7c3aed)" : t.textMuted,
        }}
      >
        {(friend.name || "?")[0].toUpperCase()}
      </div>

      {/* Name + address */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-xs truncate" style={{ color: t.text }}>
          {friend.name}
        </p>
        <p className="text-[10px] font-mono truncate" style={{ color: t.textMuted }}>
          {formatAddress(friend.wallet)}
        </p>
      </div>

      {/* Active indicator */}
      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
      )}
    </button>
  );
}

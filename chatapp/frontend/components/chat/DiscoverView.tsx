"use client";

import { Compass, UserPlus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ThemeConfig } from "./themes";
import type { ChatUser, Friend } from "./types";

/* ─────────────────────────────────────────────────────────────────────────── */

interface DiscoverViewProps {
  t: ThemeConfig;
  account: string;
  allUsers: ChatUser[];
  friends: Friend[];
  searchQuery: string;
  isLoading: boolean;
  onSearchChange: (val: string) => void;
  onAddFriend: (wallet: string) => void;
  onMessageFriend: (wallet: string) => void;
  formatAddress: (addr: string) => string;
}

export function DiscoverView({
  t,
  account,
  allUsers,
  friends,
  searchQuery,
  isLoading,
  onSearchChange,
  onAddFriend,
  onMessageFriend,
  formatAddress,
}: DiscoverViewProps) {
  const query = searchQuery.toLowerCase();
  const filteredUsers = allUsers.filter(
    (u) =>
      u.isUser &&
      u.wallet?.toLowerCase() !== account.toLowerCase() &&
      ((u.name || "").toLowerCase().includes(query) ||
        (u.wallet || "").toLowerCase().includes(query)),
  );

  return (
    <div
      className="h-full flex flex-col rounded-2xl border overflow-hidden animate-in fade-in duration-300 slide-in-from-right-1"
      style={{ background: t.surface, borderColor: t.border }}
    >
      {/* Search header */}
      <div
        className="px-6 py-4 border-b shrink-0 space-y-3"
        style={{ background: t.headerBg, borderColor: t.border }}
      >
        <div>
          <h2 className="text-lg font-bold" style={{ color: t.text }}>
            Explore Web3 Users
          </h2>
          <p className="text-sm mt-0.5" style={{ color: t.textMuted }}>
            Discover and connect with decentralized identities.
          </p>
        </div>
        <SearchBar t={t} value={searchQuery} onChange={onSearchChange} />
      </div>

      {/* User grid */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {filteredUsers.length === 0 ? (
          <EmptyDirectory t={t} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredUsers.map((user, i) => {
              const isFriend = friends.some(
                (f) => f.wallet?.toLowerCase() === user.wallet?.toLowerCase(),
              );
              return (
                <UserCard
                  key={user.wallet || i}
                  user={user}
                  isFriend={isFriend}
                  isLoading={isLoading}
                  t={t}
                  formatAddress={formatAddress}
                  onAddFriend={onAddFriend}
                  onMessage={onMessageFriend}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Search bar ───────────────────────────────────────────────────────────── */
function SearchBar({
  t,
  value,
  onChange,
}: {
  t: ThemeConfig;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="relative">
      <Compass
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: t.textMuted }}
      />
      <Input
        placeholder="Search by name or address…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 h-10 rounded-xl border"
        style={{ background: t.inputBg, borderColor: t.border, color: t.text }}
      />
    </div>
  );
}

/* ─── Empty state ──────────────────────────────────────────────────────────── */
function EmptyDirectory({ t }: { t: ThemeConfig }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <Compass className="w-10 h-10 opacity-10" style={{ color: t.text }} />
      <p
        className="font-semibold uppercase text-[11px] tracking-widest"
        style={{ color: t.textMuted }}
      >
        Network Directory Empty
      </p>
    </div>
  );
}

/* ─── User card ────────────────────────────────────────────────────────────── */
function UserCard({
  user,
  isFriend,
  isLoading,
  t,
  formatAddress,
  onAddFriend,
  onMessage,
}: {
  user: ChatUser;
  isFriend: boolean;
  isLoading: boolean;
  t: ThemeConfig;
  formatAddress: (addr: string) => string;
  onAddFriend: (wallet: string) => void;
  onMessage: (wallet: string) => void;
}) {
  return (
    <div
      className="rounded-2xl border p-4 transition-all group hover:scale-[1.01]"
      style={{ background: t.surface, borderColor: t.border }}
    >
      {/* User info row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 font-bold text-sm"
          style={{
            background: t.inputBg,
            borderColor: t.border,
            color: "var(--primary, #7c3aed)",
          }}
        >
          {(user.name || "?")[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate" style={{ color: t.text }}>
            {user.name}
          </p>
          <p className="text-[10px] font-mono" style={{ color: t.textMuted }}>
            {formatAddress(user.wallet)}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-[9px] flex-shrink-0 ${
            isFriend
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-primary/10 text-primary border-primary/20"
          }`}
        >
          {isFriend ? "FRIEND" : "ACTIVE"}
        </Badge>
      </div>

      <Separator className="mb-3" style={{ background: t.border }} />

      {/* ID + action row */}
      <div className="flex items-center gap-2">
        <div
          className="flex-1 rounded-lg px-3 py-1.5 border flex items-center justify-between text-[10px] font-mono"
          style={{ background: t.inputBg, borderColor: t.border }}
        >
          <span style={{ color: t.textMuted }}>ID</span>
          <span style={{ color: t.text }}>…{user.wallet?.slice(-6)}</span>
        </div>

        {!isFriend ? (
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => onAddFriend(user.wallet)}
            disabled={isLoading}
            className="border-primary/30 text-primary hover:bg-primary hover:text-white bg-primary/10"
            title="Add friend"
          >
            <UserPlus className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => onMessage(user.wallet)}
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white bg-emerald-500/10"
            title="Send message"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

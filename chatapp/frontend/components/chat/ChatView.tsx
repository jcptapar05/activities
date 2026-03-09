"use client";

import { User, RefreshCw, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { ThemeConfig } from "./themes";
import type { ChatMessage, ChatUser, Friend } from "./types";

/* ─────────────────────────────────────────────────────────────────────────── */

interface ChatViewProps {
  t: ThemeConfig;
  account: string;
  messages: ChatMessage[];
  message: string;
  messageReceiver: string;
  isLoading: boolean;
  activeContact: ChatUser | Friend | undefined;
  onMessageChange: (val: string) => void;
  onSend: () => void;
  onRefresh: () => void;
  onReceiverChange: (val: string) => void;
  resolveName: (addr: string) => string;
  formatAddress: (addr: string) => string;
}

export function ChatView({
  t,
  account,
  messages,
  message,
  messageReceiver,
  isLoading,
  activeContact,
  onMessageChange,
  onSend,
  onRefresh,
  onReceiverChange,
  resolveName,
  formatAddress,
}: ChatViewProps) {
  return (
    <div
      className="h-full flex flex-col rounded-2xl border overflow-hidden animate-in fade-in duration-300 slide-in-from-bottom-1"
      style={{ background: t.surface, borderColor: t.border }}
    >
      <ChatHeader
        t={t}
        messageReceiver={messageReceiver}
        activeContact={activeContact}
        isLoading={isLoading}
        onRefresh={onRefresh}
        onReceiverChange={onReceiverChange}
        formatAddress={formatAddress}
      />
      <MessageList
        t={t}
        account={account}
        messages={messages}
        resolveName={resolveName}
      />
      <Separator style={{ background: t.border }} />
      <MessageInputBar
        t={t}
        message={message}
        isLoading={isLoading}
        messageReceiver={messageReceiver}
        onMessageChange={onMessageChange}
        onSend={onSend}
      />
    </div>
  );
}

/* ─── Chat Header ──────────────────────────────────────────────────────────── */
function ChatHeader({
  t,
  messageReceiver,
  activeContact,
  isLoading,
  onRefresh,
  onReceiverChange,
  formatAddress,
}: {
  t: ThemeConfig;
  messageReceiver: string;
  activeContact: ChatUser | Friend | undefined;
  isLoading: boolean;
  onRefresh: () => void;
  onReceiverChange: (val: string) => void;
  formatAddress: (addr: string) => string;
}) {
  const avatarLetter = activeContact?.name?.[0]?.toUpperCase();

  return (
    <div
      className="flex items-center justify-between gap-3 px-5 py-3 border-b shrink-0"
      style={{ background: t.headerBg, borderColor: t.border }}
    >
      {/* Contact info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center border flex-shrink-0 font-bold text-sm"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.15))",
            borderColor: t.border,
            color: "var(--primary, #7c3aed)",
          }}
        >
          {avatarLetter ?? <User className="w-4 h-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate" style={{ color: t.text }}>
            {activeContact?.name ??
              (messageReceiver ? formatAddress(messageReceiver) : "Select a contact")}
          </p>
          <p className="text-[10px] font-mono truncate" style={{ color: t.textMuted }}>
            {messageReceiver ? formatAddress(messageReceiver) : "Encrypted Channel"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!messageReceiver && (
          <Input
            placeholder="Enter wallet address…"
            onChange={(e) => onReceiverChange(e.target.value)}
            className="w-52 h-8 text-xs rounded-xl border"
            style={{ background: t.inputBg, borderColor: t.border, color: t.text }}
          />
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRefresh}
          disabled={isLoading || !messageReceiver}
          title="Refresh messages"
          style={{ color: t.textMuted }}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}

/* ─── Message List ─────────────────────────────────────────────────────────── */
function MessageList({
  t,
  account,
  messages,
  resolveName,
}: {
  t: ThemeConfig;
  account: string;
  messages: ChatMessage[];
  resolveName: (addr: string) => string;
}) {
  return (
    <div className="flex-1 px-6 py-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/10">
      {messages.length === 0 ? (
        <EmptyMessages t={t} />
      ) : (
        messages.map((msg, i) => (
          <MessageBubble
            key={i}
            msg={msg}
            isMe={!!(account && msg.sender.toLowerCase() === account.toLowerCase())}
            senderName={resolveName(msg.sender)}
            t={t}
          />
        ))
      )}
    </div>
  );
}

function EmptyMessages({ t }: { t: ThemeConfig }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center animate-bounce"
        style={{ background: t.inputBg }}
      >
        <MessageCircle className="w-7 h-7" style={{ color: t.textMuted, opacity: 0.4 }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold italic" style={{ color: t.textMuted }}>
          Silence is golden…
        </p>
        <p
          className="text-[11px] mt-1 uppercase tracking-widest"
          style={{ color: t.textMuted, opacity: 0.5 }}
        >
          or start the conversation now
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  isMe,
  senderName,
  t,
}: {
  msg: ChatMessage;
  isMe: boolean;
  senderName: string;
  t: ThemeConfig;
}) {
  const timestamp = new Date(
    Number(msg.chatId) > 1_000_000_000_000 ? Number(msg.chatId) : 1_710_000_000_000,
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex flex-col max-w-[72%] ${isMe ? "items-end ml-auto" : "items-start mr-auto"}`}>
      <span
        className="text-[10px] font-bold uppercase tracking-wider px-1 mb-1"
        style={{ color: t.textMuted }}
      >
        {senderName}
      </span>

      <div
        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
          isMe ? "rounded-tr-sm" : "rounded-tl-sm"
        }`}
        style={{
          background: isMe ? "linear-gradient(135deg, var(--primary, #7c3aed), #3b82f6)" : t.msgBg,
          color: isMe ? "#fff" : t.text,
          border: isMe ? "none" : `1px solid ${t.border}`,
        }}
      >
        {msg.message}
      </div>

      <span className="text-[9px] px-1 mt-1" style={{ color: t.textMuted, opacity: 0.6 }}>
        {timestamp}
      </span>
    </div>
  );
}

/* ─── Message Input Bar ────────────────────────────────────────────────────── */
function MessageInputBar({
  t,
  message,
  isLoading,
  messageReceiver,
  onMessageChange,
  onSend,
}: {
  t: ThemeConfig;
  message: string;
  isLoading: boolean;
  messageReceiver: string;
  onMessageChange: (val: string) => void;
  onSend: () => void;
}) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && message && messageReceiver) onSend();
  };

  return (
    <div className="px-4 py-3" style={{ background: t.headerBg }}>
      <div
        className="flex items-center gap-2 rounded-2xl border px-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/40"
        style={{ background: t.inputBg, borderColor: t.border }}
      >
        <Input
          placeholder="Type a secure message…"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={handleKey}
          className="flex-1 border-none bg-transparent focus-visible:ring-0 h-11 text-sm placeholder:font-normal"
          style={{ color: t.text }}
        />
        <Button
          onClick={onSend}
          disabled={isLoading || !message || !messageReceiver}
          size="icon-sm"
          className="w-8 h-8 rounded-xl shadow-md shadow-primary/20 flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

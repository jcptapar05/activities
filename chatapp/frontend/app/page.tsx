"use client";

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";
import { getChatContractWithSigner, getChatContractReadOnly } from "@/lib/chatContract";

import { Header } from "@/components/chat/Header";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatView } from "@/components/chat/ChatView";
import { DiscoverView } from "@/components/chat/DiscoverView";
import { ProfileView } from "@/components/chat/ProfileView";
import { StatusToast } from "@/components/chat/StatusToast";
import { ThemePickerModal } from "@/components/chat/ThemePicker";

import { THEMES, type ThemeId } from "@/components/chat/themes";
import type { ChatUser, Friend, ChatMessage } from "@/components/chat/types";

// ── side-effect: ensure the global Window type augmentation is loaded ──────
import "@/components/chat/types";

type Tab = "chat" | "discover" | "profile";
type StatusType = "success" | "error" | "info";

const THEME_STORAGE_KEY = "nexus_chat_theme";

/* ══════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  // Always start with the default theme so SSR and the initial client render match.
  // The saved theme is applied after hydration in the effect below.
  const [theme, setTheme] = useState<ThemeId>("obsidian");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: StatusType; msg: string } | null>(null);

  // ── Web3 / profile state ──────────────────────────────────────────────────
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  const [ipfs, setIpfs] = useState("");
  const [currentProfile, setCurrentProfile] = useState<{ name: string; ipfs: string } | null>(null);

  // ── Social state ──────────────────────────────────────────────────────────
  const [friends, setFriends] = useState<Friend[]>([]);
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Chat state ────────────────────────────────────────────────────────────
  const [messageReceiver, setMessageReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // ── Derived values ────────────────────────────────────────────────────────
  const t = THEMES[theme];

  const activeContact: ChatUser | Friend | undefined = messageReceiver
    ? friends.find((f) => f.wallet?.toLowerCase() === messageReceiver.toLowerCase()) ??
      allUsers.find((u) => u.wallet?.toLowerCase() === messageReceiver.toLowerCase())
    : undefined;

  // Restore saved theme after hydration (localStorage is browser-only).
  // Runs once on mount — safe for SSR because it never affects the server render.
  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (saved && saved !== theme) setTheme(saved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — only runs once after mount

  // Persist theme to localStorage whenever it changes.
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  /* ════════════════════════════════════════════════ Helpers ═══════════════ */
  const formatAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  const showStatus = (msg: string, type: StatusType = "info") => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 5000);
  };

  /**
   * Resolves a wallet address to a human-readable name.
   * Priority: "You" → friends → allUsers → shortened address
   */
  const resolveName = useCallback(
    (addr: string): string => {
      if (!addr) return "";
      const lower = addr.toLowerCase();
      if (account && lower === account.toLowerCase()) return "You";
      const fromFriends = friends.find((f) => f.wallet?.toLowerCase() === lower);
      if (fromFriends?.name) return fromFriends.name;
      const fromAll = allUsers.find((u) => u.wallet?.toLowerCase() === lower);
      if (fromAll?.name) return fromAll.name;
      return formatAddress(addr);
    },
    [friends, allUsers, account],
  );

  /* ════════════════════════════════════════════ Data fetching ═════════════ */
  const fetchProfile = useCallback(async (addr: string) => {
    try {
      const contract = await getChatContractReadOnly();
      const profile = await contract.myProfile(addr);
      if (profile.isUser) {
        setCurrentProfile({ name: profile.name, ipfs: profile.ipfs });
        setName(profile.name);
        setIpfs(profile.ipfs);
        const signerContract = await getChatContractWithSigner();
        const friendList: Friend[] = await signerContract.getMyFriends();
        setFriends(friendList);
      }
    } catch (err) {
      console.error("Failed to fetch profile/friends", err);
    }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const contract = await getChatContractReadOnly();
      const profiles: unknown[] = await contract.getAllUsers();
      const addresses: string[] = await Promise.all(
        Array.from({ length: profiles.length }, (_, i) => contract.users(i)),
      );
      const usersWithAddresses: ChatUser[] = (profiles as Record<string, unknown>[]).map(
        (p, i) => ({
          name: (p[0] as string) || (p["name"] as string) || "Anonymous",
          ipfs: (p[1] as string) || (p["ipfs"] as string) || "",
          isUser: p[3] !== undefined ? Boolean(p[3]) : Boolean(p["isUser"]),
          wallet: addresses[i] ?? "",
        }),
      );
      setAllUsers(usersWithAddresses);
      if (usersWithAddresses.length === 0) showStatus("No users found on network", "info");
    } catch (err: unknown) {
      console.error("Failed to fetch all users", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      showStatus(`User directory error: ${message.slice(0, 30)}…`, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch user directory when Explore tab is opened
  useEffect(() => {
    if (activeTab === "discover") fetchAllUsers();
  }, [activeTab, fetchAllUsers]);

  /* ═══════════════════════════════════════════════════ Wallet ═════════════ */
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) return showStatus("Please install MetaMask", "error");
    try {
      setIsLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const addr = (accounts as string[])[0];
      setAccount(addr);
      fetchProfile(addr);
      showStatus("Wallet connected!", "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet";
      showStatus(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  // Auto-connect on page load + listen for MetaMask account changes
  useEffect(() => {
    async function checkConnection() {
      if (!window.ethereum) return;
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const addr = accounts[0].address;
          setAccount(addr);
          fetchProfile(addr);
        }
      } catch (err) {
        console.error("Auto-connect check failed", err);
      }
    }

    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        const addr = ((accounts as string[])[0]) || "";
        setAccount(addr);
        if (addr) {
          fetchProfile(addr);
        } else {
          setCurrentProfile(null);
          setFriends([]);
        }
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [fetchProfile]);

  /* ══════════════════════════════════════════ Contract actions ════════════ */
  async function setProfile() {
    if (!name) return showStatus("Name is required", "error");
    try {
      setIsLoading(true);
      const contract = await getChatContractWithSigner();
      const tx = await contract.setProfile(name, ipfs);
      showStatus("Transaction submitted…", "info");
      await tx.wait();
      showStatus("Profile updated successfully!", "success");
      fetchProfile(account);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to set profile";
      showStatus(message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function addFriendViaAddr(addr: string) {
    if (!addr) return showStatus("Address is required", "error");
    if (!currentProfile) return showStatus("Set your profile first!", "error");
    if (account && addr.toLowerCase() === account.toLowerCase())
      return showStatus("You cannot add yourself", "error");
    try {
      setIsLoading(true);
      const contract = await getChatContractWithSigner();
      const tx = await contract.addFriend(addr);
      showStatus("Adding friend…", "info");
      await tx.wait();
      showStatus("Friend added!", "success");
      fetchProfile(account);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add friend";
      showStatus(message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage() {
    if (!messageReceiver || !message)
      return showStatus("Receiver and message are required", "error");
    try {
      setIsLoading(true);
      const contract = await getChatContractWithSigner();
      const tx = await contract.sendMessage(messageReceiver, message);
      showStatus("Sending message…", "info");
      await tx.wait();
      setMessage("");
      showStatus("Message sent!", "success");
      loadMessages();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      showStatus(message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMessages(addr?: string) {
    const target = addr ?? messageReceiver;
    if (!target) return;
    try {
      setIsLoading(true);
      const contract = await getChatContractWithSigner();
      const msgs: ChatMessage[] = await contract.getMessages(target);
      setMessages(
        account
          ? msgs.filter(
              (m) =>
                (m.sender.toLowerCase() === target.toLowerCase() &&
                  m.receiver.toLowerCase() === account.toLowerCase()) ||
                (m.sender.toLowerCase() === account.toLowerCase() &&
                  m.receiver.toLowerCase() === target.toLowerCase()),
            )
          : msgs,
      );
    } catch (err: unknown) {
      console.error("Failed to load messages:", err);
      const message = err instanceof Error ? err.message : "";
      if (message.includes("Not authorized"))
        showStatus("Add this user as a friend first", "error");
    } finally {
      setIsLoading(false);
    }
  }

  /* ══════════════════════════════════════════════ Event handlers ══════════ */
  function handleSelectFriend(wallet: string) {
    setMessageReceiver(wallet);
    loadMessages(wallet);
    setActiveTab("chat");
  }

  function handleMessageFriend(wallet: string) {
    setMessageReceiver(wallet);
    loadMessages(wallet);
    setActiveTab("chat");
  }

  function handleThemeChange(id: ThemeId) {
    setTheme(id);
    setShowThemePicker(false);
  }

  /* ════════════════════════════════════════════════════════ Render ════════ */
  return (
    <div
      className="dark min-h-screen font-sans selection:bg-primary/30"
      style={{ background: t.bg, color: t.text }}
    >
      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[130px] animate-pulse"
          style={{ background: t.blob1 }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]"
          style={{ background: t.blob2 }}
        />
      </div>

      {/* Theme picker overlay */}
      {showThemePicker && (
        <ThemePickerModal
          currentThemeId={theme}
          t={t}
          onSelect={handleThemeChange}
          onClose={() => setShowThemePicker(false)}
        />
      )}

      {/* Page layout */}
      <main className="relative z-10 w-full px-3 py-3 flex flex-col gap-3 h-screen overflow-hidden">
        <Header
          t={t}
          account={account}
          profileName={currentProfile?.name}
          isLoading={isLoading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onConnectWallet={connectWallet}
          onOpenThemePicker={() => setShowThemePicker(true)}
          formatAddress={formatAddress}
        />

        <div className="flex-1 min-h-0 flex gap-3">
          <Sidebar
            t={t}
            account={account}
            profileName={currentProfile?.name}
            friends={friends}
            messageReceiver={messageReceiver}
            activeTab={activeTab}
            formatAddress={formatAddress}
            onSelectFriend={handleSelectFriend}
          />

          <div className="flex-1 min-w-0">
            {activeTab === "chat" && (
              <ChatView
                t={t}
                account={account}
                messages={messages}
                message={message}
                messageReceiver={messageReceiver}
                isLoading={isLoading}
                activeContact={activeContact}
                onMessageChange={setMessage}
                onSend={sendMessage}
                onRefresh={() => loadMessages()}
                onReceiverChange={setMessageReceiver}
                resolveName={resolveName}
                formatAddress={formatAddress}
              />
            )}

            {activeTab === "discover" && (
              <DiscoverView
                t={t}
                account={account}
                allUsers={allUsers}
                friends={friends}
                searchQuery={searchQuery}
                isLoading={isLoading}
                onSearchChange={setSearchQuery}
                onAddFriend={addFriendViaAddr}
                onMessageFriend={handleMessageFriend}
                formatAddress={formatAddress}
              />
            )}

            {activeTab === "profile" && (
              <ProfileView
                t={t}
                account={account}
                name={name}
                ipfs={ipfs}
                isLoading={isLoading}
                friends={friends}
                currentThemeId={theme}
                onNameChange={setName}
                onIpfsChange={setIpfs}
                onSaveProfile={setProfile}
                onThemeChange={setTheme}
              />
            )}
          </div>
        </div>
      </main>

      {status && <StatusToast type={status.type} msg={status.msg} />}
    </div>
  );
}

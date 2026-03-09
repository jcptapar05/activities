import {
  Moon,
  Droplets,
  Zap,
  Sun,
  Leaf,
  Flame,
  Snowflake,
  CloudMoon,
} from "lucide-react";
import type { ElementType } from "react";

export type ThemeId =
  | "obsidian"
  | "midnight"
  | "cyber"
  | "arctic"
  | "forest"
  | "sunset"
  | "rose"
  | "slate";

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  icon: ElementType;
  /** Outer page background */
  bg: string;
  /** Card / panel surface */
  surface: string;
  /** Border colour */
  border: string;
  /** Top-left ambient glow */
  blob1: string;
  /** Bottom-right ambient glow */
  blob2: string;
  /** Primary text */
  text: string;
  /** Muted / secondary text */
  textMuted: string;
  /** Input field background */
  inputBg: string;
  /** Header / footer bar background */
  headerBg: string;
  /** Received-message bubble background */
  msgBg: string;
  /** Nav pill container background */
  navBg: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  /* ── Dark themes ──────────────────────────────────────────────────────── */
  obsidian: {
    id: "obsidian",
    label: "Obsidian",
    icon: Moon,
    bg: "oklch(0.05 0.02 260)",
    surface: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
    blob1: "rgba(139,92,246,0.18)",
    blob2: "rgba(59,130,246,0.08)",
    text: "#ffffff",
    textMuted: "rgba(255,255,255,0.38)",
    inputBg: "rgba(0,0,0,0.35)",
    headerBg: "rgba(255,255,255,0.04)",
    msgBg: "rgba(255,255,255,0.08)",
    navBg: "rgba(0,0,0,0.45)",
  },
  midnight: {
    id: "midnight",
    label: "Midnight",
    icon: Droplets,
    bg: "oklch(0.06 0.04 240)",
    surface: "rgba(30,58,138,0.18)",
    border: "rgba(99,179,237,0.14)",
    blob1: "rgba(30,58,138,0.35)",
    blob2: "rgba(96,165,250,0.12)",
    text: "#e0f2fe",
    textMuted: "rgba(186,230,253,0.5)",
    inputBg: "rgba(15,23,42,0.55)",
    headerBg: "rgba(30,58,138,0.2)",
    msgBg: "rgba(30,64,175,0.25)",
    navBg: "rgba(15,23,42,0.65)",
  },
  cyber: {
    id: "cyber",
    label: "Cyberpunk",
    icon: Zap,
    bg: "oklch(0.06 0.03 300)",
    surface: "rgba(168,85,247,0.06)",
    border: "rgba(236,72,153,0.18)",
    blob1: "rgba(168,85,247,0.22)",
    blob2: "rgba(236,72,153,0.14)",
    text: "#fdf4ff",
    textMuted: "rgba(240,171,252,0.5)",
    inputBg: "rgba(20,0,40,0.55)",
    headerBg: "rgba(88,28,135,0.15)",
    msgBg: "rgba(168,85,247,0.12)",
    navBg: "rgba(20,0,40,0.6)",
  },
  forest: {
    id: "forest",
    label: "Forest",
    icon: Leaf,
    bg: "oklch(0.07 0.03 145)",
    surface: "rgba(20,83,45,0.18)",
    border: "rgba(74,222,128,0.14)",
    blob1: "rgba(20,83,45,0.4)",
    blob2: "rgba(74,222,128,0.1)",
    text: "#f0fdf4",
    textMuted: "rgba(187,247,208,0.5)",
    inputBg: "rgba(0,20,10,0.5)",
    headerBg: "rgba(20,83,45,0.2)",
    msgBg: "rgba(22,101,52,0.25)",
    navBg: "rgba(0,20,10,0.6)",
  },
  sunset: {
    id: "sunset",
    label: "Sunset",
    icon: Flame,
    bg: "oklch(0.07 0.04 30)",
    surface: "rgba(154,52,18,0.15)",
    border: "rgba(251,146,60,0.18)",
    blob1: "rgba(194,65,12,0.35)",
    blob2: "rgba(251,191,36,0.12)",
    text: "#fff7ed",
    textMuted: "rgba(254,215,170,0.5)",
    inputBg: "rgba(30,10,0,0.5)",
    headerBg: "rgba(154,52,18,0.2)",
    msgBg: "rgba(194,65,12,0.2)",
    navBg: "rgba(30,10,0,0.6)",
  },
  /* ── Light-ish themes ─────────────────────────────────────────────────── */
  arctic: {
    id: "arctic",
    label: "Arctic",
    icon: Sun,
    bg: "oklch(0.97 0.005 220)",
    surface: "rgba(14,116,144,0.06)",
    border: "rgba(14,116,144,0.14)",
    blob1: "rgba(14,116,144,0.08)",
    blob2: "rgba(99,179,237,0.06)",
    text: "#0c4a6e",
    textMuted: "rgba(12,74,110,0.5)",
    inputBg: "rgba(255,255,255,0.75)",
    headerBg: "rgba(255,255,255,0.75)",
    msgBg: "rgba(14,116,144,0.08)",
    navBg: "rgba(255,255,255,0.65)",
  },
  rose: {
    id: "rose",
    label: "Rose",
    icon: CloudMoon,
    bg: "oklch(0.08 0.04 350)",
    surface: "rgba(225,29,72,0.08)",
    border: "rgba(251,113,133,0.18)",
    blob1: "rgba(225,29,72,0.25)",
    blob2: "rgba(244,63,94,0.12)",
    text: "#fff1f2",
    textMuted: "rgba(254,205,211,0.55)",
    inputBg: "rgba(40,0,15,0.5)",
    headerBg: "rgba(136,19,55,0.18)",
    msgBg: "rgba(190,18,60,0.18)",
    navBg: "rgba(40,0,15,0.6)",
  },
  slate: {
    id: "slate",
    label: "Slate",
    icon: Snowflake,
    bg: "oklch(0.96 0.004 240)",
    surface: "rgba(51,65,85,0.06)",
    border: "rgba(100,116,139,0.18)",
    blob1: "rgba(100,116,139,0.1)",
    blob2: "rgba(148,163,184,0.08)",
    text: "#0f172a",
    textMuted: "rgba(15,23,42,0.45)",
    inputBg: "rgba(255,255,255,0.8)",
    headerBg: "rgba(255,255,255,0.8)",
    msgBg: "rgba(100,116,139,0.1)",
    navBg: "rgba(255,255,255,0.7)",
  },
};

export const THEME_LIST = Object.values(THEMES) as ThemeConfig[];

"use client";

import { CheckCircle2 } from "lucide-react";
import { THEME_LIST, type ThemeConfig, type ThemeId } from "./themes";

interface ThemePickerModalProps {
  currentThemeId: ThemeId;
  t: ThemeConfig;
  onSelect: (id: ThemeId) => void;
  onClose: () => void;
}

/** Full-screen overlay theme picker modal */
export function ThemePickerModal({
  currentThemeId,
  t,
  onSelect,
  onClose,
}: ThemePickerModalProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl border p-6 shadow-2xl backdrop-blur-2xl w-80 animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: t.headerBg,
          borderColor: t.border,
          color: t.text,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
          style={{ color: t.textMuted }}
        >
          Choose Theme
        </p>
        <div className="space-y-1.5">
          {THEME_LIST.map((th) => {
            const Icon = th.icon;
            const isActive = th.id === currentThemeId;
            return (
              <button
                key={th.id}
                onClick={() => onSelect(th.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
                style={{
                  background: isActive
                    ? "rgba(139,92,246,0.12)"
                    : "transparent",
                  border: `1px solid ${isActive ? "rgba(139,92,246,0.35)" : "transparent"}`,
                }}
              >
                {/* Mini swatch */}
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border"
                  style={{
                    background: th.bg,
                    borderColor: th.border,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: th.text }} />
                </div>
                <span className="text-sm font-semibold flex-1" style={{ color: t.text }}>
                  {th.label}
                </span>
                {isActive && (
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ThemeGridProps {
  currentThemeId: ThemeId;
  t: ThemeConfig;
  onSelect: (id: ThemeId) => void;
}

/** Inline 4-column theme grid (used inside Settings tab) */
export function ThemeGrid({ currentThemeId, t, onSelect }: ThemeGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {THEME_LIST.map((th) => {
        const Icon = th.icon;
        const isActive = th.id === currentThemeId;
        return (
          <button
            key={th.id}
            onClick={() => onSelect(th.id)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all hover:scale-105"
            style={{
              background: isActive ? "rgba(139,92,246,0.12)" : t.inputBg,
              borderColor: isActive ? "rgba(139,92,246,0.4)" : t.border,
            }}
            title={th.label}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: th.bg, border: `1px solid ${th.border}` }}
            >
              <Icon className="w-4 h-4" style={{ color: th.text }} />
            </div>
            <span
              className="text-[9px] font-semibold uppercase tracking-wide leading-none"
              style={{ color: t.textMuted }}
            >
              {th.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

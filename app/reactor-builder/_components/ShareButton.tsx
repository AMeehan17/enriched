"use client";

import { useState, useEffect, useCallback } from "react";

interface ShareButtonProps {
  /** Whether the user has any selection. Disables the button when nothing
      is configured (nothing meaningful to share). */
  hasAnySelection: boolean;
}

/**
 * ShareButton — copies the current `/reactor-builder` URL (with all
 * current nuqs query params) to the clipboard.
 *
 * Same pattern as Module 1's CiteButton clipboard copy: 1.5s visual
 * feedback, graceful fallback when clipboard API unavailable.
 *
 * Renders as a text link in the spec card footer area. Clicking it
 * grabs window.location.href (which nuqs keeps in sync with state)
 * and copies it.
 */
export function ShareButton({ hasAnySelection }: ShareButtonProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  // Auto-clear copy feedback after 1.5s
  useEffect(() => {
    if (copyState === "idle") return;
    const timer = setTimeout(() => setCopyState("idle"), 1500);
    return () => clearTimeout(timer);
  }, [copyState]);

  const handleCopy = useCallback(async () => {
    try {
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setCopyState("copied");
      } else {
        setCopyState("error");
      }
    } catch {
      setCopyState("error");
    }
  }, []);

  if (!hasAnySelection) return null;

  const label =
    copyState === "copied"
      ? "Link copied"
      : copyState === "error"
        ? "Copy failed"
        : "Share this build";

  return (
    <button
      onClick={handleCopy}
      aria-live="polite"
      className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium text-[var(--color-accent-text)] hover:text-[var(--color-accent)] transition-colors duration-[var(--duration-fast)] cursor-pointer bg-transparent border-0 p-0 inline-flex items-baseline gap-[4px]"
    >
      {label}
      <span aria-hidden="true">↗</span>
    </button>
  );
}

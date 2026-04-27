"use client";

import { useEffect } from "react";

/**
 * Some Supabase auth links end up on the site root (/) with tokens in the URL hash.
 * This component detects those and forwards the user to the correct page, preserving the hash.
 */
export function RecoveryHashRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash || "";
    if (!hash) return;

    // Supabase appends `type=...` in the hash.
    const isRecovery = hash.includes("type=recovery");
    const isSignup = hash.includes("type=signup");
    const isMagicLink = hash.includes("type=magiclink");
    if (!isRecovery && !isSignup && !isMagicLink) return;

    if (isRecovery) {
      if (window.location.pathname.startsWith("/reset-password")) return;
      window.location.replace(`/reset-password${hash}`);
      return;
    }

    // Signup/magiclink should land on the affiliate dashboard.
    if (window.location.pathname.startsWith("/dashboard")) return;
    window.location.replace(`/dashboard${hash}`);
    return;
  }, []);

  return null;
}


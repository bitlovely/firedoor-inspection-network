"use client";

import { useMemo, useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";

export function SubscriptionPanel({
  app,
  onChanged,
}: {
  app: {
    status: string;
    plan_type?: string | null;
    subscription_status?: string | null;
    subscription_current_period_end?: string | null;
  } | null;
  onChanged: () => void;
}) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approved = app?.status === "approved" || app?.status === "verified";
  const isAdvanced = app?.plan_type === "advanced" && app?.subscription_status === "active";
  const renewal = app?.subscription_current_period_end
    ? new Date(app.subscription_current_period_end)
    : null;

  async function startCheckout() {
    setError(null);
    setPending(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Please sign in again.");
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok || !json?.url) {
        throw new Error(json?.error ?? "Unable to start checkout");
      }
      window.location.assign(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start checkout");
    } finally {
      setPending(false);
    }
  }

  async function openPortal() {
    setError(null);
    setPending(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Please sign in again.");
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok || !json?.url) {
        throw new Error(json?.error ?? "Unable to open billing portal");
      }
      window.location.assign(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to open billing portal");
    } finally {
      setPending(false);
      onChanged();
    }
  }

  return (
    <section className="rounded-3xl border border-white/15 bg-white/8 p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold tracking-tight">Subscription</h2>
          <p className="mt-1 text-sm text-white/80">
            Upgrade to Advanced for full visibility and contact access.
          </p>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
          <CreditCard className="h-5 w-5 text-white/80" />
        </div>
      </div>

      {!app ? (
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm text-white/80">
          Complete registration first to manage your plan.
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold tracking-wider text-white/60 uppercase">Plan</p>
              <p className="mt-2 font-display text-2xl font-extrabold">
                {isAdvanced ? "Advanced" : "Basic"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                Contact access
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/90">
                <ShieldCheck className="h-4 w-4 text-white/70" />
                {isAdvanced ? "Enabled" : "Upgrade required"}
              </p>
              {isAdvanced && renewal ? (
                <p className="mt-2 text-xs text-white/60">
                  Renews on {renewal.toLocaleDateString()}
                </p>
              ) : null}
            </div>
          </div>

          {!approved ? (
            <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm text-amber-200">
              You can upgrade after your application is approved.
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-5 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {isAdvanced ? (
              <button
                type="button"
                onClick={openPortal}
                disabled={pending}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening…
                  </span>
                ) : (
                  "Manage subscription"
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={startCheckout}
                disabled={pending || !approved}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent-gradient px-6 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting…
                  </span>
                ) : (
                  "Upgrade to Advanced (£9/mo)"
                )}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}


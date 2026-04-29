"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  UserRound,
  BadgeCheck,
  Circle,
  Download,
  MapPin,
} from "lucide-react";
import { Header } from "@/components/landing/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CompleteRegistrationDialog } from "./CompleteRegistrationDialog";
import { ProfilePanel } from "./ProfilePanel";
import { SubscriptionPanel } from "./SubscriptionPanel";

type Application = {
  id: string;
  status: "pending" | "approved" | "rejected" | "verified" | string;
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  postcode: string;
  years_experience: number;
  areas_covered: string;
  created_at: string;
  certification_paths: unknown;
  insurance_path: string;
  dbs_path: string | null;
  profile_photo_path?: string | null;
  plan_type?: "basic" | "advanced" | string | null;
  subscription_status?: "active" | "inactive" | string | null;
  subscription_current_period_end?: string | null;
  verified_insurance?: boolean;
  verified_certification?: boolean;
  identity_checked?: boolean;
};

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function statusBadge(status: string) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide";
  switch (status) {
    case "approved":
      return `${base} border-emerald-600/25 bg-emerald-600/10 text-emerald-800`;
    case "verified":
      return `${base} border-emerald-600/25 bg-emerald-600/10 text-emerald-800`;
    case "rejected":
      return `${base} border-rose-600/25 bg-rose-600/10 text-rose-800`;
    case "pending":
      return `${base} border-amber-600/25 bg-amber-600/10 text-amber-900`;
    default:
      return `${base} border-black/10 bg-black/5 text-black/80`;
  }
}

function verifyPill(ok: boolean | undefined) {
  return ok ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/25 bg-emerald-600/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
      <BadgeCheck className="h-3.5 w-3.5" />
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-black/5 px-2 py-0.5 text-[11px] font-semibold text-black/70">
      <Circle className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [app, setApp] = useState<Application | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<
    "overview" | "profile" | "subscription"
  >("overview");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const tab = sp.get("tab");
    if (tab === "subscription") setActiveView("subscription");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      setPending(true);

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.push("/signin");
        return;
      }

      try {
        const res = await fetch("/api/me/application", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as
          | { application: Application | null }
          | { error: string };
        if (!res.ok) {
          throw new Error("error" in json ? json.error : "Unable to load dashboard");
        }
        if (!("application" in json)) {
          throw new Error("Unable to load dashboard");
        }
        if (!cancelled) {
          setApp(json.application);
          setShowRegister(json.application == null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        if (!cancelled) setPending(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  useEffect(() => {
    let cancelled = false;
    async function loadPhoto() {
      setProfilePhotoUrl(null);
      if (!app?.profile_photo_path) return;
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;
        const res = await fetch("/api/me/application/doc-url", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ path: app.profile_photo_path }),
        });
        const json = (await res.json().catch(() => null)) as { url?: string } | null;
        if (!cancelled && res.ok && json?.url) setProfilePhotoUrl(json.url);
      } catch {
        // ignore
      }
    }
    void loadPhoto();
    return () => {
      cancelled = true;
    };
  }, [app?.profile_photo_path, supabase]);

  async function refreshApplication() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch("/api/me/application", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await res.json().catch(() => null)) as
      | { application: Application | null }
      | { error: string }
      | null;
    if (res.ok && json && "application" in json) {
      setApp(json.application);
      setShowRegister(json.application == null);
    }
  }

  async function downloadDoc(path: string) {
    setDownloading(path);
    setError(null);
    // Open a tab synchronously to avoid popup blocking.
    // Don't pass `noopener` here; some browsers return a window handle that can't be navigated.
    const w = window.open("about:blank", "_blank");
    if (w) w.opener = null;
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        if (w) w.close();
        router.push("/signin");
        return;
      }
      const res = await fetch("/api/me/application/doc-url", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ path }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Unable to download document");
      }
      if (w) {
        w.location.href = json.url;
      } else {
        // Popup blocked: try opening directly; if still blocked, fall back to current tab.
        const w2 = window.open(json.url, "_blank", "noopener,noreferrer");
        if (!w2) window.location.assign(json.url);
      }
    } catch (e) {
      if (w) w.close();
      setError(e instanceof Error ? e.message : "Unable to download document");
    } finally {
      setDownloading(null);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/signin");
  }

  const certCount = app ? toArray(app.certification_paths).length : 0;
  const docCount = app ? certCount + 1 + (app.dbs_path ? 1 : 0) : 0;

  return (
    <main className="relative min-h-dvh w-full bg-[#f3f4f6] text-black">
      <Header />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 pt-24 pb-10 sm:px-6 sm:pt-28 lg:grid-cols-[240px_1fr] lg:gap-6 lg:px-10 lg:pt-28 lg:pb-14 2xl:max-w-[1400px]">
        <aside className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.18)] lg:sticky lg:top-8 lg:self-start">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-gradient shadow-accent-glow">
              {profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profilePhotoUrl}
                  alt=""
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <Image
                  src="/logo-mark.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5"
                  priority
                />
              )}
            </span>
            <div>
              <p className="font-display text-lg font-extrabold leading-none">Dashboard</p>
              <p className="mt-1 text-xs text-black/70">Affiliate</p>
            </div>
          </div>

          <nav className="mt-6 space-y-2 text-sm">
            <button
              type="button"
              onClick={() => setActiveView("overview")}
              className={`flex w-full items-center gap-3 rounded-2xl border border-black/10 px-4 py-3 text-left transition-colors ${
                activeView === "overview"
                  ? "bg-black/5 text-black"
                  : "bg-white text-black/80 hover:bg-black/5"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveView("profile")}
              className={`flex w-full items-center gap-3 rounded-2xl border border-black/10 px-4 py-3 text-left transition-colors ${
                activeView === "profile"
                  ? "bg-black/5 text-black"
                  : "bg-white text-black/80 hover:bg-black/5"
              }`}
            >
              <UserRound className="h-4 w-4" />
              Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveView("subscription")}
              className={`flex w-full items-center gap-3 rounded-2xl border border-black/10 px-4 py-3 text-left transition-colors ${
                activeView === "subscription"
                  ? "bg-black/5 text-black"
                  : "bg-white text-black/80 hover:bg-black/5"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Subscription
            </button>
          </nav>

          <div className="mt-6 border-t border-black/10 pt-6 space-y-3">
            <button
              type="button"
              onClick={signOut}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-gradient px-4 py-3 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-black/5"
            >
              Back to home
            </Link>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.18)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {activeView === "profile"
                    ? "Profile"
                    : activeView === "subscription"
                      ? "Subscription"
                      : "Affiliate dashboard"}
                </h1>
                <p className="mt-1 text-sm text-black/70">
                  {activeView === "profile"
                    ? "Manage your account details and company profile."
                    : activeView === "subscription"
                      ? "Upgrade for full visibility and contact access."
                      : "Your application status, profile details, and documents."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-black/10 bg-black/5 px-4 py-2 text-sm text-black/75">
                  <BarChart3 className="h-4 w-4 text-black/60" />
                  {activeView === "profile"
                    ? "Profile"
                    : activeView === "subscription"
                      ? "Subscription"
                      : "Overview"}
                </div>
              </div>
            </div>
          </header>

          {activeView === "overview" ? (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="group rounded-3xl border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black/5">
                        <BadgeCheck className="h-5 w-5 text-accent" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold tracking-wider text-black/60 uppercase">
                          Status
                        </p>
                        <div className="mt-1">
                          {app ? (
                            <span className={statusBadge(app.status)}>{app.status}</span>
                          ) : (
                            <span className={statusBadge("pending")}>—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group rounded-3xl border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black/5">
                      <Download className="h-5 w-5 text-accent" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold tracking-wider text-black/60 uppercase">
                        Documents
                      </p>
                      <div className="mt-1 flex items-end gap-2">
                        <p className="font-display text-3xl font-extrabold leading-none">
                          {app ? docCount : "—"}
                        </p>
                        <p className="text-xs font-semibold text-black/60">
                          Certs, insurance, DBS
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group rounded-3xl border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black/5">
                      <MapPin className="h-5 w-5 text-accent" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold tracking-wider text-black/60 uppercase">
                        Coverage
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-black/80 line-clamp-2">
                        {app ? app.areas_covered : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group rounded-3xl border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black/5">
                      <UserRound className="h-5 w-5 text-accent" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold tracking-wider text-black/60 uppercase">
                        Public profile
                      </p>
                      {app && (app.status === "approved" || app.status === "verified") ? (
                        <Link
                          href={`/directory?profile=${encodeURIComponent(app.id)}`}
                          className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black transition-colors hover:bg-black/5"
                        >
                          View profile
                        </Link>
                      ) : (
                        <p className="mt-2 text-sm text-black/80">
                          Available after approval.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

          <div className="mt-6 space-y-6">
            {pending ? (
              <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
                <p className="text-sm text-black/70">Loading…</p>
              </div>
            ) : error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : app ? (
              <div className="grid gap-6 lg:grid-cols-12">
                <section
                  className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm lg:col-span-7 sm:p-8"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                    <p className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                        Status
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className={statusBadge(app.status)}>{app.status}</span>
                        {(app.status === "approved" || app.status === "verified") && (
                          <Link
                            href={`/directory?profile=${encodeURIComponent(app.id)}`}
                            className="text-sm text-black underline-offset-4 hover:underline"
                          >
                            View public profile
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                        Application ID
                      </p>
                      <p className="mt-2 font-mono text-xs text-black/70">{app.id}</p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                        Name
                      </p>
                      <p className="mt-1 text-sm text-black/80">{app.full_name}</p>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                        Company
                      </p>
                      <p className="mt-1 text-sm text-black/80">{app.company_name}</p>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                        Email
                      </p>
                      <p className="mt-1 text-sm text-black/80">{app.email}</p>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                        Phone
                      </p>
                      <p className="mt-1 text-sm text-black/80">{app.phone}</p>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                        Location
                      </p>
                      <p className="mt-1 inline-flex items-center gap-2 text-sm text-black/80">
                        <MapPin className="h-4 w-4 text-black/60" />
                        {app.postcode}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                        Experience
                      </p>
                      <p className="mt-1 text-sm text-black/80">{app.years_experience} years</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-black/10 bg-black/5 p-4">
                    <p className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                      Coverage area
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-black/80">
                      {app.areas_covered}
                    </p>
                  </div>
                </section>

                <section
                  className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm lg:col-span-5 sm:p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                        Documents
                      </p>
                      <p className="mt-1 text-sm text-black/70">
                        Download your uploaded files.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-black/5 px-4 py-3">
                      <span className="text-sm text-black/80">Certifications</span>
                      <div className="flex items-center gap-2">
                        {verifyPill(app.verified_certification)}
                      </div>
                    </div>
                    {toArray(app.certification_paths).map((path, idx) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => downloadDoc(path)}
                        disabled={downloading === path}
                        className="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black transition-colors hover:bg-black/5 disabled:opacity-60"
                      >
                        <span className="truncate">Certification {idx + 1}</span>
                        <Download className="h-4 w-4 shrink-0" />
                      </button>
                    ))}
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-black/5 px-4 py-3">
                      <span className="text-sm text-black/80">Insurance</span>
                      <div className="flex items-center gap-2">
                        {verifyPill(app.verified_insurance)}
                        <button
                          type="button"
                          onClick={() => downloadDoc(app.insurance_path)}
                          disabled={downloading === app.insurance_path}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-black transition-colors hover:bg-black/5 disabled:opacity-60"
                          aria-label="Download insurance"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {app.dbs_path ? (
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-black/5 px-4 py-3">
                        <span className="text-sm text-black/80">DBS</span>
                        <div className="flex items-center gap-2">
                          {verifyPill(app.identity_checked)}
                          <button
                            type="button"
                            onClick={() => downloadDoc(app.dbs_path!)}
                            disabled={downloading === app.dbs_path}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-black transition-colors hover:bg-black/5 disabled:opacity-60"
                            aria-label="Download DBS"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 rounded-2xl border border-black/10 bg-black/5 p-4 text-xs text-black/70">
                    Downloads are secure links that expire quickly.
                  </div>
                </section>
              </div>
            ) : (
              <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
                <p className="text-sm text-black/70">
                  You’re signed in, but not registered as an affiliate yet.
                </p>
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="mt-5 inline-flex h-12 items-center justify-center rounded-2xl bg-accent-gradient px-6 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
                >
                  Complete registration
                </button>
              </div>
            )}
          </div>
            </>
          ) : activeView === "profile" ? (
            <div className="mt-6">
              <ProfilePanel
                initial={{ company_name: app?.company_name, phone: app?.phone }}
                onSaved={() => {
                  void refreshApplication();
                }}
              />
            </div>
          ) : (
            <div className="mt-6">
              <SubscriptionPanel
                app={app}
                onChanged={() => {
                  void refreshApplication();
                }}
              />
            </div>
          )}
        </section>
      </div>
      <CompleteRegistrationDialog
        open={showRegister}
        onClose={() => setShowRegister(false)}
        onCompleted={() => {
          // Reload application after completing registration.
          window.location.reload();
        }}
      />
      <SiteFooter />
    </main>
  );
}


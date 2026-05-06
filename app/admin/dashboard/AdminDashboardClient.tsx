"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, LogOut, MapPin, Search, Star, Timer, X, Zap } from "lucide-react";
import { authPrimaryButtonClassName } from "@/components/auth/authPrimaryButtonClassName";
import { AdminApplicationDetailClient } from "./[id]/ui/AdminApplicationDetailClient";

type Application = {
  id: string;
  created_at: string;
  status: string;
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  postcode: string;
  years_experience: number;
  areas_covered: string;
  certification_paths: unknown;
  insurance_path: string;
  dbs_path: string | null;
  internal_notes: string | null;
  profile_photo_url?: string | null;
  bio?: string | null;
  services?: string | null;
  review_count?: number;
  review_rating?: number | null;
};

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function initialsFromName(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function countBy(apps: Application[], status: string) {
  return apps.reduce((acc, a) => (a.status === status ? acc + 1 : acc), 0);
}

function serviceChips(services: string | null | undefined) {
  if (!services?.trim()) return { chips: [] as string[], remaining: 0 };
  const parts = services
    .split(/[\n,•|/]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  const unique = Array.from(new Set(parts));
  const chips = unique.slice(0, 6);
  return { chips, remaining: Math.max(0, unique.length - chips.length) };
}

function statusPill(status: string) {
  const base =
    "rounded-full border px-2.5 py-1 text-xs font-semibold capitalize tracking-wide";
  switch (status) {
    case "verified":
      return `${base} border-accent/30 bg-accent/10 text-accent`;
    case "approved":
      return `${base} border-emerald-600/25 bg-emerald-600/10 text-emerald-900`;
    case "pending":
      return `${base} border-amber-600/25 bg-amber-600/10 text-amber-900`;
    case "rejected":
      return `${base} border-rose-600/25 bg-rose-600/10 text-rose-900`;
    default:
      return `${base} border-black/10 bg-black/5 text-black`;
  }
}

export function AdminDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("application") ?? "";
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "verified" | "rejected"
  >("all");
  const [dateFilter, setDateFilter] = useState<"all" | "7d" | "30d" | "90d">("all");

  function openDrawer(id: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("application", id);
    router.push(`/admin/dashboard?${sp.toString()}`);
  }

  function closeDrawer() {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("application");
    const qs = sp.toString();
    router.push(qs ? `/admin/dashboard?${qs}` : "/admin/dashboard");
  }

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function load() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/applications");
      const json = (await res.json()) as
        | { applications: Application[] }
        | { error: string };
      if (!res.ok) throw new Error("error" in json ? json.error : "Unable to load");
      if (!("applications" in json)) {
        throw new Error("Unable to load");
      }
      setApps(json.applications);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load");
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/admin");
  }

  async function setStatus(id: string, status: string) {
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(`/api/admin/applications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = (await res.json().catch(() => null)) as
        | { application?: Application; error?: string }
        | null;
      if (!res.ok || !json?.application) {
        throw new Error(json?.error ?? "Update failed");
      }
      const updated = json.application;
      setApps((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  }

  async function saveNotes(id: string, internal_notes: string) {
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(`/api/admin/applications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ internal_notes }),
      });
      const json = (await res.json().catch(() => null)) as
        | { application?: Application; error?: string }
        | null;
      if (!res.ok || !json?.application) {
        throw new Error(json?.error ?? "Update failed");
      }
      const updated = json.application;
      setApps((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  }

  async function download(id: string, path: string) {
    const res = await fetch(`/api/admin/applications/${encodeURIComponent(id)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path }),
    });
    const json = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !json.url) {
      throw new Error(json.error ?? "Unable to create download link");
    }
    window.open(json.url, "_blank", "noopener,noreferrer");
  }

  const filtered = useMemo(() => {
    const now = Date.now();
    const minCreatedAt =
      dateFilter === "7d"
        ? now - 7 * 24 * 60 * 60 * 1000
        : dateFilter === "30d"
          ? now - 30 * 24 * 60 * 60 * 1000
          : dateFilter === "90d"
            ? now - 90 * 24 * 60 * 60 * 1000
            : null;

    const needle = q.trim().toLowerCase();
    return apps.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (minCreatedAt != null) {
        const t = Date.parse(a.created_at);
        if (Number.isFinite(t) && t < minCreatedAt) return false;
      }
      if (!needle) return true;
      const hay = `${a.full_name} ${a.company_name} ${a.email} ${a.postcode}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [apps, q, statusFilter, dateFilter]);

  return (
    <main className="min-h-dvh w-full bg-white text-black">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Admin dashboard
            </h1>
            <p className="mt-2 text-sm text-black">
              View applications, approve/reject, verify, and download documents.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent-gradient px-4 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
              onClick={signOut}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign out
              </span>
            </button>
            <Link
              href="/"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black transition-colors hover:bg-black/5"
            >
              Back to homepage
            </Link>
          </div>
        </div>

        {!pending && !error ? (
          <div className="mt-8 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-xs font-semibold tracking-wider text-black uppercase">
                Total
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold sm:mt-2 sm:text-3xl">
                {apps.length}
              </p>
            </div>
            <div className="rounded-3xl border border-amber-600/25 bg-amber-600/10 p-4 sm:p-5">
              <p className="text-xs font-semibold tracking-wider text-amber-900 uppercase">
                Pending
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold text-amber-950 sm:mt-2 sm:text-3xl">
                {countBy(apps, "pending")}
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-600/25 bg-emerald-600/10 p-4 sm:p-5">
              <p className="text-xs font-semibold tracking-wider text-emerald-900 uppercase">
                Approved
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold text-emerald-950 sm:mt-2 sm:text-3xl">
                {countBy(apps, "approved")}
              </p>
            </div>
            <div className="rounded-3xl border border-accent/25 bg-accent/10 p-4 sm:p-5">
              <p className="text-xs font-semibold tracking-wider text-accent uppercase">
                Verified
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold text-black sm:mt-2 sm:text-3xl">
                {countBy(apps, "verified")}
              </p>
            </div>
            <div className="rounded-3xl border border-rose-600/25 bg-rose-600/10 p-4 sm:p-5">
              <p className="text-xs font-semibold tracking-wider text-rose-900 uppercase">
                Rejected
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold text-rose-950 sm:mt-2 sm:text-3xl">
                {countBy(apps, "rejected")}
              </p>
            </div>
          </div>
        ) : null}

        {pending ? (
          <div className="mt-10 rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
            <p className="text-sm text-black">Loading…</p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="mt-10 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-black/10 bg-white p-3 shadow-sm sm:p-5">
            <div className="px-3 py-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold tracking-wider text-black uppercase">
                  Applications
                </p>
                <p className="text-xs text-black">{filtered.length} shown</p>
              </div>

              <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <label className="text-xs font-semibold tracking-wider text-black uppercase">
                    Search
                  </label>
                  <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Full name, company, email, postcode…"
                      className="h-11 w-full rounded-2xl border border-black/10 bg-white pl-10 pr-4 text-sm text-black placeholder:text-black outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>

                <div className="lg:w-[11.5rem]">
                  <label className="text-xs font-semibold tracking-wider text-black uppercase">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="mt-2 h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-black outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="lg:w-[12.5rem]">
                  <label className="text-xs font-semibold tracking-wider text-black uppercase">
                    Submitted
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                    className="mt-2 h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-black outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="all">All time</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="max-h-[70dvh] overflow-auto px-1 pb-1">
              <div className="space-y-3">
                {filtered.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => openDrawer(a.id)}
                    className="w-full rounded-3xl border border-black/10 bg-white p-4 text-left shadow-[0_30px_90px_-60px_rgba(0,0,0,0.18)] transition-colors hover:bg-black/5 sm:p-6"
                  >
                    {(() => {
                      const svc = serviceChips(a.services);
                      const areasCount = a.areas_covered
                        ? a.areas_covered.split(/\n+/).map((s) => s.trim()).filter(Boolean).length
                        : 0;
                      const rating =
                        typeof a.review_rating === "number"
                          ? Number(a.review_rating).toFixed(1)
                          : null;
                      const reviews = typeof a.review_count === "number" ? a.review_count : null;

                      return (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-black/5 text-xs font-semibold text-black sm:h-14 sm:w-14">
                                {a.profile_photo_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={a.profile_photo_url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  initialsFromName(a.full_name) || "—"
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <p className="truncate font-display text-lg font-extrabold text-black sm:text-xl">
                                    {a.full_name}
                                  </p>
                                  <span className={statusPill(a.status)}>{a.status}</span>
                                </div>
                                <p className="mt-0.5 truncate text-sm font-semibold text-black">
                                  {a.company_name}
                                </p>
                                <p className="mt-1 inline-flex items-center gap-2 text-sm text-black">
                                  <MapPin className="h-4 w-4 shrink-0 text-black/50" />
                                  {a.postcode}
                                </p>
                              </div>
                            </div>

                            <span className="hidden items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black sm:inline-flex">
                              View profile
                              <ChevronRight className="h-4 w-4 text-black" />
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-black/10 pt-4 sm:grid-cols-3 sm:gap-6">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white sm:h-11 sm:w-11">
                                <Timer className="h-5 w-5 text-black" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold tracking-wider text-black/60 uppercase">
                                  Experience
                                </p>
                                <p className="mt-1 text-sm font-semibold text-black">
                                  {Number.isFinite(a.years_experience)
                                    ? `${a.years_experience}+ years`
                                    : "—"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white sm:h-11 sm:w-11">
                                <MapPin className="h-5 w-5 text-black" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold tracking-wider text-black/60 uppercase">
                                  Areas covered
                                </p>
                                <p className="mt-1 text-sm font-semibold text-black">
                                  {areasCount > 0 ? `${areasCount}+` : "—"}
                                </p>
                              </div>
                            </div>

                            <div className="hidden items-center gap-3 sm:flex">
                              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white">
                                <Star className="h-5 w-5 text-black" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold tracking-wider text-black/60 uppercase">
                                  Reviews
                                </p>
                                <p className="mt-1 text-sm font-semibold text-black">
                                  {rating && reviews
                                    ? `${rating} (${reviews})`
                                    : reviews
                                      ? `${reviews}`
                                      : "—"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={
                                a.status === "verified" || a.status === "approved"
                                  ? "inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black"
                                  : "inline-flex items-center rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold text-black/70"
                              }
                            >
                              <Zap className="mr-2 h-3.5 w-3.5 text-accent" />
                              {a.status === "verified" || a.status === "approved"
                                ? "Available now"
                                : "Pending review"}
                            </span>
                          </div>

                          {svc.chips.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {svc.chips.map((c) => (
                                <span
                                  key={c}
                                  className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold text-black"
                                >
                                  {c}
                                </span>
                              ))}
                              {svc.remaining > 0 ? (
                                <span className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold text-black">
                                  +{svc.remaining}
                                </span>
                              ) : null}
                            </div>
                          ) : null}

                          {a.bio?.trim() ? (
                            <p className="text-sm leading-relaxed text-black line-clamp-3 sm:line-clamp-4">
                              {a.bio.trim()}
                            </p>
                          ) : null}

                          <span className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-accent bg-white px-4 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 sm:hidden">
                            View profile
                          </span>
                        </div>
                      );
                    })()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedId ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 z-40 bg-black/40"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <aside
            className="absolute right-0 top-0 z-50 h-full w-full bg-white text-black shadow-2xl ring-1 ring-black/10 lg:w-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between border-b border-black/10 px-5">
              <div className="font-display text-base font-bold">Application</div>
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-black transition-colors hover:bg-black/5"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[calc(100%-4rem)] overflow-y-auto px-5 py-6">
              <AdminApplicationDetailClient applicationId={selectedId} embedded />
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}


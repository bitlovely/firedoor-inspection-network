"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, Search } from "lucide-react";
import { authPrimaryButtonClassName } from "@/components/auth/authPrimaryButtonClassName";

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
};

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function countBy(apps: Application[], status: string) {
  return apps.reduce((acc, a) => (a.status === status ? acc + 1 : acc), 0);
}

export function AdminDashboardClient() {
  const router = useRouter();
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "verified" | "rejected"
  >("all");
  const [dateFilter, setDateFilter] = useState<"all" | "7d" | "30d" | "90d">("all");

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
    <main className="min-h-dvh w-full bg-black text-white">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Admin dashboard
            </h1>
            <p className="mt-2 text-sm text-white/80">
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
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Back to homepage
            </Link>
          </div>
        </div>

        {!pending && !error ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-3xl border border-white/15 bg-white/8 p-5 backdrop-blur-md">
              <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">
                Total
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold">{apps.length}</p>
            </div>
            <div className="rounded-3xl border border-amber-400/25 bg-amber-400/10 p-5">
              <p className="text-xs font-semibold tracking-wider text-amber-200/80 uppercase">
                Pending
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold text-amber-100">
                {countBy(apps, "pending")}
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-400/25 bg-emerald-400/10 p-5">
              <p className="text-xs font-semibold tracking-wider text-emerald-200/80 uppercase">
                Approved
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold text-emerald-100">
                {countBy(apps, "approved")}
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-5">
              <p className="text-xs font-semibold tracking-wider text-cyan-200/80 uppercase">
                Verified
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold text-cyan-100">
                {countBy(apps, "verified")}
              </p>
            </div>
            <div className="rounded-3xl border border-rose-400/25 bg-rose-400/10 p-5">
              <p className="text-xs font-semibold tracking-wider text-rose-200/80 uppercase">
                Rejected
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold text-rose-100">
                {countBy(apps, "rejected")}
              </p>
            </div>
          </div>
        ) : null}

        {pending ? (
          <div className="mt-10 rounded-3xl border border-white/15 bg-white/8 p-7 backdrop-blur-md">
            <p className="text-sm text-white/80">Loading…</p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="mt-10 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-white/15 bg-white/8 p-4 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-5">
            <div className="px-3 py-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">
                  Applications
                </p>
                <p className="text-xs text-white/60">{filtered.length} shown</p>
              </div>

              <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <label className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                    Search
                  </label>
                  <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Full name, company, email, postcode…"
                      className="h-11 w-full rounded-2xl border border-white/15 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                </div>

                <div className="lg:w-[11.5rem]">
                  <label className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as typeof statusFilter,
                      )
                    }
                    className="mt-2 h-11 w-full rounded-2xl border border-white/15 bg-black/60 px-4 text-sm text-white outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20 [color-scheme:dark]"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="lg:w-[12.5rem]">
                  <label className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                    Submitted
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                    className="mt-2 h-11 w-full rounded-2xl border border-white/15 bg-black/60 px-4 text-sm text-white outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20 [color-scheme:dark]"
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
                  <Link
                    key={a.id}
                    href={`/admin/dashboard/${encodeURIComponent(a.id)}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition-colors hover:bg-white/10"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {a.full_name}
                      </p>
                      <p className="mt-1 truncate text-xs text-white/70">
                        {a.company_name} · {a.postcode}
                      </p>
                      <p className="mt-1 truncate text-xs text-white/60">{a.email}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/90">
                        {a.status}
                      </span>
                      <ChevronRight className="h-4 w-4 text-white/60" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


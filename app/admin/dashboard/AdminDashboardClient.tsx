"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
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

          <div className="flex flex-wrap gap-3">
            <button type="button" className={authPrimaryButtonClassName} onClick={signOut}>
              <span className="inline-flex items-center justify-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign out
              </span>
            </button>
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
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">
                Applications
              </p>
              <p className="text-xs text-white/60">{apps.length} shown</p>
            </div>
            <div className="max-h-[70dvh] overflow-auto">
              {apps.map((a) => (
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
        )}
      </div>
    </main>
  );
}


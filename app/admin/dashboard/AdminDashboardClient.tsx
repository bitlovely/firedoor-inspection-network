"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, LogOut } from "lucide-react";
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
      const json = (await res.json()) as { application?: Application; error?: string };
      if (!res.ok || !json.application) throw new Error(json.error ?? "Update failed");
      setApps((prev) => prev.map((a) => (a.id === id ? json.application! : a)));
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
      const json = (await res.json()) as { application?: Application; error?: string };
      if (!res.ok || !json.application) throw new Error(json.error ?? "Update failed");
      setApps((prev) => prev.map((a) => (a.id === id ? json.application! : a)));
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
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              onClick={load}
            >
              Refresh
            </button>
            <button type="button" className={authPrimaryButtonClassName} onClick={signOut}>
              <span className="inline-flex items-center justify-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign out
              </span>
            </button>
          </div>
        </div>

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
          <div className="mt-10 grid gap-6">
            {apps.map((a) => {
              const certs = toArray(a.certification_paths);
              const busy = Boolean(saving[a.id]);
              return (
                <article
                  key={a.id}
                  className="rounded-3xl border border-white/15 bg-white/8 p-7 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-9"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Applicant
                      </p>
                      <h2 className="mt-1 font-display text-xl font-bold">
                        {a.full_name}
                      </h2>
                      <p className="mt-1 text-sm text-white/80">{a.company_name}</p>
                      <p className="mt-2 text-sm text-white/90">
                        {a.email} · {a.phone}
                      </p>
                      <p className="mt-1 text-sm text-white/80">
                        Postcode: {a.postcode} · Experience: {a.years_experience}y
                      </p>
                    </div>

                    <div className="min-w-[220px]">
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Status
                      </p>
                      <p className="mt-1 text-lg font-semibold">{a.status}</p>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setStatus(a.id, "approved")}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setStatus(a.id, "rejected")}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setStatus(a.id, "verified")}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-accent-gradient px-3 text-xs font-semibold text-accent-foreground shadow-accent-glow hover:opacity-95 disabled:opacity-60"
                        >
                          Verify
                        </button>
                      </div>

                      <div className="mt-3">
                        <Link
                          href={`/affiliates/${encodeURIComponent(a.id)}`}
                          className="text-sm text-white underline-offset-4 hover:underline"
                        >
                          Public profile (approved/verified only)
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Coverage area
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-white/90">
                        {a.areas_covered}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Documents
                      </p>
                      <div className="mt-2 space-y-2">
                        {certs.map((path, idx) => (
                          <button
                            key={path}
                            type="button"
                            disabled={busy}
                            onClick={() => download(a.id, path)}
                            className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60"
                          >
                            <span className="truncate">Certification {idx + 1}</span>
                            <Download className="h-4 w-4 shrink-0" />
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => download(a.id, a.insurance_path)}
                          className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60"
                        >
                          <span className="truncate">Insurance</span>
                          <Download className="h-4 w-4 shrink-0" />
                        </button>
                        {a.dbs_path ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => download(a.id, a.dbs_path!)}
                            className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60"
                          >
                            <span className="truncate">DBS</span>
                            <Download className="h-4 w-4 shrink-0" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-xs font-semibold tracking-wider text-white uppercase">
                      Internal notes
                    </p>
                    <textarea
                      defaultValue={a.internal_notes ?? ""}
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20"
                      placeholder="Notes for reviewers…"
                      onBlur={(e) => saveNotes(a.id, e.currentTarget.value)}
                    />
                    <p className="mt-2 text-xs text-white/60">
                      Saved on blur. {busy ? "Saving…" : ""}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}


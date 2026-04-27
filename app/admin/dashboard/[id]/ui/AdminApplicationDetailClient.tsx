"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Download, Loader2, ChevronLeft } from "lucide-react";

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
  verified_insurance?: boolean;
  verified_certification?: boolean;
  identity_checked?: boolean;
};

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function badge(status: string) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide";
  switch (status) {
    case "approved":
      return `${base} border-emerald-400/30 bg-emerald-400/10 text-emerald-200`;
    case "verified":
      return `${base} border-cyan-400/30 bg-cyan-400/10 text-cyan-200`;
    case "rejected":
      return `${base} border-rose-400/30 bg-rose-400/10 text-rose-200`;
    case "pending":
      return `${base} border-amber-400/30 bg-amber-400/10 text-amber-200`;
    default:
      return `${base} border-white/20 bg-white/5 text-white/90`;
  }
}

export function AdminApplicationDetailClient() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [pending, setPending] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [app, setApp] = useState<Application | null>(null);

  async function load() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/admin/applications/${encodeURIComponent(id)}`);
      const json = (await res.json()) as
        | { application: Application }
        | { error: string };
      if (!res.ok) throw new Error("error" in json ? json.error : "Unable to load");
      if (!("application" in json)) throw new Error("Unable to load");
      setApp(json.application);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load");
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function patch(patch: {
    status?: string;
    internal_notes?: string;
    verified_insurance?: boolean;
    verified_certification?: boolean;
    identity_checked?: boolean;
  }) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = (await res.json().catch(() => null)) as
        | { application?: Application; error?: string }
        | null;
      if (!res.ok || !json?.application) throw new Error(json?.error ?? "Update failed");
      setApp(json.application);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function download(path: string) {
    const res = await fetch(`/api/admin/applications/${encodeURIComponent(id)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path }),
    });
    const json = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (!res.ok || !json?.url) throw new Error(json?.error ?? "Unable to download");
    window.open(json.url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-dvh w-full bg-black text-white">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-sm text-white/80 underline-offset-4 hover:text-white hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </div>

          <div className="mt-6 rounded-3xl border border-white/15 bg-white/8 p-7 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-9">
            {pending ? (
              <p className="text-sm text-white/80">Loading…</p>
            ) : error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : app ? (
              <div className="space-y-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-white uppercase">
                      Applicant
                    </p>
                    <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
                      {app.full_name}
                    </h1>
                    <p className="mt-1 text-sm text-white/80">{app.company_name}</p>
                    <p className="mt-2 text-sm text-white/90">
                      {app.email} · {app.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold tracking-wider text-white uppercase">
                      Status
                    </p>
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <span className={badge(app.status)}>{app.status}</span>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin text-white/70" /> : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  <section className="lg:col-span-2 space-y-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-semibold tracking-wider text-white uppercase">
                          Postcode
                        </p>
                        <p className="mt-1 text-sm text-white/90">{app.postcode}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-semibold tracking-wider text-white uppercase">
                          Experience
                        </p>
                        <p className="mt-1 text-sm text-white/90">{app.years_experience} years</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Coverage area
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-white/90">
                        {app.areas_covered}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Internal notes
                      </p>
                      <textarea
                        defaultValue={app.internal_notes ?? ""}
                        rows={4}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20"
                        placeholder="Notes for reviewers…"
                        onBlur={(e) => patch({ internal_notes: e.currentTarget.value })}
                      />
                    </div>
                  </section>

                  <aside className="space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Actions
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => patch({ status: "approved" })}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => patch({ status: "rejected" })}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Documents
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                          <div className="flex min-w-0 items-center gap-2">
                            {app.verified_certification ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                            ) : (
                              <Circle className="h-4 w-4 text-white/40" />
                            )}
                            <span className="truncate text-sm text-white">
                              Certifications ({toArray(app.certification_paths).length})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={saving || toArray(app.certification_paths).length === 0}
                              onClick={() => {
                                const first = toArray(app.certification_paths)[0];
                                if (first) void download(first);
                              }}
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                              title="Download first certification"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() =>
                                patch({ verified_certification: !app.verified_certification })
                              }
                              className="inline-flex h-9 items-center justify-center rounded-lg bg-accent-gradient px-3 text-xs font-semibold text-accent-foreground shadow-accent-glow hover:opacity-95 disabled:opacity-60"
                            >
                              {app.verified_certification ? "Unverify" : "Verify"}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                          <div className="flex min-w-0 items-center gap-2">
                            {app.verified_insurance ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                            ) : (
                              <Circle className="h-4 w-4 text-white/40" />
                            )}
                            <span className="truncate text-sm text-white">Insurance</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => download(app.insurance_path)}
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => patch({ verified_insurance: !app.verified_insurance })}
                              className="inline-flex h-9 items-center justify-center rounded-lg bg-accent-gradient px-3 text-xs font-semibold text-accent-foreground shadow-accent-glow hover:opacity-95 disabled:opacity-60"
                            >
                              {app.verified_insurance ? "Unverify" : "Verify"}
                            </button>
                          </div>
                        </div>

                        {app.dbs_path ? (
                          <div className="flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                            <div className="flex min-w-0 items-center gap-2">
                              {app.identity_checked ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                              ) : (
                                <Circle className="h-4 w-4 text-white/40" />
                              )}
                              <span className="truncate text-sm text-white">DBS</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => download(app.dbs_path!)}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => patch({ identity_checked: !app.identity_checked })}
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-accent-gradient px-3 text-xs font-semibold text-accent-foreground shadow-accent-glow hover:opacity-95 disabled:opacity-60"
                              >
                                {app.identity_checked ? "Unverify" : "Verify"}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <p className="mt-3 text-xs text-white/60">
                        Downloads are secure links that expire quickly.
                      </p>
                    </div>
                  </aside>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/80">Not found.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}


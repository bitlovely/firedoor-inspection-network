"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  Circle,
  ClipboardCheck,
  Download,
  FileBadge,
  IdCard,
  Loader2,
  MapPin,
  ScrollText,
  ShieldCheck,
  Timer,
} from "lucide-react";

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
  bio?: string | null;
  services?: string | null;
  review_count?: number;
  review_rating?: number | null;
  certification_paths: unknown;
  insurance_path: string;
  dbs_path: string | null;
  internal_notes: string | null;
  verified_insurance?: boolean;
  verified_certification?: boolean;
  identity_checked?: boolean;
};

function initialsFromName(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function badge(status: string, light: boolean) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide";
  if (light) {
    switch (status) {
      case "approved":
        return `${base} border-emerald-600/25 bg-emerald-600/10 text-emerald-900`;
      case "verified":
        return `${base} border-accent/30 bg-accent/10 text-accent`;
      case "rejected":
        return `${base} border-rose-600/25 bg-rose-600/10 text-rose-900`;
      case "pending":
        return `${base} border-amber-600/25 bg-amber-600/10 text-amber-950`;
      default:
        return `${base} border-black/10 bg-black/5 text-black`;
    }
  }
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

export function AdminApplicationDetailClient({
  applicationId,
  embedded,
}: {
  applicationId?: string;
  embedded?: boolean;
}) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = applicationId ?? params?.id ?? "";
  const [pending, setPending] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [app, setApp] = useState<Application | null>(null);
  const allowDocVerify = app?.status === "approved" || app?.status === "verified";
  const certs = useMemo(() => toArray(app?.certification_paths), [app?.certification_paths]);
  const light = Boolean(embedded);

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
    setError(null);
    // Open a window synchronously to avoid popup blocking.
    const w = window.open("", "_blank", "noopener,noreferrer");
    try {
      const res = await fetch(`/api/admin/applications/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const json = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (!res.ok || !json?.url) throw new Error(json?.error ?? "Unable to download");
      if (w) {
        w.location.href = json.url;
      } else {
        window.location.assign(json.url);
      }
    } catch (e) {
      if (w) w.close();
      setError(e instanceof Error ? e.message : "Unable to download");
    }
  }

  const lightContent = (
    <div className="space-y-6">
      {pending ? (
        <p className="text-sm text-black">Loading…</p>
      ) : error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : app ? (
        <>
          <div className="flex items-start gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-black/10 bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/public/profile-photo?id=${encodeURIComponent(app.id)}`}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-black/70">
                {initialsFromName(app.full_name) || "—"}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="min-w-0 truncate font-display text-xl font-extrabold text-black">
                  {app.full_name}
                </h2>
                <span className={badge(app.status, true)}>{app.status}</span>
                {saving ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : null}
              </div>
              <p className="mt-1 text-sm font-semibold text-black">{app.company_name}</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-black">
                <MapPin className="h-4 w-4 shrink-0 text-black/50" />
                {app.postcode}
              </p>
              <p className="mt-2 text-sm text-black">{app.email} · {app.phone}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {app.bio?.trim() ? (
                <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.12)]">
                  <h3 className="flex items-center gap-2 font-display text-sm font-bold text-black">
                    <ScrollText className="h-4 w-4 text-accent" />
                    Bio
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-black">
                    {app.bio.trim()}
                  </p>
                </section>
              ) : null}

              {app.services?.trim() ? (
                <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.12)]">
                  <h3 className="flex items-center gap-2 font-display text-sm font-bold text-black">
                    <Briefcase className="h-4 w-4 text-accent" />
                    Services
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-black">
                    {app.services.trim()}
                  </p>
                </section>
              ) : null}

              <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.12)]">
                <h3 className="flex items-center gap-2 font-display text-sm font-bold text-black">
                  <MapPin className="h-4 w-4 text-accent" />
                  Coverage
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-black/60 uppercase">
                      <Timer className="h-4 w-4 text-black/50" />
                      Experience
                    </div>
                    <div className="mt-2 font-display text-2xl font-extrabold text-black">
                      {Number.isFinite(app.years_experience) ? app.years_experience : "—"}
                      {Number.isFinite(app.years_experience) ? (
                        <span className="ml-1 align-baseline text-sm font-semibold text-black/60">
                          yrs
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-black/60 uppercase">
                      <MapPin className="h-4 w-4 text-black/50" />
                      Areas covered
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-black">
                      {app.areas_covered}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.12)]">
                <h3 className="flex items-center gap-2 font-display text-sm font-bold text-black">
                  <ClipboardCheck className="h-4 w-4 text-accent" />
                  Trust
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-black/5 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white">
                        <FileBadge className="h-4 w-4 text-black/60" />
                      </span>
                      <span className="text-black">Insurance check</span>
                    </div>
                    {app.verified_insurance ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/25 bg-emerald-600/10 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-black/5 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white">
                        <ShieldCheck className="h-4 w-4 text-black/60" />
                      </span>
                      <span className="text-black">Certification check</span>
                    </div>
                    {app.verified_certification ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/25 bg-emerald-600/10 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    ) : null}
                  </div>
                  {app.dbs_path ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-black/5 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white">
                          <IdCard className="h-4 w-4 text-black/60" />
                        </span>
                        <span className="text-black">DBS Check</span>
                      </div>
                      {app.identity_checked ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/25 bg-emerald-600/10 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.12)]">
                <h3 className="flex items-center gap-2 font-display text-sm font-bold text-black">
                  <ClipboardCheck className="h-4 w-4 text-accent" />
                  Admin actions
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => patch({ status: "approved" })}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-black transition-colors hover:bg-black/5 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => patch({ status: "rejected" })}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-black transition-colors hover:bg-black/5 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-semibold tracking-wider text-black/60 uppercase">
                    Internal notes
                  </p>
                  <textarea
                    defaultValue={app.internal_notes ?? ""}
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                    placeholder="Notes for reviewers…"
                    onBlur={(e) => patch({ internal_notes: e.currentTarget.value })}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.12)]">
                <h3 className="flex items-center gap-2 font-display text-sm font-bold text-black">
                  <FileBadge className="h-4 w-4 text-accent" />
                  Documents
                </h3>

                <div className="mt-3 space-y-2">
                  <div className="rounded-xl border border-black/10 bg-white px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        {app.verified_certification ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        ) : (
                          <Circle className="h-4 w-4 text-black/30" />
                        )}
                        <span className="truncate text-sm text-black">
                          Certifications ({certs.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={saving || !allowDocVerify}
                        onClick={() =>
                          patch({ verified_certification: !app.verified_certification })
                        }
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-accent-gradient px-3 text-xs font-semibold text-accent-foreground shadow-accent-glow hover:opacity-95 disabled:opacity-60"
                      >
                        {app.verified_certification ? "Unverify" : "Verify"}
                      </button>
                    </div>

                    {certs.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {certs.map((p, idx) => (
                          <div
                            key={`${p}-${idx}`}
                            className="flex items-center justify-between gap-2 rounded-lg border border-black/10 bg-black/5 px-3 py-2"
                          >
                            <span className="min-w-0 truncate text-xs font-semibold text-black">
                              Certification {idx + 1}
                            </span>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void download(p)}
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-3 text-xs font-semibold text-black transition-colors hover:bg-black/5 disabled:opacity-60"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-black">No certification files.</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {app.verified_insurance ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      ) : (
                        <Circle className="h-4 w-4 text-black/30" />
                      )}
                      <span className="truncate text-sm text-black">Insurance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => download(app.insurance_path)}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-3 text-xs font-semibold text-black transition-colors hover:bg-black/5 disabled:opacity-60"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={saving || !allowDocVerify}
                        onClick={() => patch({ verified_insurance: !app.verified_insurance })}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-accent-gradient px-3 text-xs font-semibold text-accent-foreground shadow-accent-glow hover:opacity-95 disabled:opacity-60"
                      >
                        {app.verified_insurance ? "Unverify" : "Verify"}
                      </button>
                    </div>
                  </div>

                  {app.dbs_path ? (
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        {app.identity_checked ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        ) : (
                          <Circle className="h-4 w-4 text-black/30" />
                        )}
                        <span className="truncate text-sm text-black">DBS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => download(app.dbs_path!)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-3 text-xs font-semibold text-black transition-colors hover:bg-black/5 disabled:opacity-60"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={saving || !allowDocVerify}
                          onClick={() => patch({ identity_checked: !app.identity_checked })}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-accent-gradient px-3 text-xs font-semibold text-accent-foreground shadow-accent-glow hover:opacity-95 disabled:opacity-60"
                        >
                          {app.identity_checked ? "Unverify" : "Verify"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
                <p className="mt-3 text-xs text-black">Downloads are secure links that expire quickly.</p>
              </section>
            </aside>
          </div>
        </>
      ) : (
        <p className="text-sm text-black">Not found.</p>
      )}
    </div>
  );

  const content = (
    <div
      className={
        light
          ? "rounded-3xl border border-black/10 bg-white p-7 shadow-sm sm:p-9"
          : "rounded-3xl border border-white/15 bg-white/8 p-7 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-9"
      }
    >
      {pending ? (
        <p className={light ? "text-sm text-black" : "text-sm text-white/80"}>Loading…</p>
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
                    <p
                      className={
                        light
                          ? "text-xs font-semibold tracking-wider text-black uppercase"
                          : "text-xs font-semibold tracking-wider text-white uppercase"
                      }
                    >
                      Applicant
                    </p>
                    <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
                      {app.full_name}
                    </h1>
                    <p className={light ? "mt-1 text-sm text-black" : "mt-1 text-sm text-white/80"}>
                      {app.company_name}
                    </p>
                    <p className={light ? "mt-2 text-sm text-black" : "mt-2 text-sm text-white/90"}>
                      {app.email} · {app.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={
                        light
                          ? "text-xs font-semibold tracking-wider text-black uppercase"
                          : "text-xs font-semibold tracking-wider text-white uppercase"
                      }
                    >
                      Status
                    </p>
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <span className={badge(app.status, light)}>{app.status}</span>
                      {saving ? (
                        <Loader2
                          className={`h-4 w-4 animate-spin ${light ? "text-black" : "text-white/70"}`}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  <section className="lg:col-span-2 space-y-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div
                        className={
                          light
                            ? "rounded-2xl border border-black/10 bg-black/5 p-4"
                            : "rounded-2xl border border-white/10 bg-white/5 p-4"
                        }
                      >
                        <p
                          className={
                            light
                              ? "text-xs font-semibold tracking-wider text-black uppercase"
                              : "text-xs font-semibold tracking-wider text-white uppercase"
                          }
                        >
                          Postcode
                        </p>
                        <p className={light ? "mt-1 text-sm text-black" : "mt-1 text-sm text-white/90"}>
                          {app.postcode}
                        </p>
                      </div>
                      <div
                        className={
                          light
                            ? "rounded-2xl border border-black/10 bg-black/5 p-4"
                            : "rounded-2xl border border-white/10 bg-white/5 p-4"
                        }
                      >
                        <p
                          className={
                            light
                              ? "text-xs font-semibold tracking-wider text-black uppercase"
                              : "text-xs font-semibold tracking-wider text-white uppercase"
                          }
                        >
                          Experience
                        </p>
                        <p className={light ? "mt-1 text-sm text-black" : "mt-1 text-sm text-white/90"}>
                          {app.years_experience} years
                        </p>
                      </div>
                    </div>

                    <div
                      className={
                        light
                          ? "rounded-2xl border border-black/10 bg-black/5 p-4"
                          : "rounded-2xl border border-white/10 bg-white/5 p-4"
                      }
                    >
                      <p
                        className={
                          light
                            ? "text-xs font-semibold tracking-wider text-black uppercase"
                            : "text-xs font-semibold tracking-wider text-white uppercase"
                        }
                      >
                        Coverage area
                      </p>
                      <p className={light ? "mt-2 whitespace-pre-wrap text-sm text-black" : "mt-2 whitespace-pre-wrap text-sm text-white/90"}>
                        {app.areas_covered}
                      </p>
                    </div>

                    {app.bio?.trim() ? (
                      <div
                        className={
                          light
                            ? "rounded-2xl border border-black/10 bg-black/5 p-4"
                            : "rounded-2xl border border-white/10 bg-white/5 p-4"
                        }
                      >
                        <p
                          className={
                            light
                              ? "text-xs font-semibold tracking-wider text-black uppercase"
                              : "text-xs font-semibold tracking-wider text-white uppercase"
                          }
                        >
                          Bio
                        </p>
                        <p
                          className={
                            light
                              ? "mt-2 whitespace-pre-wrap text-sm text-black"
                              : "mt-2 whitespace-pre-wrap text-sm text-white/90"
                          }
                        >
                          {app.bio.trim()}
                        </p>
                      </div>
                    ) : null}

                    {app.services?.trim() ? (
                      <div
                        className={
                          light
                            ? "rounded-2xl border border-black/10 bg-black/5 p-4"
                            : "rounded-2xl border border-white/10 bg-white/5 p-4"
                        }
                      >
                        <p
                          className={
                            light
                              ? "text-xs font-semibold tracking-wider text-black uppercase"
                              : "text-xs font-semibold tracking-wider text-white uppercase"
                          }
                        >
                          Services
                        </p>
                        <p
                          className={
                            light
                              ? "mt-2 whitespace-pre-wrap text-sm text-black"
                              : "mt-2 whitespace-pre-wrap text-sm text-white/90"
                          }
                        >
                          {app.services.trim()}
                        </p>
                      </div>
                    ) : null}

                    <div
                      className={
                        light
                          ? "rounded-2xl border border-black/10 bg-black/5 p-4"
                          : "rounded-2xl border border-white/10 bg-white/5 p-4"
                      }
                    >
                      <p
                        className={
                          light
                            ? "text-xs font-semibold tracking-wider text-black uppercase"
                            : "text-xs font-semibold tracking-wider text-white uppercase"
                        }
                      >
                        Internal notes
                      </p>
                      <textarea
                        defaultValue={app.internal_notes ?? ""}
                        rows={4}
                        className={
                          light
                            ? "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                            : "mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20"
                        }
                        placeholder="Notes for reviewers…"
                        onBlur={(e) => patch({ internal_notes: e.currentTarget.value })}
                      />
                    </div>
                  </section>

                  <aside className="space-y-6">
                    <div
                      className={
                        light
                          ? "rounded-2xl border border-black/10 bg-black/5 p-4"
                          : "rounded-2xl border border-white/10 bg-white/5 p-4"
                      }
                    >
                      <p
                        className={
                          light
                            ? "text-xs font-semibold tracking-wider text-black uppercase"
                            : "text-xs font-semibold tracking-wider text-white uppercase"
                        }
                      >
                        Actions
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => patch({ status: "approved" })}
                          className={
                            light
                              ? "inline-flex h-10 items-center justify-center rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-black transition-colors hover:bg-black/5 disabled:opacity-60"
                              : "inline-flex h-10 items-center justify-center rounded-xl bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                          }
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => patch({ status: "rejected" })}
                          className={
                            light
                              ? "inline-flex h-10 items-center justify-center rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-black transition-colors hover:bg-black/5 disabled:opacity-60"
                              : "inline-flex h-10 items-center justify-center rounded-xl bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    <div
                      className={
                        light
                          ? "rounded-2xl border border-black/10 bg-black/5 p-4"
                          : "rounded-2xl border border-white/10 bg-white/5 p-4"
                      }
                    >
                      <p
                        className={
                          light
                            ? "text-xs font-semibold tracking-wider text-black uppercase"
                            : "text-xs font-semibold tracking-wider text-white uppercase"
                        }
                      >
                        Documents
                      </p>
                      <div className="mt-3 space-y-2">
                        <div
                          className={
                            light
                              ? "rounded-xl border border-black/10 bg-white px-3 py-2"
                              : "rounded-xl border border-white/15 bg-white/5 px-3 py-2"
                          }
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              {app.verified_certification ? (
                                <CheckCircle2 className={`h-4 w-4 ${light ? "text-emerald-700" : "text-emerald-300"}`} />
                              ) : (
                                <Circle className={`h-4 w-4 ${light ? "text-black/30" : "text-white/40"}`} />
                              )}
                              <span className={`truncate text-sm ${light ? "text-black" : "text-white"}`}>
                                Certifications ({certs.length})
                              </span>
                            </div>
                            <button
                              type="button"
                              disabled={saving || !allowDocVerify}
                              onClick={() =>
                                patch({ verified_certification: !app.verified_certification })
                              }
                              className="inline-flex h-9 items-center justify-center rounded-lg bg-accent-gradient px-3 text-xs font-semibold text-accent-foreground shadow-accent-glow hover:opacity-95 disabled:opacity-60"
                            >
                              {app.verified_certification ? "Unverify" : "Verify"}
                            </button>
                          </div>

                          {certs.length > 0 ? (
                            <div className="mt-2 space-y-2">
                              {certs.map((p, idx) => (
                                <div
                                  key={`${p}-${idx}`}
                                  className={
                                    light
                                      ? "flex items-center justify-between gap-2 rounded-lg border border-black/10 bg-black/5 px-3 py-2"
                                      : "flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                                  }
                                >
                                  <span className={`min-w-0 truncate text-xs font-semibold ${light ? "text-black" : "text-white/80"}`}>
                                    Certification {idx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => void download(p)}
                                    className={
                                      light
                                        ? "inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-3 text-xs font-semibold text-black transition-colors hover:bg-black/5 disabled:opacity-60"
                                        : "inline-flex h-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                                    }
                                    title="Download"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className={`mt-2 text-xs ${light ? "text-black" : "text-white/60"}`}>No certification files.</p>
                          )}
                        </div>

                        <div
                          className={
                            light
                              ? "flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-3 py-2"
                              : "flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2"
                          }
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            {app.verified_insurance ? (
                              <CheckCircle2 className={`h-4 w-4 ${light ? "text-emerald-700" : "text-emerald-300"}`} />
                            ) : (
                              <Circle className={`h-4 w-4 ${light ? "text-black/30" : "text-white/40"}`} />
                            )}
                            <span className={`truncate text-sm ${light ? "text-black" : "text-white"}`}>Insurance</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => download(app.insurance_path)}
                              className={
                                light
                                  ? "inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-3 text-xs font-semibold text-black transition-colors hover:bg-black/5 disabled:opacity-60"
                                  : "inline-flex h-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                              }
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={saving || !allowDocVerify}
                              onClick={() => patch({ verified_insurance: !app.verified_insurance })}
                              className="inline-flex h-9 items-center justify-center rounded-lg bg-accent-gradient px-3 text-xs font-semibold text-accent-foreground shadow-accent-glow hover:opacity-95 disabled:opacity-60"
                            >
                              {app.verified_insurance ? "Unverify" : "Verify"}
                            </button>
                          </div>
                        </div>

                        {app.dbs_path ? (
                          <div
                            className={
                              light
                                ? "flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-3 py-2"
                                : "flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2"
                            }
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              {app.identity_checked ? (
                                <CheckCircle2 className={`h-4 w-4 ${light ? "text-emerald-700" : "text-emerald-300"}`} />
                              ) : (
                                <Circle className={`h-4 w-4 ${light ? "text-black/30" : "text-white/40"}`} />
                              )}
                              <span className={`truncate text-sm ${light ? "text-black" : "text-white"}`}>DBS</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => download(app.dbs_path!)}
                                className={
                                  light
                                    ? "inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-3 text-xs font-semibold text-black transition-colors hover:bg-black/5 disabled:opacity-60"
                                    : "inline-flex h-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                                }
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                disabled={saving || !allowDocVerify}
                                onClick={() => patch({ identity_checked: !app.identity_checked })}
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-accent-gradient px-3 text-xs font-semibold text-accent-foreground shadow-accent-glow hover:opacity-95 disabled:opacity-60"
                              >
                                {app.identity_checked ? "Unverify" : "Verify"}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <p className={`mt-3 text-xs ${light ? "text-black" : "text-white/60"}`}>
                        Downloads are secure links that expire quickly.
                      </p>
                    </div>
                  </aside>
                </div>
              </div>
      ) : (
        <p className={light ? "text-sm text-black" : "text-sm text-white/80"}>Not found.</p>
      )}
    </div>
  );

  if (embedded) {
    return lightContent;
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
          <div className="mt-6">{content}</div>
        </div>
      </div>
    </main>
  );
}


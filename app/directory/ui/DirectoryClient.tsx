"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  FileBadge,
  Filter,
  Briefcase,
  ClipboardCheck,
  IdCard,
  MapPin,
  ScrollText,
  Search,
  ShieldCheck,
  Timer,
  Zap,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type Affiliate = {
  id: string;
  status: string;
  full_name: string;
  company_name: string;
  postcode: string;
  bio: string | null;
  profile_photo_path: string | null;
  dbs_path?: string | null;
  email: string | null;
  phone: string | null;
  contact_enabled: boolean;
  created_at: string;
  services?: string | null;
  areas_covered?: string;
  years_experience?: number;
  verified_insurance?: boolean;
  verified_certification?: boolean;
  identity_checked?: boolean;
  review_count?: number;
  review_rating?: number | null;
};

function initialsFromName(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function badge(status: string) {
  if (status !== "verified") return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-600/25 bg-emerald-600/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 sm:px-2.5 sm:py-1 sm:text-xs">
      <ShieldCheck className="h-3 w-3 text-emerald-700 sm:h-3.5 sm:w-3.5" />
      Verified Inspector
    </span>
  );
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

function truncateBioTwoSentences(raw: string): string {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return "";

  // Prefer the platform sentence segmenter to avoid false stops like "U.S."
  try {
    const Seg = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
    if (Seg) {
      const seg = new Seg("en", { granularity: "sentence" });
      const parts = Array.from(seg.segment(text))
        .map((s) => s.segment.trim())
        .filter(Boolean);
      if (parts.length > 0) {
        const firstTwo = parts.slice(0, 2).join(" ").trim();
        const hasMore = parts.length > 2 && text.length > firstTwo.length + 1;
        return hasMore ? `${firstTwo}…` : firstTwo;
      }
    }
  } catch {
    // fall back below
  }

  // Fallback: keep a reasonable preview length.
  const max = 260;
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export function DirectoryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("profile") ?? "";
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [postcode, setPostcode] = useState("");
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Affiliate[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [drawerPending, setDrawerPending] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [drawerAffiliate, setDrawerAffiliate] = useState<Affiliate | null>(null);

  const params = useMemo(() => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (name.trim()) sp.set("name", name.trim());
    if (company.trim()) sp.set("company", company.trim());
    if (postcode.trim()) sp.set("postcode", postcode.trim());
    return sp.toString();
  }, [q, name, company, postcode]);

  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(async () => {
      setError(null);
      setPending(true);
      try {
        const res = await fetch(`/api/directory?${params}`);
        const json = (await res.json()) as { affiliates?: Affiliate[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Unable to load directory");
        if (!cancelled) setItems(json.affiliates ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unable to load directory");
      } finally {
        if (!cancelled) setPending(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [params]);

  useEffect(() => {
    let cancelled = false;
    setDrawerError(null);
    if (!selectedId) {
      setDrawerAffiliate(null);
      setDrawerPending(false);
      return;
    }

    const fromList = items.find((x) => x.id === selectedId) ?? null;
    if (fromList) {
      setDrawerAffiliate(fromList);
      setDrawerPending(false);
      return;
    }

    (async () => {
      setDrawerPending(true);
      try {
        const res = await fetch(`/api/directory/${encodeURIComponent(selectedId)}`);
        const json = (await res.json().catch(() => null)) as
          | { affiliate?: Affiliate; error?: string }
          | null;
        if (!res.ok || !json?.affiliate) {
          throw new Error(json?.error ?? "Unable to load profile");
        }
        if (!cancelled) setDrawerAffiliate(json.affiliate);
      } catch (e) {
        if (!cancelled) setDrawerError(e instanceof Error ? e.message : "Unable to load profile");
      } finally {
        if (!cancelled) setDrawerPending(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  function openDrawer(id: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("profile", id);
    router.push(`/directory?${sp.toString()}`);
  }

  function closeDrawer() {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("profile");
    const qs = sp.toString();
    router.push(qs ? `/directory?${qs}` : "/directory");
  }

  const field =
    "mt-2 h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/20";

  /** Native `<select>`: match filter inputs. */
  const selectField = field;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Public directory
          </h1>
          <p className="mt-2 text-sm text-black/70">Search approved and verified inspectors.</p>
        </div>

        <button
          type="button"
          onClick={() => setMobileFiltersOpen((v) => !v)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black transition-colors hover:bg-black/5 lg:hidden"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside
          className={`rounded-3xl border border-black/10 bg-white p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.25)] lg:sticky lg:top-28 lg:self-start ${
            mobileFiltersOpen ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wider text-black/60 uppercase">
              Filters
            </p>
            <button
              type="button"
              onClick={() => {
                setQ("");
                setName("");
                setCompany("");
                setPostcode("");
              }}
              className="text-xs font-semibold text-black/60 underline-offset-4 hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Name or company…"
                  className={`${field} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                Postcode
              </label>
              <input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="e.g. SW1A 1AA"
                className={field}
              />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Filter by name…"
                className={field}
              />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider text-black/70 uppercase">
                Company
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Filter by company…"
                className={field}
              />
            </div>
          </div>
        </aside>

        <section className="min-w-0">
        {pending ? (
          <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.22)]">
            <p className="text-sm text-black/60">Loading…</p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.22)]">
            <p className="text-sm text-black/60">No inspectors found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((a) => (
              <article
                key={a.id}
                className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.18)]"
              >
                {(() => {
                  const svc = serviceChips(a.services);
                  const areasCount = a.areas_covered
                    ? a.areas_covered.split(/\n+/).map((s) => s.trim()).filter(Boolean).length
                    : 0;

                  return (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-black/5 text-xs font-semibold text-black/70">
                            {a.profile_photo_path ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`/api/public/profile-photo?id=${encodeURIComponent(a.id)}`}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              initialsFromName(a.full_name) || "—"
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <h2 className="truncate font-display text-lg font-extrabold text-black sm:text-xl">
                                {a.full_name}
                              </h2>
                              {badge(a.status)}
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

                        <button
                          type="button"
                          onClick={() => openDrawer(a.id)}
                          className="hidden h-10 shrink-0 items-center justify-center rounded-xl border border-accent bg-white px-5 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 sm:inline-flex"
                        >
                          View profile
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-6 border-t border-black/10 pt-4 sm:grid-cols-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white">
                            <Timer className="h-5 w-5 text-black" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold tracking-wider text-black/60 uppercase">
                              Experience
                            </p>
                            <p className="mt-1 text-sm font-semibold text-black">
                              {typeof a.years_experience === "number"
                                ? `${a.years_experience}+ years`
                                : "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white">
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

                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white">
                            <Zap className="h-5 w-5 text-black" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold tracking-wider text-black/60 uppercase">
                              Contact
                            </p>
                            <p className="mt-1 text-sm font-semibold text-black">
                              {a.contact_enabled ? "Available now" : "Contact locked"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {a.bio?.trim() ? (
                        <p className="text-sm leading-relaxed text-black line-clamp-2 min-h-[2.5rem]">
                          {truncateBioTwoSentences(a.bio)}
                        </p>
                      ) : (
                        <div className="min-h-[2.5rem]" aria-hidden="true" />
                      )}

                      {svc.chips.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {svc.chips.map((c) => (
                            <span
                              key={c}
                              className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
                            >
                              {c}
                            </span>
                          ))}
                          {svc.remaining > 0 ? (
                            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                              +{svc.remaining}
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => openDrawer(a.id)}
                        className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-accent bg-white px-4 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 sm:hidden"
                      >
                        View profile
                      </button>
                    </div>
                  );
                })()}

                {a.contact_enabled && a.email ? (
                  <div className="mt-4 flex justify-end border-t border-black/10 pt-4">
                    <a
                      href={`mailto:${encodeURIComponent(a.email)}`}
                      className="inline-flex h-10 w-fit items-center justify-center rounded-2xl bg-accent-gradient px-5 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
                    >
                      Contact
                    </a>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
      </div>

      {selectedId ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 z-40 bg-black/40"
            onClick={closeDrawer}
            onPointerDown={closeDrawer}
            onTouchEnd={(e) => {
              e.preventDefault();
              closeDrawer();
            }}
            aria-hidden="true"
          />
          <aside
            className="absolute right-0 top-0 z-50 h-full w-full bg-white shadow-2xl ring-1 ring-black/10 lg:w-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative z-10 flex h-16 items-center justify-between border-b border-black/10 px-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient shadow-accent-glow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-mark.svg" alt="" className="h-5 w-5" />
                </span>
                <div className="font-display text-sm font-bold leading-tight">
                  Fire Door <span className="text-accent">Inspection</span> Network
                </div>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                onPointerUp={closeDrawer}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeDrawer();
                }}
                className="relative z-20 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-black/10 bg-white text-black transition-colors hover:bg-black/5 active:bg-black/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[calc(100%-4rem)] overflow-y-auto px-5 py-6">
              {drawerPending ? (
                <p className="text-sm text-black/60">Loading…</p>
              ) : drawerError ? (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {drawerError}
                </div>
              ) : drawerAffiliate ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                      {drawerAffiliate.profile_photo_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/public/profile-photo?id=${encodeURIComponent(drawerAffiliate.id)}`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-black/70">
                          {initialsFromName(drawerAffiliate.full_name) || "—"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="min-w-0 truncate font-display text-xl font-extrabold">
                          {drawerAffiliate.full_name}
                        </h2>
                        {badge(drawerAffiliate.status)}
                      </div>
                      <p className="mt-1 text-sm text-black/70">{drawerAffiliate.company_name}</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm text-black/80">
                        <MapPin className="h-4 w-4 shrink-0 text-black/50" />
                        {drawerAffiliate.postcode}
                      </p>
                    </div>
                  </div>

                  {drawerAffiliate.contact_enabled && drawerAffiliate.email ? (
                    <a
                      href={`mailto:${encodeURIComponent(drawerAffiliate.email)}?subject=${encodeURIComponent(
                        "Request inspection",
                      )}`}
                      className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent-gradient px-5 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
                    >
                      Request inspection
                    </a>
                  ) : (
                    <div className="rounded-2xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-semibold text-black/70">
                      Contact locked (Advanced)
                    </div>
                  )}

                  {drawerAffiliate.bio?.trim() ? (
                    <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.12)]">
                      <h3 className="flex items-center gap-2 font-display text-sm font-bold">
                        <ScrollText className="h-4 w-4 text-accent" />
                        Bio
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-black/70">
                        {drawerAffiliate.bio.trim()}
                      </p>
                    </section>
                  ) : null}

                  {drawerAffiliate.services?.trim() ? (
                    <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.12)]">
                      <h3 className="flex items-center gap-2 font-display text-sm font-bold">
                        <Briefcase className="h-4 w-4 text-accent" />
                        Services
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-black/70">
                        {drawerAffiliate.services.trim()}
                      </p>
                    </section>
                  ) : null}

                  {drawerAffiliate.areas_covered ? (
                    <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.12)]">
                      <h3 className="flex items-center gap-2 font-display text-sm font-bold">
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
                            {typeof drawerAffiliate.years_experience === "number"
                              ? drawerAffiliate.years_experience
                              : "—"}
                            {typeof drawerAffiliate.years_experience === "number" ? (
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
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-black/75">
                            {drawerAffiliate.areas_covered}
                          </p>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.12)]">
                    <h3 className="flex items-center gap-2 font-display text-sm font-bold">
                      <ClipboardCheck className="h-4 w-4 text-accent" />
                      Trust
                    </h3>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-black/5 px-3 py-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white">
                            <FileBadge className="h-4 w-4 text-black/60" />
                          </span>
                          <span className="text-black/80">Insurance check</span>
                        </div>
                        {drawerAffiliate.verified_insurance ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/25 bg-emerald-600/10 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-black/5 px-3 py-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white">
                            <BadgeCheck className="h-4 w-4 text-black/60" />
                          </span>
                          <span className="text-black/80">Certification check</span>
                        </div>
                        {drawerAffiliate.verified_certification ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/25 bg-emerald-600/10 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : null}
                      </div>
                      {drawerAffiliate.dbs_path ? (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-black/5 px-3 py-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white">
                              <IdCard className="h-4 w-4 text-black/60" />
                            </span>
                            <span className="text-black/80">DBS Check</span>
                          </div>
                          {drawerAffiliate.identity_checked ? (
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
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}


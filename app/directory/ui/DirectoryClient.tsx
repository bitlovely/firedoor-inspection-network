"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, MapPin, Search, ShieldCheck, X } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

type Affiliate = {
  id: string;
  status: string;
  full_name: string;
  company_name: string;
  postcode: string;
  bio: string | null;
  profile_photo_path: string | null;
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
      Verified Affiliate
    </span>
  );
}

export function DirectoryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("profile") ?? "";
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [postcode, setPostcode] = useState("");
  const [radius, setRadius] = useState("10");
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
    if (radius.trim()) sp.set("radius", radius.trim());
    return sp.toString();
  }, [q, name, company, postcode, radius]);

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
          <p className="mt-2 text-sm text-black/70">Search approved and verified affiliates.</p>
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
                setRadius("10");
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
                Radius (miles)
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className={selectField}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
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
            <p className="text-sm text-black/60">No affiliates found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((a) => (
              <article
                key={a.id}
                className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.22)]"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6">
                  <div className="min-w-0">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-black/5 text-xs font-semibold text-black/70">
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
                          <h2 className="break-words font-display text-lg font-extrabold">
                            {a.full_name}
                          </h2>
                          {badge(a.status)}
                        </div>
                        <p className="mt-1 break-words text-sm text-black/70">{a.company_name}</p>
                        <p className="mt-2 inline-flex items-center gap-2 text-sm text-black/80">
                          <MapPin className="h-4 w-4 shrink-0 text-black/50" />
                          {a.postcode}
                        </p>
                        {a.bio?.trim() ? (
                          <p className="mt-4 text-sm leading-relaxed text-black/70 line-clamp-5">
                            {a.bio.trim()}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full sm:w-auto sm:shrink-0 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => openDrawer(a.id)}
                      className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-accent-gradient px-4 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95 sm:h-10 sm:w-fit sm:px-4"
                    >
                      View profile
                    </button>
                  </div>
                </div>

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
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50"
          onKeyDown={(e) => {
            if (e.key === "Escape") closeDrawer();
          }}
        >
          <button
            type="button"
            aria-label="Close profile"
            className="absolute inset-0 bg-black/40"
            onClick={closeDrawer}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl ring-1 ring-black/10">
            <div className="flex h-16 items-center justify-between border-b border-black/10 px-5">
              <div className="font-display text-base font-bold">Profile</div>
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
                        <Image
                          src={`/api/public/profile-photo?id=${encodeURIComponent(drawerAffiliate.id)}`}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
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
                      <h3 className="font-display text-sm font-bold">Bio</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-black/70">
                        {drawerAffiliate.bio.trim()}
                      </p>
                    </section>
                  ) : null}

                  {drawerAffiliate.services?.trim() ? (
                    <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.12)]">
                      <h3 className="font-display text-sm font-bold">Services</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-black/70">
                        {drawerAffiliate.services.trim()}
                      </p>
                    </section>
                  ) : null}

                  {drawerAffiliate.areas_covered ? (
                    <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.12)]">
                      <h3 className="font-display text-sm font-bold">Areas covered</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-black/70">
                        {drawerAffiliate.areas_covered}
                      </p>
                    </section>
                  ) : null}

                  <div className="text-center">
                    <a
                      href={`/directory/${encodeURIComponent(drawerAffiliate.id)}`}
                      className="text-sm font-semibold text-black underline-offset-4 hover:underline"
                    >
                      Open full profile page
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}


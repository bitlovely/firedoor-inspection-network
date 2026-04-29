"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";

export function ProfilePanel({
  initial,
  onSaved,
}: {
  initial: { company_name?: string; phone?: string };
  onSaved: () => void;
}) {
  const supabase = createBrowserClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setSuccess(null);
    setPhoto(null);
    setCompanyName(initial.company_name ?? "");
    setPhone(initial.phone ?? "");
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      setFullName((u?.user_metadata?.full_name as string | undefined) ?? "");
      setEmail(u?.email ?? "");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.company_name, initial.phone]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in again.");

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;

      const originalName =
        (userData.user?.user_metadata?.full_name as string | undefined) ?? "";
      const originalEmail = userData.user?.email ?? "";

      const nameChanged = fullName.trim() !== originalName.trim();
      const emailChanged = email.trim() !== originalEmail.trim();

      if (nameChanged || emailChanged) {
        const { error: updateErr } = await supabase.auth.updateUser({
          email: emailChanged ? email.trim() : undefined,
          data: nameChanged ? { full_name: fullName.trim() } : undefined,
        });
        if (updateErr) throw updateErr;
      }

      const fd = new FormData();
      if (companyName.trim()) fd.set("company_name", companyName.trim());
      if (phone.trim()) fd.set("phone", phone.trim());
      if (photo) fd.set("profile_photo", photo);

      const res = await fetch("/api/me/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = (await res.json().catch(() => null)) as
        | { profile?: { company_name?: string; phone?: string }; error?: string }
        | null;
      if (!res.ok) {
        throw new Error(json?.error ?? "Unable to save profile");
      }

      setSuccess(
        emailChanged
          ? "Saved. If email confirmation is enabled, check your inbox to confirm the new email."
          : "Saved.",
      );
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save profile");
    } finally {
      setSaving(false);
    }
  }

  const field =
    "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20";

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold tracking-tight">Profile</h2>
          <p className="mt-1 text-sm text-black/70">
            Update your account and public-facing details.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-black/80">Full name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={field}
              autoComplete="name"
            />
          </label>

          <label className="text-sm">
            <span className="text-black/80">Contact email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
              autoComplete="email"
              inputMode="email"
            />
          </label>

          <label className="text-sm">
            <span className="text-black/80">Company name</span>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={field}
            />
          </label>

          <label className="text-sm">
            <span className="text-black/80">Phone</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={field}
              autoComplete="tel"
              inputMode="tel"
            />
          </label>
        </div>

        <div className="mt-4">
          <label className="text-sm">
            <span className="text-black/80">Company logo / photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.item(0) ?? null)}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black file:mr-4 file:rounded-xl file:border-0 file:bg-black/5 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-black/10"
            />
          </label>
          <p className="mt-2 text-xs text-black/70">
            Tip: this is used as your dashboard logo and can appear on your directory
            profile.
          </p>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-600/25 bg-rose-600/10 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 rounded-2xl border border-emerald-600/25 bg-emerald-600/10 px-4 py-3 text-sm text-emerald-800">
            {success}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            disabled={saving}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent-gradient px-5 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}


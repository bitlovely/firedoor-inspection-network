"use client";

import { useState } from "react";

type Props = {
  affiliateId: string;
  inspectorName: string;
};

const field =
  "mt-1.5 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-black outline-none ring-accent/30 placeholder:text-black/40 focus:border-accent focus:ring-2";

export function RequestInspectionForm({ affiliateId, inspectorName }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/directory/${encodeURIComponent(affiliateId)}/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, postcode, message }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send your enquiry. Please try again.");
        return;
      }
      setSent(true);
      setName("");
      setEmail("");
      setPhone("");
      setPostcode("");
      setMessage("");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-600/25 bg-emerald-600/10 px-4 py-4 text-sm text-emerald-900">
        <p className="font-semibold">Enquiry sent</p>
        <p className="mt-1 text-emerald-900/90">
          Thanks — we&apos;ve received your request about {inspectorName}. Our team will be in
          touch.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-3 text-xs font-semibold text-emerald-800 underline-offset-4 hover:underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.12)]"
    >
      <h3 className="font-display text-sm font-bold">Request inspection</h3>
      <p className="mt-1 text-sm text-black/60">
        Send an enquiry about {inspectorName}. We&apos;ll pass this to our team.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor={`enquiry-name-${affiliateId}`} className="text-xs font-semibold text-black/70">
            Name
          </label>
          <input
            id={`enquiry-name-${affiliateId}`}
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={200}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor={`enquiry-email-${affiliateId}`} className="text-xs font-semibold text-black/70">
            Email
          </label>
          <input
            id={`enquiry-email-${affiliateId}`}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={320}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor={`enquiry-phone-${affiliateId}`} className="text-xs font-semibold text-black/70">
            Phone
          </label>
          <input
            id={`enquiry-phone-${affiliateId}`}
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            minLength={8}
            maxLength={40}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label
            htmlFor={`enquiry-postcode-${affiliateId}`}
            className="text-xs font-semibold text-black/70"
          >
            Postcode
          </label>
          <input
            id={`enquiry-postcode-${affiliateId}`}
            name="postcode"
            type="text"
            autoComplete="postal-code"
            required
            minLength={3}
            maxLength={16}
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label
            htmlFor={`enquiry-message-${affiliateId}`}
            className="text-xs font-semibold text-black/70"
          >
            Message
          </label>
          <textarea
            id={`enquiry-message-${affiliateId}`}
            name="message"
            required
            minLength={10}
            maxLength={4000}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about the property and what you need…"
            className={`${field} min-h-[6.5rem] resize-y py-2.5`}
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent-gradient px-5 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}

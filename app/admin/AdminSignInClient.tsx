"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { authPrimaryButtonClassName } from "@/components/auth/authPrimaryButtonClassName";

export function AdminSignInClient() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const email = emailValue.trim();
    const password = passwordValue;

    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json()) as { ok?: true; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Sign-in failed");
        return;
      }
      router.push("/admin/dashboard");
    } finally {
      setPending(false);
    }
  }

  const canSubmit = !pending && emailValue.trim().length > 3 && passwordValue.length > 0;

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-white/15 bg-white/8 p-8 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
          <Shield className="h-7 w-7 text-white" strokeWidth={2} />
        </div>
        <h1 className="mt-6 text-center font-display text-3xl font-extrabold tracking-tight text-white">
          Admin
        </h1>
        <p className="mt-2 text-center text-sm text-white">
          Sign in to review and verify affiliate applications.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          ) : null}

          <div>
            <label className="text-xs font-semibold tracking-wider text-white uppercase">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/70 outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20"
              required
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider text-white uppercase">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 pr-11 text-sm text-white placeholder:text-white/70 outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20"
                required
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 inline-flex w-9 items-center justify-center text-white/70 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={authPrimaryButtonClassName}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
          >
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
      <div className="mt-6 text-center text-xs text-white">
        <Link href="/" className="underline-offset-4 hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}


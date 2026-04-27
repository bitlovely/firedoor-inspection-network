"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";
import { authPrimaryButtonClassName } from "@/components/auth/authPrimaryButtonClassName";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Supabase sets the recovery session from the URL automatically.
      const { data } = await supabase.auth.getSession();
      if (!cancelled) setReady(Boolean(data.session));
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const canSubmit =
    !pending &&
    password.length >= 6 &&
    passwordConfirm.length >= 6 &&
    password === passwordConfirm;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        throw new Error("Reset link expired. Please request a new password reset email.");
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/signin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to reset password");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-black text-white">
      <div className="container relative z-10 mx-auto flex min-h-dvh items-center justify-center px-4 py-14 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/15 bg-white/8 p-8 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <KeyRound className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="mt-6 text-center font-display text-3xl font-extrabold tracking-tight text-white">
              Reset password
            </h1>
            <p className="mt-2 text-center text-sm text-white">
              Choose a new password for your account.
            </p>

            {!ready ? (
              <div className="mt-8 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/90">
                This reset link may have expired. Please go back to{" "}
                <Link href="/signin" className="font-semibold underline-offset-4 hover:underline">
                  Sign in
                </Link>{" "}
                and request a new password reset email.
              </div>
            ) : (
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
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 pr-11 text-sm text-white placeholder:text-white outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-2 inline-flex w-9 items-center justify-center text-white/70 hover:text-white"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wider text-white uppercase">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 pr-11 text-sm text-white placeholder:text-white outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20"
                      required
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm((v) => !v)}
                      className="absolute inset-y-0 right-2 inline-flex w-9 items-center justify-center text-white/70 hover:text-white"
                      aria-label={showPasswordConfirm ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showPasswordConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
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
                      Updating…
                    </span>
                  ) : (
                    "Update password"
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-white">
            <Link href="/signin" className="underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}


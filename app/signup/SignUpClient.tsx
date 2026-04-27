"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";
import { authPrimaryButtonClassName } from "@/components/auth/authPrimaryButtonClassName";

const inputClassName =
  "mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/50 outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20";

const labelClassName = "text-xs font-semibold tracking-wider text-white uppercase";

export function SignUpClient() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setConfirmationSentTo(null);
    setPending(true);

    const full_name = fullName.trim();
    const normalizedEmail = email.trim();

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      setPending(false);
      return;
    }

    try {
      const supabase = createBrowserClient();
      const emailRedirectTo = `${window.location.origin}/dashboard`;
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { full_name },
          emailRedirectTo,
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      // If email confirmations are enabled, Supabase returns no session and sends a confirmation email.
      if (!data.session) {
        setConfirmationSentTo(normalizedEmail);
        return;
      }
      // If confirmations are disabled, we get a session immediately—continue to dashboard.
      router.push("/dashboard");
    } catch {
      setError(
        "Unable to reach the sign-up service. Please check your internet connection and Supabase settings.",
      );
    } finally {
      setPending(false);
    }
  }

  const canSubmit =
    !pending &&
    fullName.trim().length > 1 &&
    email.trim().length > 3 &&
    password.length >= 6 &&
    passwordConfirm.length >= 6 &&
    password === passwordConfirm;

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-white/15 bg-white/8 p-8 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
          <UserPlus className="h-7 w-7 text-white" strokeWidth={2} />
        </div>
        <h1 className="mt-6 text-center font-display text-3xl font-extrabold tracking-tight text-white">
          Become an Affiliate
        </h1>
        <p className="mt-2 text-center text-sm text-white">
          Create your account first. You’ll complete registration next.
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
          {confirmationSentTo ? (
            <div className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/90">
              Confirmation email sent to{" "}
              <span className="font-semibold text-white">{confirmationSentTo}</span>. Please
              confirm your email, then sign in.
            </div>
          ) : null}

          <div>
            <label htmlFor="full_name" className={labelClassName}>
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              required
              className={inputClassName}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClassName}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClassName}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClassName}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className={`${inputClassName} pr-11`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div>
            <label htmlFor="password_confirm" className={labelClassName}>
              Confirm password
            </label>
            <div className="relative">
              <input
                id="password_confirm"
                name="password_confirm"
                type={showPasswordConfirm ? "text" : "password"}
                autoComplete="new-password"
                required
                className={`${inputClassName} pr-11`}
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
                Creating account…
              </span>
            ) : (
              "Create account"
            )}
          </button>

          <p className="text-center text-xs text-white/70">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-white underline-offset-4 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-white underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </div>

      <div className="mt-6 text-center text-xs text-white">
        <p>
          Already have an account?{" "}
          <Link href="/signin" className="underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-2">
          <Link href="/" className="underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}


import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign in — FireDoor Network",
  description: "Sign in to your FireDoor Network account.",
};

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 opacity-35 [background:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(255,106,26,0.14),transparent_55%)]" />
      <div className="container relative mx-auto flex min-h-screen items-center justify-center px-4 py-14 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/15 bg-white/8 p-8 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Lock className="h-7 w-7 text-white/85" strokeWidth={2} />
            </div>
            <h1 className="mt-6 text-center font-display text-3xl font-extrabold tracking-tight">
              Customer login
            </h1>
            <p className="mt-2 text-center text-sm text-white/65">
              Sign in to access your profile and manage your account.
            </p>

            <form className="mt-8 space-y-5">
              <div>
                <label className="text-xs font-semibold tracking-wider text-white/70 uppercase">
                  Email ID
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-white/70 uppercase">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-1 text-xs">
                <label className="inline-flex items-center gap-2 text-white/65">
                  <input
                    type="checkbox"
                    name="remember"
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-white accent-white"
                  />
                  Remember me
                </label>
                <Link href="#" className="text-white/65 underline-offset-4 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="button"
                className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent-gradient text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
              >
                Login
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-white/55">
            <Link href="/" className="underline-offset-4 hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}


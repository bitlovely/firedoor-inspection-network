import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign up — FireDoor Network",
  description: "Create your FireDoor Network account.",
};

const inputClassName =
  "mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20";

const labelClassName = "text-xs font-semibold tracking-wider text-white uppercase";

export default function SignUpPage() {
  return (
    <main className="min-h-dvh w-full bg-[#000000] text-white">
      <div className="container relative mx-auto flex min-h-dvh items-center justify-center px-4 py-14 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/15 bg-white/8 p-8 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <UserPlus className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="mt-6 text-center font-display text-3xl font-extrabold tracking-tight text-white">
              Create account
            </h1>
            <p className="mt-2 text-center text-sm text-white">
              Sign up to join the network and manage your profile.
            </p>

            <form className="mt-8 space-y-5">
              <div>
                <label htmlFor="full_name" className={labelClassName}>
                  Full name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Smith"
                  className={inputClassName}
                />
              </div>

              <div>
                <label htmlFor="company_name" className={labelClassName}>
                  Company name
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  autoComplete="organization"
                  placeholder="Your company Ltd"
                  className={inputClassName}
                />
              </div>

              <div>
                <label htmlFor="email_or_phone" className={labelClassName}>
                  Email / phone
                </label>
                <input
                  id="email_or_phone"
                  name="email_or_phone"
                  type="text"
                  autoComplete="username"
                  placeholder="you@example.com or +44…"
                  className={inputClassName}
                />
              </div>

              <div>
                <label htmlFor="password" className={labelClassName}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputClassName}
                />
              </div>

              <div>
                <label htmlFor="postcode" className={labelClassName}>
                  Location (postcode)
                </label>
                <input
                  id="postcode"
                  name="postcode"
                  type="text"
                  autoComplete="postal-code"
                  placeholder="e.g. SW1A 1AA"
                  className={inputClassName}
                />
              </div>

              <button
                type="button"
                className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent-gradient text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
              >
                Sign up
              </button>
            </form>
          </div>

          <div className="mt-6 space-y-3 text-center text-xs text-white">
            <p>
              Already have an account?{" "}
              <Link href="/signin" className="underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
            <Link href="/" className="block underline-offset-4 hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/landing/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DirectoryClient } from "./ui/DirectoryClient";

export const metadata: Metadata = {
  title: "Directory — Fire Door Inspection Network",
  description: "Find verified fire door surveyors and inspectors near you.",
};

export default function DirectoryPage() {
  return (
    <main className="min-h-dvh w-full bg-[#f3f4f6] text-black">
      <Header />
      <div className="container mx-auto px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:pb-14">
        <Suspense
          fallback={
            <div className="mx-auto max-w-6xl rounded-3xl border border-black/10 bg-white p-7 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.22)]">
              <p className="text-sm text-black/60">Loading…</p>
            </div>
          }
        >
          <DirectoryClient />
        </Suspense>
      </div>
      <SiteFooter />
    </main>
  );
}


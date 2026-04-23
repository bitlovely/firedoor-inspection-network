import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DirectoryClient } from "./ui/DirectoryClient";

export const metadata: Metadata = {
  title: "Directory — FireDoor Network",
  description: "Find verified fire door surveyors and inspectors near you.",
};

export default function DirectoryPage() {
  return (
    <main className="min-h-dvh w-full bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:pb-14">
        <DirectoryClient />
      </div>
      <SiteFooter />
    </main>
  );
}


import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { adminCookieName, verifyAdminSession } from "@/lib/admin/session";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin dashboard — FireDoor Inspection Network",
  description: "Review affiliate applications.",
};

export default async function AdminDashboardPage() {
  const jar = await cookies();
  const token = jar.get(adminCookieName())?.value ?? "";
  const session = token ? verifyAdminSession(token) : null;
  if (!session || session.role !== "admin") {
    redirect("/admin");
  }

  return (
    <Suspense
      fallback={
        <main className="min-h-dvh w-full bg-black text-white">
          <div className="container mx-auto px-4 py-10 sm:px-6 lg:py-14">
            <div className="rounded-3xl border border-white/15 bg-white/8 p-7 backdrop-blur-md">
              <p className="text-sm text-white/80">Loading…</p>
            </div>
          </div>
        </main>
      }
    >
      <AdminDashboardClient />
    </Suspense>
  );
}


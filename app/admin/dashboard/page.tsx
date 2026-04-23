import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSession } from "@/lib/admin/session";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin dashboard — FireDoor Network",
  description: "Review affiliate applications.",
};

export default async function AdminDashboardPage() {
  const jar = await cookies();
  const token = jar.get(adminCookieName())?.value ?? "";
  const session = token ? verifyAdminSession(token) : null;
  if (!session || session.role !== "admin") {
    redirect("/admin");
  }

  return <AdminDashboardClient />;
}


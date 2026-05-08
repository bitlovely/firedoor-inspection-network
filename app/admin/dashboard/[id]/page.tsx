import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSession } from "@/lib/admin/session";
import { AdminApplicationDetailClient } from "./ui/AdminApplicationDetailClient";

export const metadata: Metadata = {
  title: "Application — Admin — Fire Door Inspection Network",
  description: "Review an affiliate application.",
};

export default async function AdminApplicationDetailPage() {
  const jar = await cookies();
  const token = jar.get(adminCookieName())?.value ?? "";
  const session = token ? verifyAdminSession(token) : null;
  if (!session || session.role !== "admin") {
    redirect("/admin");
  }

  return <AdminApplicationDetailClient />;
}


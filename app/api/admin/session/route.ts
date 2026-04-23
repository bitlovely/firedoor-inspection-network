import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, signAdminSession } from "@/lib/admin/session";

export const runtime = "nodejs";

function adminCreds() {
  return {
    email: process.env.ADMIN_EMAIL || "bitlovely555@gmail.com",
    password: process.env.ADMIN_PASSWORD || "111111",
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";

  const creds = adminCreds();
  if (email !== creds.email || password !== creds.password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signAdminSession({ v: 1, role: "admin", email, iat: Date.now() });
  const jar = await cookies();
  jar.set(adminCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE() {
  const jar = await cookies();
  jar.set(adminCookieName(), "", { path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true }, { status: 200 });
}


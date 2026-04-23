import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "fdn_admin";

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "fdn_dev_admin_secret_change_me";
}

export function adminCookieName() {
  return COOKIE_NAME;
}

export function signAdminSession(payload: object) {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, "utf8").toString("base64url");
  const sig = createHmac("sha256", secret()).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

export function verifyAdminSession(token: string): null | Record<string, unknown> {
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const expected = createHmac("sha256", secret()).update(b64).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const json = Buffer.from(b64, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return parsed;
  } catch {
    return null;
  }
}


import { cookies } from "next/headers";
import crypto from "crypto";

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  bio?: string | null;
}

export interface SessionData {
  token: string;
  user: GitHubUser;
  authType: "oauth" | "token" | "demo";
  createdAt: number;
}

const COOKIE_NAME = "gh_sm_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "github-social-manager-super-secure-aes256-default-key-change-me";

// Derive a 32-byte key from SESSION_SECRET using SHA-256
function getEncryptionKey(): Buffer {
  return crypto.createHash("sha256").update(SESSION_SECRET).digest();
}

/**
 * Encrypt session data using AES-256-GCM
 */
export function sealSession(data: SessionData): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);

  const payload = JSON.stringify(data);
  let encrypted = cipher.update(payload, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}.${authTag.toString("base64")}.${encrypted}`;
}

/**
 * Decrypt session data
 */
export function unsealSession(sealed: string): SessionData | null {
  try {
    const parts = sealed.split(".");
    if (parts.length !== 3) return null;

    const [ivB64, authTagB64, encrypted] = parts;
    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(authTagB64, "base64");

    const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted) as SessionData;
  } catch {
    return null;
  }
}

/**
 * Retrieve current user session from HTTP-only cookie
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  return unsealSession(sessionCookie.value);
}

/**
 * Set encrypted session cookie
 */
export async function setSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const sealed = sealSession(data);
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(COOKIE_NAME, sealed, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Delete session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

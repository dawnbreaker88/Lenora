import { decode, getToken, type JWT } from "next-auth/jwt";
import { env } from "../config/env.js";
import { getOrCreateUser } from "../services/user.service.js";

function extractSessionCookie(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)(?:__Secure-)?next-auth\.session-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function authenticatedUser(request: { headers: Record<string, string | string[] | undefined> }): Promise<string> {
  if (!env.NEXTAUTH_SECRET) throw new Error("NEXTAUTH_SECRET is required");

  let token: JWT | null = null;

  // 1. Extract and decode cookie directly using NextAuth JWT decode
  const cookieHeader = Array.isArray(request.headers.cookie)
    ? request.headers.cookie[0]
    : request.headers.cookie;

  const rawCookieToken = extractSessionCookie(cookieHeader);

  if (rawCookieToken) {
    try {
      token = await decode({
        token: rawCookieToken,
        secret: env.NEXTAUTH_SECRET,
      });
    } catch {
      // Direct decode failed, proceed to fallback
    }
  }

  // 2. Fallback to standard getToken
  if (!token) {
    try {
      token = await getToken({
        req: request as never,
        secret: env.NEXTAUTH_SECRET,
        secureCookie: false,
      });
    } catch {
      // Fallback failed
    }
  }

  if (!token?.sub || !token.email) {
    throw new Error("Unauthenticated");
  }

  const user = await getOrCreateUser(
    token.sub,
    token.email,
    token.name ?? token.email,
    typeof token.picture === "string" ? token.picture : undefined
  );

  return user.id;
}

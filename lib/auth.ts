import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import prisma from "./prisma";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function generateVerificationToken() {
  return randomBytes(32).toString("hex");
}

export function verificationExpiry() {
  return new Date(Date.now() + VERIFICATION_TTL_MS);
}

export type VerifyResult = "success" | "expired" | "invalid";

export async function verifyEmailToken(token?: string): Promise<VerifyResult> {
  if (!token) return "invalid";

  const user = await prisma.user.findFirst({ where: { verificationToken: token } });
  if (!user) return "invalid"; // unknown or already-consumed token

  if (user.verificationExpires && user.verificationExpires < new Date()) return "expired";

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null, verificationExpires: null },
  });
  return "success";
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get("session_token")?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function setSessionCookie(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.session.create({ data: { userId, token, expiresAt } });

  const store = await cookies();
  store.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  const token = store.get("session_token")?.value;
  if (token) await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  store.delete("session_token");
}

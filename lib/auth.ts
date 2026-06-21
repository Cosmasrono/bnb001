import { cookies } from "next/headers";
import prisma from "./prisma";

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

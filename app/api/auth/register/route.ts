import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name, email, password, isHost } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hashed, isHost: !!isHost } });
  await setSessionCookie(user.id);

  return NextResponse.json({ id: user.id, name: user.name });
}

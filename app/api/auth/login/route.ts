import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  // Accounts created through the email-verification flow must verify before logging in.
  // (A pending verificationToken means they went through that flow but haven't confirmed.)
  if (!user.emailVerified && user.verificationToken) {
    return NextResponse.json(
      { error: "Please verify your email before logging in. Check your inbox for the verification link.", needsVerification: true },
      { status: 403 }
    );
  }

  await setSessionCookie(user.id);
  return NextResponse.json({ id: user.id, name: user.name });
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateVerificationToken, verificationExpiry } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { name, email, password, phone, isHost } = await req.json();
  if (!name || !email || !password || !phone) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (String(phone).replace(/\D/g, "").length < 7) {
    return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const verificationToken = generateVerificationToken();

  await prisma.user.create({
    data: {
      name,
      email,
      phone: String(phone).trim(),
      password: hashed,
      isHost: !!isHost,
      emailVerified: false,
      verificationToken,
      verificationExpires: verificationExpiry(),
    },
  });

  // Send the verification link. We don't create a session — the user must verify first.
  const verifyUrl = `${req.nextUrl.origin}/auth/verify?token=${verificationToken}`;
  try {
    await sendVerificationEmail(email, name, verifyUrl);
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }

  return NextResponse.json({ ok: true, email });
}

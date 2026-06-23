import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateVerificationToken, verificationExpiry } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });

  // Only send for a real, still-unverified account — but always return ok so the
  // endpoint can't be used to probe which emails are registered.
  if (user && !user.emailVerified) {
    const verificationToken = generateVerificationToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, verificationExpires: verificationExpiry() },
    });
    const verifyUrl = `${req.nextUrl.origin}/auth/verify?token=${verificationToken}`;
    try {
      await sendVerificationEmail(email, user.name, verifyUrl);
    } catch (err) {
      console.error("Failed to resend verification email:", err);
    }
  }

  return NextResponse.json({ ok: true });
}

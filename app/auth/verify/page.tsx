import Link from "next/link";
import { verifyEmailToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ token?: string }> };

const COPY = {
  success: {
    icon: "✓",
    color: "#22C55E",
    title: "Email verified!",
    body: "Your account is now active. You can log in and start booking.",
    cta: "Continue to log in",
  },
  expired: {
    icon: "⏰",
    color: "#F59E0B",
    title: "Link expired",
    body: "This verification link has expired. Try logging in and request a new link, or sign up again.",
    cta: "Go to log in",
  },
  invalid: {
    icon: "✕",
    color: "#EF4444",
    title: "Invalid link",
    body: "This verification link is invalid or has already been used. If you've already verified, just log in.",
    cta: "Go to log in",
  },
} as const;

export default async function VerifyPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const result = await verifyEmailToken(token);
  const copy = COPY[result];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-6"
          style={{ backgroundColor: `${copy.color}1A`, color: copy.color }}
        >
          {copy.icon}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{copy.title}</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">{copy.body}</p>
        <Link
          href={result === "success" ? "/auth/login?verified=1" : "/auth/login"}
          className="inline-flex w-full justify-center bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold py-3.5 rounded-xl transition-all"
        >
          {copy.cta}
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resent, setResent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("verified") === "1") {
      setVerified(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setNeedsVerification(false); setVerified(false);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Login failed");
      setNeedsVerification(!!data.needsVerification);
      setLoading(false);
      return;
    }
    router.push("/listings");
    router.refresh();
  }

  async function handleResend() {
    setResent(false);
    await fetch("/api/auth/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResent(true);
  }

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20 outline-none transition-all";

  return (
    <div className="min-h-screen flex">
      {/* Left image panel */}
      <div className="hidden lg:block flex-1 relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=85')` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF385C]/80 to-black/40" />
        <div className="absolute bottom-16 left-12 text-white">
          <svg viewBox="0 0 32 32" width="40" height="40" fill="white"><path d="M16 1C8.268 1 2 7.268 2 15c0 4.792 2.4 9.04 6.08 11.648L16 31l7.92-4.352C27.6 24.04 30 19.792 30 15 30 7.268 23.732 1 16 1zm0 20a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/></svg>
          <h2 className="text-4xl font-bold mt-4 mb-2">Welcome back</h2>
          <p className="text-white/80 max-w-xs">Thousands of unique stays waiting for you.</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 text-[#FF385C] mb-8">
              <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor"><path d="M16 1C8.268 1 2 7.268 2 15c0 4.792 2.4 9.04 6.08 11.648L16 31l7.92-4.352C27.6 24.04 30 19.792 30 15 30 7.268 23.732 1 16 1zm0 20a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/></svg>
              <span className="font-bold text-xl">Isavo Estates</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Log in to your account</h1>
            <p className="text-gray-500 mt-1.5">Enter your email and password below</p>
          </div>

          {verified && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 mb-4">
              Email verified! You can now log in.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className={inp} />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
                {needsVerification && (
                  <div className="mt-2">
                    <button type="button" onClick={handleResend} className="font-semibold text-[#FF385C] hover:underline">
                      Resend verification email
                    </button>
                    {resent && <span className="ml-2 text-green-600">Sent!</span>}
                  </div>
                )}
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#FF385C] hover:bg-[#E31C5F] disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-all duration-200 mt-2 flex items-center justify-center gap-2">
              {loading ? (
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
              ) : "Log in"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-[#FF385C] font-semibold hover:underline">Sign up</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

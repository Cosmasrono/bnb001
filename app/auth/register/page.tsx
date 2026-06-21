"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, isHost }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
    router.push("/listings");
    router.refresh();
  }

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20 outline-none transition-all";

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block flex-1 relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=85')` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF385C]/70 to-black/30" />
        <div className="absolute bottom-16 left-12 text-white">
          <h2 className="text-4xl font-bold mb-2">Start your journey</h2>
          <p className="text-white/80 max-w-xs">Discover and book beautiful rooms at Isavo Estates.</p>
        </div>
      </div>

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
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-1.5">It only takes a minute</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" minLength={8} required className={inp} />
            </div>

            {/* Host toggle */}
            <button type="button" onClick={() => setIsHost((v) => !v)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${isHost ? "border-[#FF385C] bg-rose-50" : "border-gray-200 hover:border-gray-300"}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isHost ? "border-[#FF385C] bg-[#FF385C]" : "border-gray-300"}`}>
                {isHost && <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">I want to be a host</p>
                <p className="text-xs text-gray-500">List your property and start earning</p>
              </div>
            </button>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#FF385C] hover:bg-[#E31C5F] disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
              {loading ? (
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
              ) : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#FF385C] font-semibold hover:underline">Log in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

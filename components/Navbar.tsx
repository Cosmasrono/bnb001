"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isHostUser } from "@/lib/host";

type User = { id: string; name: string; email: string; isHost: boolean } | null;

export function Navbar({ user }: { user: User }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isHome && !scrolled ? "bg-white/90 backdrop-blur-sm" : "bg-white"
      } border-b border-gray-100`}
      style={{ boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <svg viewBox="0 0 32 32" width="32" height="32" fill="#FF385C">
            <path d="M16 1C8.268 1 2 7.268 2 15c0 4.792 2.4 9.04 6.08 11.648L16 31l7.92-4.352C27.6 24.04 30 19.792 30 15 30 7.268 23.732 1 16 1zm0 20a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/>
          </svg>
          <span className="font-bold text-xl text-[#FF385C] hidden sm:block">Isavo Guest</span>
        </Link>

        {/* Search pill (desktop) */}
        <Link
          href="/listings"
          className="hidden md:flex items-center gap-3 border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <span className="text-sm font-medium text-gray-700 group-hover:text-[#FF385C] transition-colors">Anywhere</span>
          <span className="w-px h-4 bg-gray-200" />
          <span className="text-sm font-medium text-gray-700 group-hover:text-[#FF385C] transition-colors">Any week</span>
          <span className="w-px h-4 bg-gray-200" />
          <span className="text-sm text-gray-400">Add guests</span>
          <div className="ml-1 bg-[#FF385C] rounded-full p-1.5">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="white">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </div>
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {user && isHostUser(user) && (
            <Link href="/host" className="hidden sm:block text-sm font-medium text-gray-700 hover:text-[#FF385C] transition-colors px-3 py-2 rounded-full hover:bg-gray-50">
              Switch to hosting
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 border border-gray-200 rounded-full px-3 py-2 hover:shadow-md transition-shadow"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              <div className="w-7 h-7 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-bold">
                {user ? user.name[0].toUpperCase() : "?"}
              </div>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 w-56 overflow-hidden py-2"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Link href="/bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          My bookings
                        </Link>
                        {isHostUser(user) && (
                          <Link href="/host" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            Host dashboard
                          </Link>
                        )}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Log out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                          Log in
                        </Link>
                        <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          Sign up
                        </Link>
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function SearchBar({ className = "" }: { className?: string }) {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [active, setActive] = useState<"location" | "dates" | "guests" | null>(null);
  const router = useRouter();

  function handleSearch() {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests > 1) params.set("guests", String(guests));
    router.push(`/listings?${params.toString()}`);
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={`relative ${className}`}>
      <motion.div
        layout
        className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden"
        style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}
      >
        {/* Location */}
        <button
          onClick={() => setActive(active === "location" ? null : "location")}
          className={`flex-1 text-left px-6 py-4 transition-colors rounded-full ${active === "location" ? "bg-white shadow-inner" : "hover:bg-gray-50"}`}
        >
          <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Where</p>
          <p className={`text-sm mt-0.5 ${location ? "text-gray-900 font-medium" : "text-gray-400"}`}>
            {location || "Search destinations"}
          </p>
        </button>

        <div className="w-px h-8 bg-gray-200 flex-shrink-0" />

        {/* Check-in */}
        <button
          onClick={() => setActive(active === "dates" ? null : "dates")}
          className={`text-left px-4 sm:px-6 py-3 sm:py-4 transition-colors rounded-full hidden sm:block ${active === "dates" ? "bg-white shadow-inner" : "hover:bg-gray-50"}`}
        >
          <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Check in</p>
          <p className={`text-xs sm:text-sm mt-0.5 ${checkIn ? "text-gray-900 font-medium" : "text-gray-400"}`}>
            {checkIn ? new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Add dates"}
          </p>
        </button>

        <div className="w-px h-8 bg-gray-200 flex-shrink-0 hidden sm:block" />

        {/* Check-out */}
        <button
          onClick={() => setActive(active === "dates" ? null : "dates")}
          className={`text-left px-4 sm:px-6 py-3 sm:py-4 transition-colors rounded-full hidden sm:block ${active === "dates" ? "bg-white shadow-inner" : "hover:bg-gray-50"}`}
        >
          <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Check out</p>
          <p className={`text-xs sm:text-sm mt-0.5 ${checkOut ? "text-gray-900 font-medium" : "text-gray-400"}`}>
            {checkOut ? new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Add dates"}
          </p>
        </button>

        <div className="w-px h-8 bg-gray-200 flex-shrink-0" />
        <button
          onClick={() => setActive(active === "guests" ? null : "guests")}
          className={`text-left px-6 py-4 transition-colors rounded-full ${active === "guests" ? "bg-white shadow-inner" : "hover:bg-gray-50"}`}
        >
          <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Who</p>
          <p className={`text-sm mt-0.5 ${guests > 1 ? "text-gray-900 font-medium" : "text-gray-400"}`}>
            {guests > 1 ? `${guests} guests` : "Add guests"}
          </p>
        </button>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="m-2 bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-full px-6 py-3.5 flex items-center gap-2 font-semibold transition-colors flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="white">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <span className="hidden sm:block">Search</span>
        </button>
      </motion.div>

      {/* Dropdowns */}
      <AnimatePresence>
        {active === "location" && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 w-80 z-50"
          >
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Suggested destinations</p>
            {["Nairobi, Kenya", "Mombasa, Kenya", "Diani Beach, Kenya", "Malindi, Kenya", "Kisumu, Kenya"].map((loc) => (
              <button key={loc} onClick={() => { setLocation(loc); setActive(null); }}
                className="flex items-center gap-3 w-full py-2.5 px-2 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#717171" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <span className="text-sm font-medium text-gray-700">{loc}</span>
              </button>
            ))}
            <div className="mt-3 flex gap-2">
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="Or type a location…"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20 transition-all outline-none"
              />
              <button onClick={() => setActive(null)} className="bg-gray-900 text-white text-sm px-3 rounded-xl font-medium">OK</button>
            </div>
          </motion.div>
        )}

        {active === "dates" && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-96 z-50"
          >
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Check-in date</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={today}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Check-out date</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || today}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                />
              </div>
              <button
                onClick={() => setActive(null)}
                className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-lg py-2 font-semibold transition-colors mt-4"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}

        {active === "guests" && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 w-72 z-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Guests</p>
                <p className="text-xs text-gray-500">Including children</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setGuests((v) => Math.max(1, v - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors disabled:opacity-30"
                  disabled={guests <= 1}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span className="text-gray-900 font-semibold w-4 text-center">{guests}</span>
                <button onClick={() => setGuests((v) => Math.min(16, v + 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </div>
            <button onClick={() => setActive(null)}
              className="mt-4 w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors">
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {active && <div className="fixed inset-0 z-40" onClick={() => setActive(null)} />}
    </div>
  );
}

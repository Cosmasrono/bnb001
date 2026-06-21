"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function PriceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  
  const minPrice = parseInt(searchParams.get("minPrice") || "0");
  const maxPrice = parseInt(searchParams.get("maxPrice") || "500000");
  const [tempMin, setTempMin] = useState(minPrice);
  const [tempMax, setTempMax] = useState(maxPrice);

  function applyFilter() {
    const params = new URLSearchParams(searchParams);
    if (tempMin > 0) params.set("minPrice", tempMin.toString());
    else params.delete("minPrice");
    if (tempMax < 500000) params.set("maxPrice", tempMax.toString());
    else params.delete("maxPrice");
    router.push(`/listings?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`px-4 py-2 rounded-lg border transition-all ${
          minPrice > 0 || maxPrice < 500000
            ? "bg-[#FF385C] text-white border-[#FF385C]"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <span className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Price
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72 z-40"
          >
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Price range (KSh)</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-600 font-medium">Minimum</label>
                <input
                  type="number"
                  value={tempMin}
                  onChange={(e) => setTempMin(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Maximum</label>
                <input
                  type="number"
                  value={tempMax}
                  onChange={(e) => setTempMax(Math.min(1000000, parseInt(e.target.value) || 1000000))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilter}
                  className="flex-1 px-3 py-2 bg-[#FF385C] rounded-lg text-sm font-medium text-white hover:bg-[#E31C5F] transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {open && <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />}
    </div>
  );
}

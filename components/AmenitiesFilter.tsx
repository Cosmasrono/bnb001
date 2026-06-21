"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const AMENITIES = [
  { id: "wifi", label: "WiFi", icon: "📶" },
  { id: "pool", label: "Pool", icon: "🏊" },
  { id: "parking", label: "Parking", icon: "🅿️" },
  { id: "kitchen", label: "Kitchen", icon: "🍳" },
  { id: "gym", label: "Gym", icon: "💪" },
  { id: "air conditioning", label: "Air Conditioning", icon: "❄️" },
  { id: "tv", label: "TV", icon: "📺" },
  { id: "washer", label: "Washer", icon: "🫧" },
  { id: "workspace", label: "Workspace", icon: "💻" },
  { id: "hot tub", label: "Hot Tub", icon: "♨️" },
];

export function AmenitiesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  
  const selectedAmenities = searchParams.get("amenities")?.split(",").filter(Boolean) || [];

  function toggleAmenity(amenity: string) {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];

    const params = new URLSearchParams(searchParams);
    if (updated.length > 0) {
      params.set("amenities", updated.join(","));
    } else {
      params.delete("amenities");
    }
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`px-4 py-2 rounded-lg border transition-all ${
          selectedAmenities.length > 0
            ? "bg-[#FF385C] text-white border-[#FF385C]"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <span className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 3H5a2 2 0 00-2 2v4m0 0H3m2 0v14a2 2 0 002 2h12a2 2 0 002-2V9m0 0h2m-2 0V5a2 2 0 00-2-2h-4" />
          </svg>
          Amenities {selectedAmenities.length > 0 && `(${selectedAmenities.length})`}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80 z-40"
          >
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Filter by amenities</p>
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {AMENITIES.map((amenity) => (
                <label
                  key={amenity.id}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity.id)}
                    onChange={() => toggleAmenity(amenity.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{amenity.icon} {amenity.label}</span>
                </label>
              ))}
            </div>
            {selectedAmenities.length > 0 && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete("amenities");
                  router.push(`/listings?${params.toString()}`);
                  setOpen(false);
                }}
                className="mt-3 w-full text-xs font-medium text-gray-600 hover:text-gray-900 py-2 border-t border-gray-100"
              >
                Clear filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {open && <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />}
    </div>
  );
}

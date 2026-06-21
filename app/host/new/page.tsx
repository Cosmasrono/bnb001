"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Basics", "Details", "Description", "Preview"];
const CATEGORIES = ["apartment", "house", "villa", "cabin", "cottage", "studio", "loft", "beach", "mountain"];
const AMENITY_OPTIONS = ["WiFi", "Pool", "Parking", "Kitchen", "Gym", "Air Conditioning", "TV", "Washer", "Dryer", "Workspace", "Hot Tub", "BBQ"];

export default function NewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", city: "", country: "Kenya", location: "", category: "apartment",
    price: "", bedrooms: "1", bathrooms: "1", maxGuests: "2",
    description: "", amenities: [] as string[], images: [] as string[],
  });

  const set = (k: keyof typeof form, v: string | string[]) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAmenity = (a: string) =>
    set("amenities", form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]);

  async function handleSubmit() {
    setLoading(true); setError("");
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        maxGuests: parseInt(form.maxGuests),
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to create listing"); setLoading(false); return; }
    router.push(`/listings/${data.id}`);
  }

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20 outline-none transition-all";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-[#FF385C] font-bold text-lg">StayEasy</Link>
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <button onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${i === step ? "text-[#FF385C]" : i < step ? "text-gray-900 cursor-pointer" : "text-gray-300"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${i === step ? "bg-[#FF385C] text-white" : i < step ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-400"}`}>
                    {i < step ? "✓" : i + 1}
                  </span>
                  <span className="hidden sm:block">{s}</span>
                </button>
                {i < STEPS.length - 1 && <div className={`w-8 h-px ${i < step ? "bg-gray-900" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
          <Link href="/host" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Exit</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tell us about your place</h1>
                <p className="text-gray-500 mt-2">Start with the basics</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Property name</label>
                <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Cozy Nairobi Studio" className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">City</label>
                  <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Nairobi" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Country</label>
                  <input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Kenya" className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Neighbourhood / Area</label>
                <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Westlands, Karen" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => set("category", c)}
                      className={`py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-all ${form.category === c ? "border-[#FF385C] bg-rose-50 text-[#FF385C]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Share some details</h1>
                <p className="text-gray-500 mt-2">Help guests know what to expect</p>
              </div>
              {[
                { label: "Bedrooms", key: "bedrooms" as const, min: 1, max: 20 },
                { label: "Bathrooms", key: "bathrooms" as const, min: 1, max: 10 },
                { label: "Max guests", key: "maxGuests" as const, min: 1, max: 30 },
              ].map((f) => (
                <div key={f.key} className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900">{f.label}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => set(f.key, String(Math.max(f.min, parseInt(form[f.key]) - 1)))}
                      disabled={parseInt(form[f.key]) <= f.min}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-gray-900 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                    <span className="w-6 text-center font-semibold text-gray-900">{form[f.key]}</span>
                    <button onClick={() => set(f.key, String(Math.min(f.max, parseInt(form[f.key]) + 1)))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Price per night (KSh)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">KSh</span>
                  <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="5000" className={`${inp} pl-14`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Amenities</label>
                <div className="grid grid-cols-2 gap-2">
                  {AMENITY_OPTIONS.map((a) => (
                    <button key={a} onClick={() => toggleAmenity(a)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-sm transition-all ${form.amenities.includes(a) ? "border-[#FF385C] bg-rose-50 text-[#FF385C]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${form.amenities.includes(a) ? "bg-[#FF385C]" : "border border-gray-300"}`}>
                        {form.amenities.includes(a) && <svg width="8" height="8" viewBox="0 0 10 10" fill="white"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>}
                      </div>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Describe your place</h1>
                <p className="text-gray-500 mt-2">Tell guests what makes your home special</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe your space, the neighbourhood, nearby attractions…"
                  rows={6}
                  className={`${inp} resize-none`}
                />
                <p className="text-xs text-gray-400 mt-1.5 text-right">{form.description.length}/500</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Image URLs (one per line)</label>
                <textarea
                  value={form.images.join("\n")}
                  onChange={(e) => set("images", e.target.value.split("\n").filter(Boolean))}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  rows={4}
                  className={`${inp} resize-none font-mono text-xs`}
                />
                <p className="text-xs text-gray-400 mt-1">Paste Unsplash or direct image URLs</p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Review your listing</h1>
                <p className="text-gray-500 mt-2">Make sure everything looks right</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {form.images[0] && (
                  <div className="relative h-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.images[0]} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h2 className="font-bold text-gray-900 text-lg">{form.title || "Untitled"}</h2>
                    <span className="text-[#FF385C] font-bold">KSh {parseFloat(form.price || "0").toLocaleString()}/night</span>
                  </div>
                  <p className="text-sm text-gray-500">{form.city}, {form.country} · {form.location}</p>
                  <p className="text-sm text-gray-500 capitalize">{form.category} · {form.bedrooms} beds · {form.bathrooms} baths · {form.maxGuests} guests</p>
                  {form.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {form.amenities.map((a) => (
                        <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  )}
                  {form.description && <p className="text-sm text-gray-600 leading-relaxed">{form.description}</p>}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
          <button onClick={() => setStep((v) => Math.max(0, v - 1))} disabled={step === 0}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 disabled:opacity-0 hover:text-gray-900 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((v) => v + 1)}
              disabled={
                (step === 0 && (!form.title || !form.city)) ||
                (step === 1 && !form.price) ||
                (step === 2 && !form.description)
              }
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 bg-[#FF385C] hover:bg-[#E31C5F] text-white px-8 py-3 rounded-full font-bold text-sm transition-colors disabled:opacity-50">
              {loading ? "Publishing…" : "Publish listing 🎉"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

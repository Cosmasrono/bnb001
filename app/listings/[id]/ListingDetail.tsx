"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookingCalendar } from "@/components/BookingCalendar";
import { format, addHours, startOfDay, isSameDay } from "date-fns";
import { useRouter } from "next/navigation";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80",
  "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
];

// Pricing: 8 hours or more costs KSh 600; anything shorter is KSh 400.
const FULL_DAY_HOURS = 8;
const PRICE_FULL = 600;
const PRICE_SHORT = 400;
const START_HOURS = Array.from({ length: 24 }, (_, h) => h); // 0..23

function priceForHours(hours: number) {
  return hours >= FULL_DAY_HOURS ? PRICE_FULL : PRICE_SHORT;
}

function hourLabel(h: number) {
  const meridiem = h % 24 < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:00 ${meridiem}`;
}

type Listing = {
  id: string; title: string; description: string; location: string; city: string; country: string;
  price: number; images: string[]; bedrooms: number; bathrooms: number; maxGuests: number;
  amenities: string[]; category: string; rating?: number; reviewCount?: number;
  host: { id: string; name: string; createdAt: Date };
  reviews?: Array<{ id: string; rating: number; comment: string; user: { name: string; avatar?: string | null } }>;
};

type Props = {
  listing: Listing;
  bookedRanges: { checkIn: Date; checkOut: Date }[];
  userId: string | null;
  userName: string;
};

const AMENITY_ICONS: Record<string, string> = {
  wifi: "📶", pool: "🏊", parking: "🅿️", kitchen: "🍳", gym: "💪", "air conditioning": "❄️",
  tv: "📺", washer: "🫧", dryer: "🌀", workspace: "💻", "hot tub": "♨️", bbq: "🔥",
};

const BOOKING_STEPS = ["Date", "Time", "Guests", "Confirm"];

export function ListingDetail({ listing, bookedRanges, userId, userName }: Props) {
  const images = listing.images.length > 0 ? listing.images : PLACEHOLDER_IMAGES;
  const [activeImg, setActiveImg] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startHour, setStartHour] = useState(9);
  const [duration, setDuration] = useState(2);
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState(userName);
  const [guestPhone, setGuestPhone] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const router = useRouter();

  function goToStep(s: number) {
    setError("");
    setStep(s);
  }

  // Check-out is derived: check-in + duration; past 24 it rolls into the next day.
  const endHour = startHour + duration;
  const hours = duration;
  const checkoutNextDay = endHour >= 24;
  const startAt = selectedDate ? addHours(startOfDay(selectedDate), startHour) : null;
  const endAt = selectedDate ? addHours(startOfDay(selectedDate), endHour) : null;

  const isTimeConflict = !!(startAt && endAt && bookedRanges.some(
    (r) => startAt < r.checkOut && endAt > r.checkIn
  ));

  // Other bookings already on the chosen day, so the guest can avoid taken slots.
  const bookedToday = selectedDate
    ? bookedRanges
        .filter((r) => isSameDay(r.checkIn, selectedDate))
        .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime())
    : [];

  const total = hours > 0 ? priceForHours(hours) : 0;

  const canBook = !!selectedDate && hours >= 1 && !isTimeConflict;

  function handleStartChange(val: number) {
    setStartHour(val);
  }

  async function handleSystemBook() {
    if (!userId) { router.push("/auth/login"); return; }
    if (!canBook || !startAt || !endAt) return;

    setBooking(true); setError("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: listing.id,
        checkIn: startAt,
        checkOut: endAt,
        guests,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Booking failed. Please try again."); setBooking(false); return; }
    router.push("/bookings");
  }

  function handleBook() {
    if (!userId) { router.push("/auth/login"); return; }
    if (!canBook || !startAt || !endAt) return;
    if (!guestName.trim() || !guestPhone.trim()) {
      setError("Please enter your name and phone number so the host can reach you.");
      return;
    }
    setError("");

    const message = [
      `Hello Tsavo Estates! I would like to book the following room:`,
      ``,
      `*Name:* ${guestName.trim()}`,
      `*Phone:* ${guestPhone.trim()}`,
      ``,
      `*Room:* ${listing.title}`,
      `*Check-in:* ${format(startAt, "EEE, MMM d yyyy, h:mm a")}`,
      `*Check-out:* ${format(endAt, "EEE, MMM d yyyy, h:mm a")}`,
      `*Duration:* ${hours} hour${hours !== 1 ? "s" : ""}`,
      `*Guests:* ${guests}`,
      ``,
      `*Total:* KSh ${total.toLocaleString()}`,
      ``,
      `Please confirm availability and payment details. Thank you!`,
    ].join("\n");

    const waUrl = `https://wa.me/254725830546?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Title */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{listing.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
          <div className="flex items-center gap-1"><svg width="12" height="12" fill="#FF385C" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span className="font-semibold text-gray-900">{listing.rating ? listing.rating.toFixed(2) : "New"}</span>{listing.reviewCount && <span className="text-gray-400">({listing.reviewCount})</span>}</div>
          <span>·</span><span>{listing.city}, {listing.country}</span>
          <span>·</span><span className="capitalize">{listing.category}</span>
        </div>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-64 sm:h-96 mb-8">
        <div className="col-span-2 row-span-2 relative cursor-pointer" onClick={() => setGalleryOpen(true)}>
          <Image src={images[0]} alt={listing.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover hover:brightness-90 transition-all" />
        </div>
        {images.slice(1, 5).map((img, i) => (
          <div key={i} className="relative cursor-pointer" onClick={() => { setActiveImg(i + 1); setGalleryOpen(true); }}>
            <Image src={img} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover hover:brightness-90 transition-all" />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">+{images.length - 5} more</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gallery modal */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setGalleryOpen(false)}>
            <button className="absolute top-4 left-4 text-white/80 hover:text-white flex items-center gap-2 text-sm font-medium"
              onClick={() => setGalleryOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Close
            </button>
            <div className="relative w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
              <Image src={images[activeImg]} alt="" fill sizes="100vw" className="object-contain" />
              {activeImg > 0 && (
                <button onClick={() => setActiveImg((v) => v - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
              )}
              {activeImg < images.length - 1 && (
                <button onClick={() => setActiveImg((v) => v + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              )}
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">{activeImg + 1} / {images.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content + booking widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left: details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Host + quick stats */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Hosted by {listing.host.name}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""} · {listing.bathrooms} bath{listing.bathrooms !== 1 ? "s" : ""} · up to {listing.maxGuests} guests
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#FF385C] flex items-center justify-center text-white font-bold text-lg">
              {listing.host.name[0].toUpperCase()}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About this place</h3>
            <p className="text-gray-600 leading-relaxed">{listing.description}</p>
          </div>

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-3">
                {listing.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-xl">{AMENITY_ICONS[a.toLowerCase()] ?? "✓"}</span>
                    <span className="capitalize">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {listing.reviews && listing.reviews.length > 0 && (
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest reviews</h3>
              <div className="space-y-4">
                {listing.reviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                          {review.user.name?.[0] || "G"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.user.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FF385C">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: booking widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 border border-gray-200 rounded-3xl p-6 shadow-xl">
            <div className="mb-1">
              <span className="text-2xl font-bold text-gray-900">From KSh {PRICE_SHORT.toLocaleString()}</span>
              <span className="text-gray-500"> / booking</span>
            </div>
            <p className="text-xs text-gray-500 mb-5">Under 8 hrs · KSh {PRICE_SHORT.toLocaleString()} — 8 hrs or more · KSh {PRICE_FULL.toLocaleString()}</p>

            {/* Step indicator */}
            <div className="flex items-center gap-1 mb-5">
              {BOOKING_STEPS.map((label, i) => (
                <button
                  key={label}
                  onClick={() => i < step && goToStep(i)}
                  disabled={i > step}
                  className={`flex-1 flex flex-col items-center gap-1 ${i < step ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === step ? "bg-[#FF385C] text-white" : i < step ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    {i < step ? "✓" : i + 1}
                  </span>
                  <span className={`text-[10px] font-semibold ${i === step ? "text-[#FF385C]" : i < step ? "text-gray-900" : "text-gray-400"}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>

            {/* Step 1: Date */}
            {step === 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">When would you like to come?</p>
                <BookingCalendar singleDay onSelect={(d) => setSelectedDate(startOfDay(d))} />
                <button onClick={() => goToStep(1)} disabled={!selectedDate}
                  className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4">
                  {selectedDate ? "Continue" : "Pick a date to continue"}
                </button>
              </div>
            )}

            {/* Step 2: Time */}
            {step === 1 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">What time works for you?</p>

                <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-3 flex items-center justify-between text-sm">
                  <span className="text-gray-900">{selectedDate ? format(selectedDate, "EEE, MMM d, yyyy") : ""}</span>
                  <button onClick={() => goToStep(0)} className="text-xs text-[#FF385C] font-semibold hover:underline">Change</button>
                </div>

                <div className="space-y-3 mb-3">
                  <div className="border border-gray-200 rounded-xl p-3">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">Check-in time</label>
                    <select
                      value={startHour}
                      onChange={(e) => handleStartChange(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-900 focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20 outline-none"
                    >
                      {START_HOURS.map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
                    </select>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-3">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">How long will you stay?</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-900 focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20 outline-none"
                    >
                      {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
                        <option key={h} value={h}>
                          {h} hour{h !== 1 ? "s" : ""} · KSh {priceForHours(h).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 flex items-center justify-between text-sm">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Check-out time</span>
                    <span className="text-gray-900 font-semibold">{hourLabel(endHour)}{checkoutNextDay ? " (next day)" : ""}</span>
                  </div>
                </div>

                {hours > 0 && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3 px-1">
                    <span>{hourLabel(startHour)} – {hourLabel(endHour)}{checkoutNextDay ? " next day" : ""}</span>
                    <span>{hours >= FULL_DAY_HOURS ? "Full rate (8 hrs+)" : "Short rate (under 8 hrs)"}</span>
                  </div>
                )}

                {bookedToday.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-3 text-xs text-gray-600">
                    <p className="font-semibold text-gray-700 mb-1">Already booked this day</p>
                    {bookedToday.map((r, i) => (
                      <p key={i}>{format(r.checkIn, "h:mm a")} – {format(r.checkOut, "h:mm a")}</p>
                    ))}
                  </div>
                )}

                {isTimeConflict && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 mb-3">
                    This time overlaps an existing booking. Please choose a different time.
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button onClick={() => goToStep(0)}
                    className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3.5 rounded-xl hover:border-gray-900 transition-colors">
                    Back
                  </button>
                  <button onClick={() => goToStep(2)} disabled={hours < 1 || isTimeConflict}
                    className="flex-1 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Guests & details */}
            {step === 2 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Who is coming?</p>

                <div className="border border-gray-200 rounded-xl p-3 mb-4">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Guests</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{guests} guest{guests !== 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setGuests((v) => Math.max(1, v - 1))} disabled={guests <= 1}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-gray-900 transition-colors">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                      <span className="w-4 text-center text-sm font-medium">{guests}</span>
                      <button onClick={() => setGuests((v) => Math.min(listing.maxGuests, v + 1))} disabled={guests >= listing.maxGuests}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-gray-900 transition-colors">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-3 mb-4 space-y-3">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Your details</p>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Full name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20 outline-none"
                  />
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Phone number (e.g. 0712 345678)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20 outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => goToStep(1)}
                    className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3.5 rounded-xl hover:border-gray-900 transition-colors">
                    Back
                  </button>
                  <button onClick={() => goToStep(3)}
                    className="flex-1 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold py-3.5 rounded-xl transition-all">
                    Review booking
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & confirm */}
            {step === 3 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Review and confirm</p>

                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 mb-4 text-sm">
                  <div className="flex justify-between px-3 py-2.5">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-900 font-medium">{selectedDate ? format(selectedDate, "EEE, MMM d, yyyy") : "—"}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2.5">
                    <span className="text-gray-500">Time</span>
                    <span className="text-gray-900 font-medium">{hourLabel(startHour)} – {hourLabel(endHour)}{checkoutNextDay ? " (next day)" : ""}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2.5">
                    <span className="text-gray-500">Duration</span>
                    <span className="text-gray-900 font-medium">{hours} hour{hours !== 1 ? "s" : ""} · {hours >= FULL_DAY_HOURS ? "8 hrs+ rate" : "under 8 hrs rate"}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2.5">
                    <span className="text-gray-500">Guests</span>
                    <span className="text-gray-900 font-medium">{guests}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2.5 font-bold text-gray-900">
                    <span>Total</span>
                    <span>KSh {total.toLocaleString()}</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-3">{error}</div>
                )}

                <button onClick={handleSystemBook} disabled={!canBook || booking}
                  className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-rose-200">
                  {booking ? "Booking…" : "Book now"}
                </button>

                <div className="flex items-center gap-3 my-3">
                  <span className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">or for easier communication</span>
                  <span className="flex-1 h-px bg-gray-200" />
                </div>

                <button onClick={handleBook} disabled={!canBook}
                  className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-200 flex items-center justify-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Book via WhatsApp
                </button>

                <p className="text-center text-xs text-gray-400 mt-2">Chat with the host on +254 725 830546</p>

                <button onClick={() => goToStep(2)}
                  className="w-full text-center text-xs text-gray-500 underline hover:text-gray-900 transition-colors mt-3">
                  Go back
                </button>

                {!userId && (
                  <p className="text-center text-xs text-gray-400 mt-3">
                    <Link href="/auth/login" className="text-[#FF385C] font-semibold hover:underline">Log in</Link> to make a booking
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

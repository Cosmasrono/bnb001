export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSessionUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

const PLACEHOLDER = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80";

export default async function BookingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { listing: { select: { id: true, title: true, city: true, country: true, images: true, price: true } } },
    orderBy: { createdAt: "desc" },
  });

  const upcoming = bookings.filter((b) => new Date(b.checkOut) >= new Date());
  const past = bookings.filter((b) => new Date(b.checkOut) < new Date());

  function BookingCard({ b, isPast }: { b: typeof bookings[0]; isPast: boolean }) {
    const hours = Math.max(1, Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 3_600_000));
    const img = b.listing.images[0] || PLACEHOLDER;
    return (
      <div className={`flex gap-4 p-4 rounded-2xl border transition-all ${isPast ? "border-gray-100 bg-gray-50 opacity-75" : "border-gray-200 bg-white shadow-sm hover:shadow-md"}`}>
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
          <Image src={img} alt={b.listing.title} fill sizes="96px" className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/listings/${b.listing.id}`} className="font-semibold text-gray-900 hover:text-[#FF385C] transition-colors text-sm leading-snug line-clamp-1">
              {b.listing.title}
            </Link>
            <span className={`flex-shrink-0 text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              b.status === "confirmed" ? "bg-green-50 text-green-700" :
              b.status === "cancelled" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-700"
            }`}>{b.status}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{b.listing.city}, {b.listing.country}</p>
          <p className="text-xs text-gray-600 mt-2">
            {format(new Date(b.checkIn), "MMM d, yyyy")} · {format(new Date(b.checkIn), "h:mm a")} – {format(new Date(b.checkOut), "h:mm a")} · {hours} hr{hours !== 1 ? "s" : ""} · {b.guests} guest{b.guests !== 1 ? "s" : ""}
          </p>
          <p className="text-sm font-bold text-gray-900 mt-1">KSh {b.totalPrice.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar user={{ id: user.id, name: user.name, email: user.email, isHost: user.isHost }} />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🗓️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Start exploring and book your first stay!</p>
            <Link href="/listings" className="inline-flex bg-[#FF385C] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#E31C5F] transition-colors">
              Explore stays
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-700 mb-3 uppercase tracking-wide text-xs">Upcoming ({upcoming.length})</h2>
                <div className="space-y-3">
                  {upcoming.map((b) => <BookingCard key={b.id} b={b} isPast={false} />)}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-400 mb-3 uppercase tracking-wide text-xs">Past ({past.length})</h2>
                <div className="space-y-3">
                  {past.map((b) => <BookingCard key={b.id} b={b} isPast={true} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

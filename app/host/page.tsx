export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSessionUser } from "@/lib/auth";
import { isHostUser } from "@/lib/host";
import { Navbar } from "@/components/Navbar";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

const PLACEHOLDER = "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80";

export default async function HostPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");
  if (!isHostUser(user)) redirect("/host/new");

  const [listings, incomingBookings] = await Promise.all([
    prisma.listing.findMany({
      where: { hostId: user.id },
      include: { bookings: { select: { id: true, status: true, totalPrice: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      where: { listing: { hostId: user.id }, checkOut: { gte: new Date() } },
      include: {
        listing: { select: { title: true, images: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { checkIn: "asc" },
      take: 10,
    }),
  ]);

  const totalEarnings = listings.reduce((sum, l) =>
    sum + l.bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.totalPrice, 0), 0
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar user={{ id: user.id, name: user.name, email: user.email, isHost: user.isHost }} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Host Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user.name}</p>
          </div>
          <Link href="/host/new"
            className="flex items-center gap-2 bg-[#FF385C] hover:bg-[#E31C5F] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total listings", value: listings.length, icon: "🏡" },
            { label: "Active bookings", value: incomingBookings.length, icon: "📅" },
            { label: "Total earnings", value: `KSh ${totalEarnings.toLocaleString()}`, icon: "💰" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* My listings */}
          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My listings</h2>
            {listings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-3">🏡</div>
                <p className="font-semibold text-gray-900 mb-1">No listings yet</p>
                <p className="text-sm text-gray-500 mb-4">Create your first listing to start earning</p>
                <Link href="/host/new" className="text-sm text-[#FF385C] font-semibold hover:underline">Add a listing →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((l) => {
                  const confirmed = l.bookings.filter((b) => b.status === "confirmed").length;
                  const img = l.images[0] || PLACEHOLDER;
                  return (
                    <Link key={l.id} href={`/listings/${l.id}`}
                      className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                        <Image src={img} alt={l.title} fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1">{l.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{l.city}, {l.country}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">KSh {l.price.toLocaleString()}/night</span>
                          <span className="text-xs text-gray-500">{confirmed} booking{confirmed !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Incoming bookings */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming bookings</h2>
            {incomingBookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-sm text-gray-500">No upcoming bookings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomingBookings.map((b) => (
                  <div key={b.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900 text-sm line-clamp-1">{b.listing.title}</p>
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">{b.status}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1.5">
                      {format(new Date(b.checkIn), "MMM d")} · {format(new Date(b.checkIn), "h:mm a")} – {format(new Date(b.checkOut), "h:mm a")} · {b.guests} guest{b.guests !== 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">{b.user.name}</p>
                      <p className="text-sm font-bold text-gray-900">KSh {b.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

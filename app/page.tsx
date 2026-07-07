export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { getSessionUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { ListingCard } from "@/components/ListingCard";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  const [user, listings] = await Promise.all([
    getSessionUser(),
    prisma.listing.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user ? { id: user.id, name: user.name, email: user.email, isHost: user.isHost } : null} />

      {/* Hero */}
      <section className="relative h-[75vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=85"
            alt="Beautiful home"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            Discover Exceptional<br />Stays at Tsavo Estates
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8 drop-shadow max-w-2xl mx-auto">
            Find unique properties, local experiences, and exceptional hospitality. Your next adventure awaits.
          </p>
          <Link href="/listings" className="inline-block bg-[#FF385C] hover:bg-[#E31C5F] text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg">
            Explore Properties
          </Link>
        </div>
      </section>

      {/* Listings */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured stays</h2>
            <p className="text-gray-500 text-sm mt-1">Handpicked properties for your next trip</p>
          </div>
          <Link href="/listings" className="text-sm font-semibold text-[#FF385C] hover:underline">View all →</Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🏡</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-6">Be the first to list your property!</p>
            <Link href="/host/new" className="inline-flex items-center gap-2 bg-[#FF385C] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#E31C5F] transition-colors">
              List your home
            </Link>
          </div>
        )}

        {/* How it works */}
        <section className="mt-20 py-16 border-t border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">How it works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Booking a stay on Tsavo Estates takes just three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Search", desc: "Browse all stays or filter by location, price, guests and amenities to find the right fit." },
              { step: "2", title: "Book instantly", desc: "Pick your date and time on the listing page and confirm your booking in seconds." },
              { step: "3", title: "Manage your trips", desc: "Find every upcoming and past stay under “My bookings” — everything in one place." },
            ].map((item) => (
              <div key={item.step} className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FF385C]/10 text-[#FF385C] font-bold text-xl flex items-center justify-center">{item.step}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why section */}
        <section className="py-16 border-t border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Tsavo Estates?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🔒", title: "Secure Booking", desc: "Your payment is protected and held safely until check-in." },
              { icon: "⭐", title: "Verified Hosts", desc: "Every host is verified and listings are quality checked." },
              { icon: "💬", title: "24/7 Support", desc: "Our support team is here before, during and after your stay." },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Host CTA */}
        <section className="mt-4 rounded-3xl overflow-hidden relative h-72">
          <Image src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80" alt="Become a host" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20" />
          <div className="relative z-10 h-full flex flex-col justify-center px-10">
            <h2 className="text-3xl font-bold text-white mb-2">Earn extra income</h2>
            <p className="text-white/80 mb-6 max-w-sm">Share your space and start earning. Setting up your listing takes less than 10 minutes.</p>
            <Link href="/host/new" className="inline-flex self-start bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
              Get started →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 32 32" width="24" height="24" fill="#FF385C"><path d="M16 1C8.268 1 2 7.268 2 15c0 4.792 2.4 9.04 6.08 11.648L16 31l7.92-4.352C27.6 24.04 30 19.792 30 15 30 7.268 23.732 1 16 1zm0 20a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/></svg>
            <span className="font-bold text-[#FF385C]">Tsavo Estates</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 Tsavo Estates. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/listings" className="hover:text-gray-900 transition-colors">Explore stays</Link>
            <Link href="/bookings" className="hover:text-gray-900 transition-colors">My bookings</Link>
            <Link href="/host/new" className="hover:text-gray-900 transition-colors">Become a host</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

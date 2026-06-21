export const dynamic = "force-dynamic";

import { getSessionUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";
import { AmenitiesFilter } from "@/components/AmenitiesFilter";
import { PriceFilter } from "@/components/PriceFilter";
import prisma from "@/lib/prisma";

type Props = { searchParams: Promise<{ location?: string; checkIn?: string; checkOut?: string; guests?: string; category?: string; amenities?: string; minPrice?: string; maxPrice?: string }> };

export default async function ListingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const [user, listings] = await Promise.all([
    getSessionUser(),
    prisma.listing.findMany({
      where: {
        ...(params.location ? {
          OR: [
            { city: { contains: params.location, mode: "insensitive" } },
            { country: { contains: params.location, mode: "insensitive" } },
            { location: { contains: params.location, mode: "insensitive" } },
          ],
        } : {}),
        ...(params.guests ? { maxGuests: { gte: parseInt(params.guests) } } : {}),
        ...(params.category ? { category: { equals: params.category, mode: "insensitive" } } : {}),
        ...(params.minPrice ? { price: { gte: parseInt(params.minPrice) } } : {}),
        ...(params.maxPrice ? { price: { lte: parseInt(params.maxPrice) } } : {}),
        ...(params.amenities ? {
          amenities: {
            hasSome: params.amenities.split(",").filter(Boolean),
          },
        } : {}),
      },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user ? { id: user.id, name: user.name, email: user.email, isHost: user.isHost } : null} />

      {/* Search */}
      <div className="border-b border-gray-100 bg-white py-4 px-4 sm:px-6">
        <SearchBar className="max-w-2xl mx-auto" />
      </div>

      {/* Filters */}
      <div className="border-b border-gray-100 bg-gray-50 py-4 px-4 sm:px-6 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto pb-2">
          <PriceFilter />
          <AmenitiesFilter />
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            {params.location ? `Stays in ${params.location}` : "All available stays"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {listings.length} {listings.length === 1 ? "property" : "properties"} found
            {params.guests ? ` · ${params.guests} guests` : ""}
          </p>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500">Try a different location or fewer filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}

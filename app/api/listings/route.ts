import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location");
  const guests = searchParams.get("guests");

  const listings = await prisma.listing.findMany({
    where: {
      ...(location ? {
        OR: [
          { city: { contains: location, mode: "insensitive" } },
          { country: { contains: location, mode: "insensitive" } },
        ],
      } : {}),
      ...(guests ? { maxGuests: { gte: parseInt(guests) } } : {}),
    },
    include: { host: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(listings);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, city, country, location, category, price, bedrooms, bathrooms, maxGuests, description, amenities, images } = body;

  if (!title || !city || !country || !price || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const listing = await prisma.listing.create({
    data: {
      title, city, country, location: location || city, category: category || "apartment",
      price: parseFloat(price), bedrooms: parseInt(bedrooms) || 1,
      bathrooms: parseInt(bathrooms) || 1, maxGuests: parseInt(maxGuests) || 2,
      description, amenities: amenities || [], images: images || [],
      hostId: user.id,
    },
  });

  if (!user.isHost) {
    await prisma.user.update({ where: { id: user.id }, data: { isHost: true } });
  }

  return NextResponse.json({ id: listing.id });
}

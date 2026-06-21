import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please log in to book" }, { status: 401 });

  const { listingId, checkIn, checkOut, guests, totalPrice, nights } = await req.json();
  if (!listingId || !checkIn || !checkOut || !guests) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });
  }

  const conflict = await prisma.booking.findFirst({
    where: {
      listingId,
      status: { not: "cancelled" },
      OR: [
        { checkIn: { lte: checkOutDate }, checkOut: { gte: checkInDate } },
      ],
    },
  });

  if (conflict) {
    return NextResponse.json({ error: "These dates are already booked" }, { status: 409 });
  }

  const booking = await prisma.booking.create({
    data: {
      listingId,
      userId: user.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: parseInt(guests),
      totalPrice: parseFloat(totalPrice) || 0,
      nights: parseInt(nights) || 1,
      status: "confirmed",
    },
  });

  return NextResponse.json({ id: booking.id });
}

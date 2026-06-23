import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// Pricing: a booking of 8 hours or more costs KSh 600; anything shorter is KSh 400.
const FULL_DAY_HOURS = 8;
const PRICE_FULL = 600;
const PRICE_SHORT = 400;

function priceForHours(hours: number) {
  return hours >= FULL_DAY_HOURS ? PRICE_FULL : PRICE_SHORT;
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please log in to book" }, { status: 401 });

  const { listingId, checkIn, checkOut, guests } = await req.json();
  if (!listingId || !checkIn || !checkOut || !guests) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return NextResponse.json({ error: "Invalid date or time" }, { status: 400 });
  }
  if (checkInDate >= checkOutDate) {
    return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
  }

  // Same-day only. Subtract 1ms from the end so a booking ending at midnight still
  // counts as the same calendar day it started on.
  const endDayMarker = new Date(checkOutDate.getTime() - 1);
  if (checkInDate.toDateString() !== endDayMarker.toDateString()) {
    return NextResponse.json({ error: "A booking must start and end on the same day" }, { status: 400 });
  }

  const hours = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 3_600_000);
  if (hours < 1) {
    return NextResponse.json({ error: "Minimum booking is 1 hour" }, { status: 400 });
  }

  // System auto-calculates the price; never trust a client-supplied total.
  const totalPrice = priceForHours(hours);

  // Two time ranges overlap iff one starts before the other ends. Strict bounds
  // (lt / gt) so back-to-back bookings that merely touch (e.g. 9–13 then 13–17)
  // are allowed — only genuine overlaps are rejected.
  const overlapWhere = {
    listingId,
    status: { not: "cancelled" },
    checkIn: { lt: checkOutDate },
    checkOut: { gt: checkInDate },
  };

  const conflict = await prisma.booking.findFirst({ where: overlapWhere });
  if (conflict) {
    return NextResponse.json({ error: "This time slot is already booked" }, { status: 409 });
  }

  const booking = await prisma.booking.create({
    data: {
      listingId,
      userId: user.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: parseInt(guests),
      totalPrice,
      hours,
      status: "confirmed",
    },
  });

  // Race guard: another request may have created an overlapping booking between our
  // check and our create. If so, the later booking (by createdAt, id as tiebreaker)
  // yields and is removed, so the slot can never be double-booked.
  const racing = await prisma.booking.findFirst({
    where: { ...overlapWhere, id: { not: booking.id } },
    orderBy: { createdAt: "asc" },
  });
  if (racing) {
    const racingWins =
      racing.createdAt < booking.createdAt ||
      (racing.createdAt.getTime() === booking.createdAt.getTime() && racing.id < booking.id);
    if (racingWins) {
      await prisma.booking.delete({ where: { id: booking.id } });
      return NextResponse.json(
        { error: "This time slot was just booked by someone else" },
        { status: 409 }
      );
    }
  }

  return NextResponse.json({ id: booking.id });
}

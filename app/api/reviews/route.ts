import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listingId, rating, comment } = await req.json();

  if (!listingId || !rating || !comment) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  // Verify user has booked this listing
  const booking = await prisma.booking.findFirst({
    where: { listingId, userId: user.id, status: "confirmed" },
  });

  if (!booking) {
    return NextResponse.json({ error: "You must have a confirmed booking to leave a review" }, { status: 403 });
  }

  // Check if already reviewed
  const existingReview = await prisma.review.findFirst({
    where: { listingId, userId: user.id },
  });

  if (existingReview) {
    return NextResponse.json({ error: "You have already reviewed this listing" }, { status: 400 });
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      listingId,
      userId: user.id,
      rating,
      comment,
    },
    include: { user: { select: { name: true, avatar: true } } },
  });

  // Update listing rating
  const reviews = await prisma.review.findMany({ where: { listingId } });
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await prisma.listing.update({
    where: { id: listingId },
    data: { rating: avgRating, reviewCount: reviews.length },
  });

  return NextResponse.json(review);
}

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { ListingDetail } from "./ListingDetail";
import prisma from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const [user, listing] = await Promise.all([
    getSessionUser(),
    prisma.listing.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, name: true, createdAt: true } },
        bookings: { select: { checkIn: true, checkOut: true, status: true } },
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          take: 6,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ]);

  if (!listing) notFound();

  const bookedRanges = listing.bookings
    .filter((b) => b.status !== "cancelled")
    .map((b) => ({ checkIn: b.checkIn, checkOut: b.checkOut }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user ? { id: user.id, name: user.name, email: user.email, isHost: user.isHost } : null} />
      <ListingDetail listing={listing} bookedRanges={bookedRanges} userId={user?.id ?? null} userName={user?.name ?? ""} />
    </div>
  );
}

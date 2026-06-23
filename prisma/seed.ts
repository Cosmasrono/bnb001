import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hostPassword = await bcrypt.hash("isavo2024", 10);

  const host = await prisma.user.upsert({
    where: { email: "admin@isavoestates.com" },
    update: { emailVerified: true },
    create: {
      name: "Isavo Estates",
      email: "admin@isavoestates.com",
      password: hostPassword,
      isHost: true,
      emailVerified: true,
    },
  });

  const rooms = [
    {
      title: "Deluxe Garden Room",
      description:
        "A spacious deluxe room overlooking our lush gardens. Features a king-size bed, en-suite bathroom with soaking tub, and a private balcony perfect for morning coffee while listening to the birds.",
      location: "Isavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 8500,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      category: "hotel",
      amenities: ["WiFi", "Air Conditioning", "TV", "Room Service", "Parking"],
      images: [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
      ],
    },
    {
      title: "Executive Suite",
      description:
        "Our premium executive suite offers a separate living room, king bedroom, and floor-to-ceiling windows with panoramic views. Comes with complimentary breakfast, welcome drinks, and access to the executive lounge.",
      location: "Isavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 18000,
      bedrooms: 1,
      bathrooms: 2,
      maxGuests: 2,
      category: "hotel",
      amenities: ["WiFi", "Air Conditioning", "TV", "Kitchen", "Room Service", "Pool", "Gym"],
      images: [
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
        "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
      ],
    },
    {
      title: "Standard Twin Room",
      description:
        "Comfortable twin room ideal for friends or colleagues. Two single beds, en-suite shower, work desk, and all the essentials you need for a relaxed stay at Isavo Estates.",
      location: "Isavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 6500,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      category: "hotel",
      amenities: ["WiFi", "Air Conditioning", "TV", "Workspace", "Parking"],
      images: [
        "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      ],
    },
    {
      title: "Family Suite",
      description:
        "The perfect family retreat — two interconnected rooms, one with a king bed and one with two singles. Includes a kitchenette, large bathroom, child-friendly amenities, and garden access with a playground nearby.",
      location: "Isavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 22000,
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 5,
      category: "hotel",
      amenities: ["WiFi", "Air Conditioning", "TV", "Kitchen", "Parking", "Pool"],
      images: [
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
        "https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=800&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
      ],
    },
    {
      title: "Presidential Suite",
      description:
        "The crown jewel of Isavo Estates. This expansive suite features a master bedroom with a four-poster bed, a fully equipped kitchen, dining area for 6, private pool terrace, and dedicated butler service. An unmatched luxury experience.",
      location: "Isavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 45000,
      bedrooms: 3,
      bathrooms: 3,
      maxGuests: 6,
      category: "hotel",
      amenities: ["WiFi", "Air Conditioning", "TV", "Kitchen", "Pool", "Gym", "Parking", "Hot Tub", "BBQ"],
      images: [
        "https://images.unsplash.com/photo-1602872030219-ad2b9a54315c?w=800&q=80",
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
        "https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=800&q=80",
        "https://images.unsplash.com/photo-1612965607446-25e1332775ae?w=800&q=80",
      ],
    },
    {
      title: "Bedsitter",
      description:
        "A neat, self-contained bedsitter — perfect for solo guests or couples on a budget. Includes a comfortable bed, a private kitchenette, and an en-suite bathroom. Affordable, clean, and conveniently located.",
      location: "Isavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 600,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      category: "studio",
      amenities: ["WiFi", "Kitchen", "Parking"],
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      ],
    },
    {
      title: "Cozy Single Room",
      description:
        "An affordable and comfortable single room, ideal for solo travellers and business guests. Compact, clean, and well-equipped with everything you need for a productive or relaxing stay.",
      location: "Isavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 4200,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 1,
      category: "hotel",
      amenities: ["WiFi", "Air Conditioning", "TV", "Workspace"],
      images: [
        "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80",
        "https://images.unsplash.com/photo-1587985064135-0366536eab42?w=800&q=80",
      ],
    },
  ];

  for (const room of rooms) {
    await prisma.listing.create({ data: { ...room, hostId: host.id } });
  }

  console.log(`Seeded ${rooms.length} Isavo Estates rooms.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

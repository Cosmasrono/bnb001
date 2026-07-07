import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hostPassword = await bcrypt.hash("tsavo2024", 10);

  const host = await prisma.user.upsert({
    where: { email: "admin@tsavoestates.com" },
    update: { emailVerified: true },
    create: {
      name: "Tsavo Estates",
      email: "admin@tsavoestates.com",
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
      location: "Tsavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 8500,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      category: "hotel",
      amenities: ["WiFi", "Air Conditioning", "TV", "Room Service", "Parking"],
      images: [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
        "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80",
        "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&q=80",
      ],
    },
    {
      title: "Executive Suite",
      description:
        "Our premium executive suite offers a separate living room, king bedroom, and floor-to-ceiling windows with panoramic views. Comes with complimentary breakfast, welcome drinks, and access to the executive lounge.",
      location: "Tsavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 18000,
      bedrooms: 1,
      bathrooms: 2,
      maxGuests: 2,
      category: "hotel",
      amenities: ["WiFi", "Air Conditioning", "TV", "Kitchen", "Room Service", "Pool", "Gym"],
      images: [
        "https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
        "https://images.unsplash.com/photo-1549140600-78c9b8275e9d?w=800&q=80",
      ],
    },
    {
      title: "Standard Twin Room",
      description:
        "Comfortable twin room ideal for friends or colleagues. Two single beds, en-suite shower, work desk, and all the essentials you need for a relaxed stay at Tsavo Estates.",
      location: "Tsavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 6500,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      category: "hotel",
      amenities: ["WiFi", "Air Conditioning", "TV", "Workspace", "Parking"],
      images: [
        "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&q=80",
        "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80",
      ],
    },
    {
      title: "Family Suite",
      description:
        "The perfect family retreat — two interconnected rooms, one with a king bed and one with two singles. Includes a kitchenette, large bathroom, child-friendly amenities, and garden access with a playground nearby.",
      location: "Tsavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 22000,
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 5,
      category: "hotel",
      amenities: ["WiFi", "Air Conditioning", "TV", "Kitchen", "Parking", "Pool"],
      images: [
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
        "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      ],
    },
    {
      title: "Presidential Suite",
      description:
        "The crown jewel of Tsavo Estates. This expansive suite features a master bedroom with a four-poster bed, a fully equipped kitchen, dining area for 6, private pool terrace, and dedicated butler service. An unmatched luxury experience.",
      location: "Tsavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 45000,
      bedrooms: 3,
      bathrooms: 3,
      maxGuests: 6,
      category: "hotel",
      amenities: ["WiFi", "Air Conditioning", "TV", "Kitchen", "Pool", "Gym", "Parking", "Hot Tub", "BBQ"],
      images: [
        "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80",
        "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
        "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800&q=80",
      ],
    },
    {
      title: "Bedsitter",
      description:
        "A neat, self-contained bedsitter — perfect for solo guests or couples on a budget. Includes a comfortable bed, a private kitchenette, and an en-suite bathroom. Affordable, clean, and conveniently located.",
      location: "Tsavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 600,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      category: "studio",
      amenities: ["WiFi", "Kitchen", "Parking"],
      images: [
        "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80",
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
      ],
    },
    {
      title: "Cozy Single Room",
      description:
        "An affordable and comfortable single room, ideal for solo travellers and business guests. Compact, clean, and well-equipped with everything you need for a productive or relaxing stay.",
      location: "Tsavo Estates, Nairobi",
      city: "Nairobi",
      country: "Kenya",
      price: 4200,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 1,
      category: "hotel",
      amenities: ["WiFi", "Air Conditioning", "TV", "Workspace"],
      images: [
        "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80",
        "https://images.unsplash.com/photo-1549140600-78c9b8275e9d?w=800&q=80",
      ],
    },
  ];

  for (const room of rooms) {
    await prisma.listing.create({ data: { ...room, hostId: host.id } });
  }

  console.log(`Seeded ${rooms.length} Tsavo Estates rooms.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const host = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      avatarUrl: null,
      isSuperhost: true,
      responseRate: 98,
      responseTimeMin: 60,
    },
  });

  const listing = await prisma.listing.create({
    data: {
      title: 'Cozy Studio in Old Town',
      description: 'Уютная студия в центре города, рядом с кафе и набережной.',
      city: 'Prague',
      country: 'Czech Republic',
      addressLine: '123 Old Town Street',
      pricePerNight: 68,
      currency: 'USD',
      guests: 2,
      bedrooms: 1,
      beds: 1,
      baths: 1,
      ratingAvg: 4.8,
      reviewsCount: 124,
      hostId: host.id,
      images: {
        create: Array.from({ length: 7 }).map((_, i) => ({
          url: `https://picsum.photos/seed/listing_${i + 1}/1200/800`,
          order: i,
        })),
      },
      amenities: {
        create: [
          { key: 'self_checkin', label: 'Self check-in', icon: 'key' },
          { key: 'smart_tv', label: 'Smart TV with streaming', icon: 'tv' },
          { key: 'ac', label: 'Air conditioning', icon: 'snowflake' },
          { key: 'wifi', label: 'Fast Wi-Fi', icon: 'wifi' },
          { key: 'kitchen', label: 'Full kitchen', icon: 'utensils' },
          { key: 'workspace', label: 'Dedicated workspace', icon: 'laptop' },
        ],
      },
      reviews: {
        create: [
          {
            rating: 5,
            text: 'Amazing place, super clean and cozy.',
            author: { create: { name: 'Emily' } },
          },
          {
            rating: 5,
            text: 'Loved the design and the view from the window.',
            author: { create: { name: 'Sophia' } },
          },
          {
            rating: 4,
            text: 'Great host, very responsive.',
            author: { create: { name: 'Liam' } },
          },
        ],
      },
    },
  });

  await prisma.destination.createMany({
    data: [
      {
        name: 'Istanbul',
        country: 'Türkiye',
        subtitle: 'For sights like Galata Tower',
        type: 'city',
        lat: 41.0082,
        lng: 28.9784,
        imageUrl: 'https://picsum.photos/seed/istanbul/800/600',
        popularity: 90,
      },
      {
        name: 'Tbilisi',
        country: 'Georgia',
        subtitle: 'For its bustling nightlife',
        type: 'city',
        lat: 41.7151,
        lng: 44.8271,
        imageUrl: 'https://picsum.photos/seed/tbilisi/800/600',
        popularity: 70,
      },
      {
        name: 'Almaty',
        country: 'Kazakhstan',
        subtitle: 'Popular lake destination',
        type: 'mountains',
        lat: 43.222,
        lng: 76.8512,
        imageUrl: 'https://picsum.photos/seed/almaty/800/600',
        popularity: 65,
      },
      {
        name: 'Batumi',
        country: 'Georgia',
        subtitle: 'For nature-lovers',
        type: 'beach',
        lat: 41.6168,
        lng: 41.6367,
        imageUrl: 'https://picsum.photos/seed/batumi/800/600',
        popularity: 60,
      },
    ],
  });

  console.log({ listingId: listing.id });
}

main()
  .finally(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

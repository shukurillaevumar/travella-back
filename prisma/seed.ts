import { PrismaClient, DestinationType } from '@prisma/client';

const prisma = new PrismaClient();

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

async function main() {
  // чистка: сначала зависимые
  await prisma.review.deleteMany().catch(() => {});
  await prisma.booking.deleteMany().catch(() => {});
  await prisma.listingAmenity.deleteMany().catch(() => {});
  await prisma.listingImage.deleteMany().catch(() => {});
  await prisma.listing.deleteMany().catch(() => {});
  await prisma.destination.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  // 1) Destinations
  const destinations = await Promise.all(
    [
      {
        name: 'Istanbul',
        country: 'Türkiye',
        subtitle: 'For sights like Galata Tower',
        type: 'city' as DestinationType,
        lat: 41.0082,
        lng: 28.9784,
        imageUrl: 'https://picsum.photos/seed/istanbul/800/600',
        popularity: 90,
      },
      {
        name: 'Tbilisi',
        country: 'Georgia',
        subtitle: 'For its bustling nightlife',
        type: 'city' as DestinationType,
        lat: 41.7151,
        lng: 44.8271,
        imageUrl: 'https://picsum.photos/seed/tbilisi/800/600',
        popularity: 70,
      },
      {
        name: 'Almaty',
        country: 'Kazakhstan',
        subtitle: 'Popular lake destination',
        type: 'mountains' as DestinationType,
        lat: 43.222,
        lng: 76.8512,
        imageUrl: 'https://picsum.photos/seed/almaty/800/600',
        popularity: 65,
      },
      {
        name: 'Batumi',
        country: 'Georgia',
        subtitle: 'For nature-lovers',
        type: 'beach' as DestinationType,
        lat: 41.6168,
        lng: 41.6367,
        imageUrl: 'https://picsum.photos/seed/batumi/800/600',
        popularity: 60,
      },
      {
        name: 'Tashkent',
        country: 'Uzbekistan',
        subtitle: 'Big city, great food',
        type: 'city' as DestinationType,
        lat: 41.2995,
        lng: 69.2401,
        imageUrl: 'https://picsum.photos/seed/tashkent/800/600',
        popularity: 55,
      },
    ].map((d) => prisma.destination.create({ data: d })),
  );

  // 2) Hosts
  const hosts = await Promise.all(
    Array.from({ length: 8 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: `Host ${i + 1}`,
          avatarUrl: null,
          isSuperhost: Math.random() > 0.6,
          responseRate: randInt(85, 100),
          responseTimeMin: randInt(10, 240),
        },
      }),
    ),
  );

  const titles = [
    'Cozy Studio in Old Town',
    'Modern Loft with Balcony',
    'Quiet Apartment with View',
    'Sunny Flat near Downtown',
    'Minimalist Space for Work',
    'Family Home close to Metro',
    'Charming Place in Center',
    'Budget Room, Great Location',
  ];

  const amenityPool = [
    { key: 'self_checkin', label: 'Self check-in', icon: 'key' },
    { key: 'smart_tv', label: 'Smart TV with streaming', icon: 'tv' },
    { key: 'ac', label: 'Air conditioning', icon: 'snowflake' },
    { key: 'wifi', label: 'Fast Wi-Fi', icon: 'wifi' },
    { key: 'kitchen', label: 'Full kitchen', icon: 'utensils' },
    { key: 'workspace', label: 'Dedicated workspace', icon: 'laptop' },
    { key: 'washer', label: 'Washer', icon: 'washer' },
    { key: 'parking', label: 'Free parking', icon: 'parking' },
  ];

  // 3) Listings + Bookings
  const listings: {
    id: string;
    maxAdults: number;
    maxChildren: number;
    maxPets: number;
  }[] = [];

  for (let i = 0; i < 60; i++) {
    const host = pick(hosts);
    const dest = pick(destinations);

    const bedrooms = randInt(1, 3);
    const maxAdults = randInt(1, 5);
    const maxChildren = randInt(0, 4);
    const maxGuests = Math.max(1, maxAdults + maxChildren);

    const petsAllowed = Math.random() > 0.6;
    const maxPets = petsAllowed ? randInt(1, 3) : 0;

    const isAccessible = Math.random() > 0.75;

    const beds = Math.max(1, bedrooms + randInt(0, 2));
    const baths = randInt(1, 2);

    const imgCount = randInt(6, 10);
    const amenities = [...amenityPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, randInt(4, 7));

    const ratingAvg = Math.round((4 + Math.random()) * 10) / 10;
    const reviewsCount = randInt(0, 220);

    // координаты рядом с destination (чтобы карта выглядела правдоподобно)
    const lat = dest.lat + (Math.random() - 0.5) * 0.25;
    const lng = dest.lng + (Math.random() - 0.5) * 0.25;

    const listing = await prisma.listing.create({
      data: {
        title: `${pick(titles)} #${i + 1}`,
        description:
          'Cozy place for a short trip. Clean, comfortable, and well located.\n\nNear cafes, shops and transport.',
        city: dest.name,
        country: dest.country,
        addressLine: `${randInt(10, 999)} ${dest.name} Street`,
        pricePerNight: randInt(25, 240),
        currency: 'USD',
        guests: maxGuests, // для совместимости твоего UI
        bedrooms,
        beds,
        baths,
        ratingAvg,
        reviewsCount,
        lat,
        lng,
        hostId: host.id,

        destinationId: dest.id,

        maxAdults,
        maxChildren,
        maxGuests,

        petsAllowed,
        maxPets,

        isAccessible,

        images: {
          create: Array.from({ length: imgCount }).map((_, idx) => ({
            url: `https://picsum.photos/seed/listing_${i + 1}_${idx + 1}/1200/800`,
            order: idx,
          })),
        },

        amenities: { create: amenities },

        reviews: {
          create:
            Math.random() > 0.35
              ? Array.from({ length: randInt(1, 3) }).map((__, rIdx) => ({
                  rating: randInt(4, 5),
                  text: [
                    'Everything was as described.',
                    'Great location and very comfortable.',
                    'Host replied fast, smooth check-in.',
                  ][rIdx % 3],
                  author: {
                    create: {
                      name: ['Emily', 'Sophia', 'Liam', 'Noah', 'Olivia'][
                        randInt(0, 4)
                      ],
                    },
                  },
                }))
              : [],
        },
      },
      select: { id: true, maxAdults: true, maxChildren: true, maxPets: true },
    });

    listings.push({
      id: listing.id,
      maxAdults: listing.maxAdults,
      maxChildren: listing.maxChildren,
      maxPets: listing.maxPets,
    });
  }

  // 4) Bookings (чтобы поиск по датам был реальным)
  // Сгенерим часть занятых дат в ближайшие 90 дней
  const today = new Date();
  const bookingCreates = [];

  const bookingData: Array<{
    listingId: string;
    startDate: Date;
    endDate: Date;
    adults: number;
    children: number;
    pets: number;
  }> = [];

  for (const l of listings) {
    const bookingCount = randInt(0, 6);

    for (let i = 0; i < bookingCount; i++) {
      const start = addDays(today, randInt(1, 90));
      const end = addDays(start, randInt(2, 10));

      const adults = randInt(1, Math.max(1, l.maxAdults));
      const children = randInt(0, Math.max(0, l.maxChildren));
      const pets = randInt(0, Math.max(0, l.maxPets));

      bookingData.push({
        listingId: l.id,
        startDate: start,
        endDate: end,
        adults,
        children,
        pets,
      });
    }
  }

  if (bookingData.length) {
    await prisma.booking.createMany({ data: bookingData });
  }

  await prisma.$transaction(bookingCreates);

  console.log(`✅ Seed done.`);
  console.log(`Destinations: ${destinations.length}`);
  console.log(`Listings: ${listings.length}`);
  console.log(`Bookings: ${bookingCreates.length}`);
}

main()
  .finally(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

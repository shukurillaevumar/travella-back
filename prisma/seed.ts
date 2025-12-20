import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  // 1) Почистим старое (порядок важен из-за связей)
  // Если у тебя другие имена моделей, скажи и я подстрою.
  await prisma.review.deleteMany().catch(() => {});
  await prisma.listingAmenity.deleteMany().catch(() => {});
  await prisma.listingImage.deleteMany().catch(() => {});
  await prisma.listing.deleteMany().catch(() => {});
  await prisma.destination.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  // 2) Хосты
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

  const places = [
    { city: 'Prague', country: 'Czech Republic' },
    { city: 'Istanbul', country: 'Türkiye' },
    { city: 'Tbilisi', country: 'Georgia' },
    { city: 'Almaty', country: 'Kazakhstan' },
    { city: 'Batumi', country: 'Georgia' },
    { city: 'Dubai', country: 'UAE' },
    { city: 'Baku', country: 'Azerbaijan' },
    { city: 'Tashkent', country: 'Uzbekistan' },
  ];

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

  // 3) 50 listings
  const listingIds: string[] = [];

  for (let i = 0; i < 50; i++) {
    const host = pick(hosts);
    const place = pick(places);

    const bedrooms = randInt(1, 3);
    const guests = randInt(1, 6);
    const beds = Math.max(1, bedrooms + randInt(0, 2));
    const baths = randInt(1, 2);

    const imgCount = randInt(6, 10);
    const amenities = [...amenityPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, randInt(4, 7));

    const ratingAvg = Math.round((4 + Math.random()) * 10) / 10; // 4.0 - 5.0
    const reviewsCount = randInt(0, 220);

    // Легкие "рандомные" координаты (не идеально реальные, но хватит для моков)
    const lat = 20 + Math.random() * 30;
    const lng = 30 + Math.random() * 50;

    const listing = await prisma.listing.create({
      data: {
        title: `${pick(titles)} #${i + 1}`,
        description:
          'Уютное место для короткой поездки. Чисто, комфортно, хорошая локация.\n\nРядом есть кафе, магазины и транспорт.',
        city: place.city,
        country: place.country,
        addressLine: `${randInt(10, 999)} ${place.city} Street`,
        pricePerNight: randInt(25, 240),
        currency: 'USD',
        guests,
        bedrooms,
        beds,
        baths,
        ratingAvg,
        reviewsCount,
        lat,
        lng,
        hostId: host.id,

        images: {
          create: Array.from({ length: imgCount }).map((_, idx) => ({
            url: `https://picsum.photos/seed/listing_${i + 1}_${idx + 1}/1200/800`,
            order: idx,
          })),
        },

        amenities: {
          create: amenities,
        },

        reviews: {
          create:
            Math.random() > 0.35
              ? Array.from({ length: randInt(1, 3) }).map((__, rIdx) => ({
                  rating: randInt(4, 5),
                  text: [
                    'Очень понравилось, все как в описании.',
                    'Отличная локация и комфортная квартира.',
                    'Хост быстро отвечал, заезд без проблем.',
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
      select: { id: true },
    });

    listingIds.push(listing.id);
  }

  // 4) Destinations (оставил твои)
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

  console.log(`✅ Seed done. Listings: ${listingIds.length}`);
  console.log(`Example listingId: ${listingIds[0]}`);
}

main()
  .finally(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

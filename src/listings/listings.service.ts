import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        host: true,
        images: { orderBy: { order: 'asc' } },
        amenities: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 6,
          include: { author: true },
        },
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');

    return {
      id: listing.id,
      title: listing.title,
      location: {
        city: listing.city,
        country: listing.country,
        addressLine: listing.addressLine,
        lat: listing.lat,
        lng: listing.lng,
      },
      price: { perNight: listing.pricePerNight, currency: listing.currency },
      capacity: {
        guests: listing.guests,
        bedrooms: listing.bedrooms,
        beds: listing.beds,
        baths: listing.baths,
      },
      rating: { avg: listing.ratingAvg, count: listing.reviewsCount },
      description: listing.description,
      images: listing.images.map((img) => img.url),
      amenities: listing.amenities.map((a) => ({
        key: a.key,
        label: a.label,
        icon: a.icon,
      })),
      host: {
        id: listing.host.id,
        name: listing.host.name,
        avatarUrl: listing.host.avatarUrl,
        isSuperhost: listing.host.isSuperhost,
        responseRate: listing.host.responseRate,
        responseTimeMin: listing.host.responseTimeMin,
      },
      reviews: listing.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
        author: {
          id: r.author.id,
          name: r.author.name,
          avatarUrl: r.author.avatarUrl,
        },
      })),
    };
  }

  async list(params: {
    city?: string;
    country?: string;
    take?: number;
    skip?: number;
  }) {
    const take = Math.min(params.take ?? 12, 24);
    const skip = params.skip ?? 0;

    const items = await this.prisma.listing.findMany({
      where: {
        city: params.city,
        country: params.country,
      },
      orderBy: { updatedAt: 'desc' },
      take,
      skip,
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
      },
    });

    return items.map((l) => ({
      id: l.id,
      title: l.title,
      city: l.city,
      country: l.country,
      pricePerNight: l.pricePerNight,
      currency: l.currency,
      ratingAvg: l.ratingAvg,
      reviewsCount: l.reviewsCount,
      coverImage: l.images[0]?.url ?? null,
    }));
  }
}

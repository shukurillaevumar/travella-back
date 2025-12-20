import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const aa = s1 * s1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(aa)));
}

@Injectable()
export class DestinationsService {
  constructor(private prisma: PrismaService) {}

  async suggested(latStr?: string, lngStr?: string) {
    const lat = latStr ? Number(latStr) : NaN;
    const lng = lngStr ? Number(lngStr) : NaN;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('lat and lng are required');
    }

    const raw = await this.prisma.destination.findMany({
      take: 30,
      orderBy: [{ popularity: 'desc' }, { updatedAt: 'desc' }],
    });

    const scored = raw
      .map((d) => ({
        id: d.id,
        name: d.name,
        country: d.country,
        subtitle: d.subtitle,
        imageUrl: d.imageUrl,
        type: d.type,
        center: { lat: d.lat, lng: d.lng },
        distanceKm: haversineKm(lat, lng, d.lat, d.lng),
        popularity: d.popularity,
      }))
      // баланс: и близко, и популярно
      .sort(
        (a, b) =>
          a.distanceKm * 0.7 -
          a.popularity * 0.3 -
          (b.distanceKm * 0.7 - b.popularity * 0.3),
      )
      .slice(0, 8)
      .map(({ popularity, ...dto }) => dto);

    return scored;
  }
}

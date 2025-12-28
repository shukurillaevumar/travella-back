import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBookingDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format.');
    }
    if (end <= start) {
      throw new BadRequestException('End date must be after start date.');
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      select: {
        id: true,
        maxAdults: true,
        maxChildren: true,
        maxPets: true,
        maxGuests: true,
        petsAllowed: true,
      },
    });

    if (!listing) throw new NotFoundException('Listing not found.');

    const adults = dto.adults ?? 1;
    const children = dto.children ?? 0;
    const pets = dto.pets ?? 0;

    const totalGuests = adults + children;

    if (adults > listing.maxAdults)
      throw new BadRequestException('Too many adults.');
    if (children > listing.maxChildren)
      throw new BadRequestException('Too many children.');
    if (totalGuests > listing.maxGuests)
      throw new BadRequestException('Too many guests.');

    if (pets > 0 && !listing.petsAllowed) {
      throw new BadRequestException('Pets are not allowed.');
    }
    if (pets > listing.maxPets) {
      throw new BadRequestException('Too many pets.');
    }

    // проверка пересечения дат
    const overlap = await this.prisma.booking.findFirst({
      where: {
        listingId: dto.listingId,
        AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
      },
      select: { id: true },
    });

    if (overlap)
      throw new BadRequestException(
        'Listing is not available for these dates.',
      );

    return this.prisma.booking.create({
      data: {
        listingId: dto.listingId,
        startDate: start,
        endDate: end,
        adults,
        children,
        pets,
      },
    });
  }

  async findAll(listingId?: string) {
    return this.prisma.booking.findMany({
      where: listingId ? { listingId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { listing: true },
      take: 100,
    });
  }
}

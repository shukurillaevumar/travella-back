import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ListingsModule } from './listings/listings.module';
import { DestinationsModule } from './destinations/destinations.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [PrismaModule, ListingsModule, DestinationsModule, BookingsModule],
})
export class AppModule {}

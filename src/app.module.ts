import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ListingsModule } from './listings/listings.module';

@Module({
  imports: [PrismaModule, ListingsModule],
})
export class AppModule {}

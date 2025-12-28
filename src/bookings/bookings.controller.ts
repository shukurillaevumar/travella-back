import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto/create-booking.dto';

@Controller('bookings')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ✅ Проверить список бронирований
  // GET /bookings
  // GET /bookings?listingId=...
  @Get()
  findAll(@Query('listingId') listingId?: string) {
    return this.bookingsService.findAll(listingId);
  }

  // ✅ Создать бронирование
  // POST /bookings
  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(private service: ListingsService) {}

  @Get()
  list(
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.service.list({
      city,
      country,
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
    });
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }
}

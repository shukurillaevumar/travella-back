import { Controller, Get, Query } from '@nestjs/common';
import { DestinationsService } from './destinations.service';

@Controller('destinations')
export class DestinationsController {
  constructor(private service: DestinationsService) {}

  @Get('suggested')
  suggested(@Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.service.suggested(lat, lng);
  }
}

import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const toInt = ({ value }: { value: any }) => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export class CreateBookingDto {
  @IsString()
  listingId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(1)
  adults?: number;

  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(0)
  children?: number;

  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(0)
  pets?: number;
}

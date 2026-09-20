import { IsNotEmpty, IsOptional, IsString, IsNumber, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReportDto {
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @MinLength(5, { message: 'Description must be at least 5 characters' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  longitude?: number;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  voiceUrl?: string;

  @IsOptional()
  @IsString()
  locationName?: string;
}

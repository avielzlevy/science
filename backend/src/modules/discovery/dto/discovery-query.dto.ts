import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class DiscoveryQueryDTO {
  @ApiPropertyOptional({
    description: 'UUID of the category to fetch a skit from',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: '"I\'m feeling lucky" — returns a random unplayed skit across all categories',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isRandom?: boolean;

  @ApiPropertyOptional({
    description: 'If true, triggers the Curator to harvest fresh papers before responding',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  forceRefresh?: boolean;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiscoveryResponseDTO {
  @ApiProperty({ description: 'The skit UUID' })
  skitId!: string;

  @ApiProperty({ description: 'Whether this skit was served from Redis cache' })
  fromCache!: boolean;

  @ApiProperty({ description: 'Category slug' })
  categorySlug!: string;

  @ApiProperty({ description: 'Research paper title' })
  paperTitle!: string;

  @ApiProperty({ description: 'Full cinematic script (all three acts)' })
  fullScript!: string;

  @ApiPropertyOptional({ description: 'URL to the generated cover art' })
  coverArtUrl?: string | null;

  @ApiPropertyOptional({ description: 'URL to the generated voiceover' })
  voiceoverUrl?: string | null;

  @ApiProperty({
    description: 'Reliability score (0-100)',
    minimum: 0,
    maximum: 100,
  })
  reliabilityScore!: number;

  @ApiProperty({
    description: 'Sci-Fi vs Fact rating (0.0 = pure fact, 1.0 = pure sci-fi)',
    minimum: 0,
    maximum: 1,
  })
  sciFiFactRating!: number;

  @ApiProperty({ description: 'Whether the source paper has been retracted' })
  isRetracted!: boolean;
}

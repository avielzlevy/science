import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SkitDTO {
  @ApiProperty({ description: 'Unique skit identifier (UUID)' })
  id!: string;

  @ApiProperty({ description: 'ID of the source research paper' })
  researchId!: string;

  @ApiProperty({ description: 'Category slug this skit belongs to' })
  categoryId!: string;

  // ── Preset B Narrative Sections ──────────────────────────────────────────

  @ApiProperty({ description: '[The World Before] — status quo narrative act' })
  worldBefore!: string;

  @ApiProperty({ description: '[The Breakthrough] — inciting incident narrative act' })
  breakthrough!: string;

  @ApiProperty({ description: '[The New Reality] — world-changing implications act' })
  newReality!: string;

  @ApiProperty({ description: 'Full concatenated cinematic script' })
  fullScript!: string;

  // ── Asset Generation ─────────────────────────────────────────────────────

  @ApiProperty({ description: 'DALL-E prompt used to generate cover art' })
  visualPrompt!: string;

  @ApiPropertyOptional({ description: 'URL of the generated cover art image' })
  coverArtUrl?: string | null;

  @ApiPropertyOptional({ description: 'URL of the generated TTS voiceover' })
  voiceoverUrl?: string | null;

  // ── Quality Signals ──────────────────────────────────────────────────────

  @ApiProperty({
    description: 'Sci-Fi vs Fact rating (0.0 = pure fact, 1.0 = pure sci-fi speculation)',
    minimum: 0,
    maximum: 1,
  })
  sciFiFactRating!: number;

  @ApiProperty({
    description: 'Reliability score (0-100) calculated from citation velocity + journal impact',
    minimum: 0,
    maximum: 100,
  })
  reliabilityScore!: number;

  @ApiProperty({ description: 'Whether the source paper has been retracted' })
  isRetracted!: boolean;

  // ── State ────────────────────────────────────────────────────────────────

  @ApiProperty({ enum: ['PENDING', 'GENERATING', 'COMPLETE', 'FAILED'] })
  generationStatus!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

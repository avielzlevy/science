import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Zod schema — strict enforcement of the standardised research contract.
// Any adapter that cannot map to this shape must throw, not silently degrade.
// ─────────────────────────────────────────────────────────────────────────────

export const RawResearchSchema = z.object({
  externalId: z.string().min(1),
  source: z.enum(['SEMANTIC_SCHOLAR', 'NATURE', 'IEEE']),
  title: z.string().min(1),
  abstract: z.string().min(200, 'Abstract must be at least 200 words to generate a quality skit'),
  doi: z.string().optional().nullable(),
  publishedAt: z.date(),
  journalName: z.string().optional().nullable(),
  citationCount: z.number().int().nonnegative(),
  journalImpact: z.number().positive().optional().nullable(),
  authors: z.array(
    z.object({
      name: z.string().min(1),
      affiliations: z.array(z.string()),
    }),
  ),
  rawJson: z.record(z.unknown()),
});

export type RawResearchDTO = z.infer<typeof RawResearchSchema>;

// Validates and throws a clean ZodError if the shape is wrong
export function validateRawResearch(data: unknown): RawResearchDTO {
  return RawResearchSchema.parse(data);
}

import { RawResearchDTO } from '../../curator/dto/raw-research.dto';

// ─────────────────────────────────────────────────────────────────────────────
// Preset B — "The Visionary"
// Tone: Cinematic Sci-Fi narrator blurring current tech and upcoming reality.
// Temperature: 0.7  |  Trust: Moderate (Sci-Fi vs Fact gamification)
// Flow: [The World Before] -> [The Breakthrough] -> [The New Reality]
// ─────────────────────────────────────────────────────────────────────────────

export const VISIONARY_SYSTEM_PROMPT = `
You are "The Visionary" — a cinematic narrator who transforms real academic research
into immersive, near-future stories. You blur the line between current science and
what could come next, framing every breakthrough as a turning point in human history.

Your narration must follow this exact three-act structure:
1. THE WORLD BEFORE — The status quo. What problem plagued humanity before this discovery?
2. THE BREAKTHROUGH — The inciting incident. What did the scientists discover, and how?
3. THE NEW REALITY — The ripple effects. How does this research reshape the world in 5-10 years?

Tone: Bold, expansive, cinematic. Think Carl Sagan meets a Black Mirror episode opener.

CRITICAL RULES:
- Ground every claim in the actual paper — do NOT fabricate statistics.
- For each speculative leap (Sci-Fi extrapolation), flag it with [SCI-FI] inline.
- For factual claims directly from the abstract, flag with [FACT].
- Assign a sciFiFactRating from 0.0 (pure fact) to 1.0 (pure sci-fi speculation).
- Generate a vivid visual_prompt for cover art generation (cinematic, moody, photorealistic).

You MUST respond with ONLY valid JSON matching this exact schema:
{
  "worldBefore": "string — 2-3 sentences",
  "breakthrough": "string — 3-4 sentences",
  "newReality": "string — 2-3 sentences",
  "fullScript": "string — the complete narration combining all three acts",
  "visualPrompt": "string — DALL-E prompt for cinematic cover art, max 400 chars",
  "sciFiFactRating": number
}
`.trim();

export function buildVisionaryUserPrompt(research: RawResearchDTO): string {
  const authors = research.authors.slice(0, 3).map((a) => a.name).join(', ');
  const publishYear = research.publishedAt.getFullYear();
  const journal = research.journalName ?? 'an academic journal';

  return `
PAPER METADATA:
- Title: "${research.title}"
- Authors: ${authors}
- Published: ${publishYear} in ${journal}
- Citation Count: ${research.citationCount}
${research.journalImpact ? `- Journal Impact Factor: ${research.journalImpact}` : ''}

ABSTRACT:
${research.abstract}

Generate "The Visionary" narration for this research. Remember:
- Use [FACT] and [SCI-FI] tags.
- The sciFiFactRating should reflect how much you extrapolated beyond the abstract.
- The visual_prompt should capture the cinematic essence of the breakthrough — not the lab, but the world it creates.
- Return ONLY the JSON object. No markdown fences, no preamble.
`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Zod schema for strict LLM output validation + auto-retry on hallucination
// ─────────────────────────────────────────────────────────────────────────────
import { z } from 'zod';

export const VisionaryOutputSchema = z.object({
  worldBefore: z.string().min(50),
  breakthrough: z.string().min(80),
  newReality: z.string().min(50),
  fullScript: z.string().min(200),
  visualPrompt: z.string().min(20).max(400),
  sciFiFactRating: z.number().min(0).max(1),
});

export type VisionaryOutput = z.infer<typeof VisionaryOutputSchema>;

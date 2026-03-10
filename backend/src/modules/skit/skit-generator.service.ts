import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { RawResearchDTO } from '../curator/dto/raw-research.dto';
import {
  VISIONARY_SYSTEM_PROMPT,
  buildVisionaryUserPrompt,
  VisionaryOutputSchema,
  VisionaryOutput,
} from './prompts/visionary.prompt';

const MAX_LLM_RETRIES = 3;

export interface GeneratedAssets {
  narrative: VisionaryOutput;
  coverArtUrl: string;
  voiceoverUrl: string;
}

@Injectable()
export class SkitGeneratorService {
  private readonly logger = new Logger(SkitGeneratorService.name);
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly temperature: number;
  private readonly imageModel: string;
  private readonly imageSize: string;
  private readonly ttsModel: string;
  private readonly ttsVoice: string;

  constructor(private readonly config: ConfigService) {
    this.openai = new OpenAI({ apiKey: config.get<string>('ai.openai.apiKey') });
    this.model = config.get<string>('ai.openai.model') ?? 'gpt-4o';
    this.temperature = config.get<number>('ai.openai.temperature') ?? 0.7;
    this.imageModel = config.get<string>('ai.imageGen.model') ?? 'dall-e-3';
    this.imageSize = config.get<string>('ai.imageGen.size') ?? '1792x1024';
    this.ttsModel = config.get<string>('ai.tts.model') ?? 'tts-1-hd';
    this.ttsVoice = config.get<string>('ai.tts.voice') ?? 'onyx';
  }

  /**
   * Core cognitive pipeline — fires all three generation tasks concurrently
   * once the LLM script (which others depend on) has been produced.
   *
   * Dependency graph:
   *   LLM Script
   *     ├─► Image Gen (uses visualPrompt)   ─┐
   *     └─► TTS (uses fullScript)            ├─► SkitAssets
   */
  async generate(research: RawResearchDTO): Promise<GeneratedAssets> {
    this.logger.log(`Generating skit for: "${research.title}"`);

    // Step 1 — LLM (blocking — image + TTS depend on its output)
    const narrative = await this.generateNarrative(research);

    this.logger.log(`Narrative ready. Launching image + TTS concurrently.`);

    // Step 2 — Promise.all for independent asset generation
    const [coverArtUrl, voiceoverUrl] = await Promise.all([
      this.generateCoverArt(narrative.visualPrompt),
      this.generateVoiceover(narrative.fullScript),
    ]);

    return { narrative, coverArtUrl, voiceoverUrl };
  }

  // ── LLM: Narrative Script ────────────────────────────────────────────────

  private async generateNarrative(research: RawResearchDTO): Promise<VisionaryOutput> {
    const userPrompt = buildVisionaryUserPrompt(research);

    for (let attempt = 1; attempt <= MAX_LLM_RETRIES; attempt++) {
      try {
        const completion = await this.openai.chat.completions.create({
          model: this.model,
          temperature: this.temperature,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: VISIONARY_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw) throw new Error('OpenAI returned empty content');

        const parsed = JSON.parse(raw) as unknown;
        const validated = VisionaryOutputSchema.parse(parsed);

        this.logger.log(`Narrative generated (attempt ${attempt}). SciFi rating: ${validated.sciFiFactRating}`);
        return validated;
      } catch (err) {
        this.logger.warn(`Narrative attempt ${attempt}/${MAX_LLM_RETRIES} failed: ${(err as Error).message}`);
        if (attempt === MAX_LLM_RETRIES) throw err;
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      }
    }

    throw new Error('Narrative generation failed after all retries');
  }

  // ── Image Generation: DALL-E 3 ───────────────────────────────────────────

  private async generateCoverArt(visualPrompt: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: this.imageModel,
        prompt: `Cinematic, photorealistic, moody sci-fi atmosphere. ${visualPrompt}`,
        n: 1,
        size: this.imageSize as '1792x1024',
        quality: 'hd',
        style: 'vivid',
      });

      const url = response.data[0]?.url;
      if (!url) throw new Error('DALL-E returned no image URL');

      this.logger.log('Cover art generated.');
      return url;
    } catch (err) {
      this.logger.error(`Cover art generation failed: ${(err as Error).message}`);
      // Non-fatal — skit can exist without cover art
      return '';
    }
  }

  // ── TTS: Voiceover ───────────────────────────────────────────────────────

  private async generateVoiceover(script: string): Promise<string> {
    try {
      // TTS models have ~4096 token limits — truncate gracefully if needed
      const truncated = script.slice(0, 4000);

      const response = await this.openai.audio.speech.create({
        model: this.ttsModel,
        voice: this.ttsVoice as 'onyx',
        input: truncated,
        response_format: 'mp3',
        speed: 0.95,  // Slightly slower for cinematic pacing
      });

      // Convert to base64 data URL for immediate use; in production, upload to S3/CDN
      const buffer = Buffer.from(await response.arrayBuffer());
      const dataUrl = `data:audio/mp3;base64,${buffer.toString('base64')}`;

      this.logger.log('Voiceover generated.');
      return dataUrl;
    } catch (err) {
      this.logger.error(`Voiceover generation failed: ${(err as Error).message}`);
      return '';
    }
  }

  // ── Reliability Score Calculator ─────────────────────────────────────────

  calculateReliabilityScore(
    citationCount: number,
    journalImpact: number | null | undefined,
    publishedAt: Date,
  ): number {
    // Citation velocity component (0-40 pts)
    const ageYears = Math.max(
      0.5,
      (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24 * 365),
    );
    const citationsPerYear = citationCount / ageYears;
    const citationScore = Math.min(40, Math.round((citationsPerYear / 50) * 40));

    // Journal impact component (0-40 pts)
    const impactScore = journalImpact
      ? Math.min(40, Math.round((journalImpact / 10) * 40))
      : 20; // neutral when unknown

    // Recency component (0-20 pts — newer = higher)
    const yearsOld = ageYears;
    const recencyScore = Math.max(0, Math.round(20 - (yearsOld / 5) * 20));

    return Math.min(100, citationScore + impactScore + recencyScore);
  }
}

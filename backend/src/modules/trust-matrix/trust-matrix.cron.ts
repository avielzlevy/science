import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { SkitGeneratorService } from '../skit/skit-generator.service';

interface CrossrefWork {
  'is-referenced-by-count': number;
}

interface CrossrefResponse {
  message: CrossrefWork;
}

interface RetractionWatchRecord {
  RetractionDOI: string;
  RetractionDate: string;
}

@Injectable()
export class TrustMatrixCron {
  private readonly logger = new Logger(TrustMatrixCron.name);
  private readonly semanticScholarBase: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: SkitGeneratorService,
    private readonly config: ConfigService,
  ) {
    this.semanticScholarBase =
      config.get<string>('academic.semanticScholar.baseUrl') ??
      'https://api.semanticscholar.org/graph/v1';
  }

  /**
   * Runs every Monday at 03:00 UTC.
   * Scans all COMPLETE skits and re-evaluates their reliabilityScore:
   *   1. Fetches live citation count from Crossref (via DOI)
   *   2. Checks the Retraction Watch database for paper retraction
   *   3. Recalculates reliabilityScore using the current citation velocity formula
   *   4. Flags isRetracted=true and lowers score to 0 if paper was retracted
   */
  @Cron('0 3 * * 1', { name: 'trust-matrix-weekly-audit' })
  async weeklyAudit(): Promise<void> {
    this.logger.log('Trust Matrix weekly audit started');

    const skits = await this.prisma.skit.findMany({
      where: { generationStatus: 'COMPLETE' },
      include: {
        research: {
          select: { doi: true, publishedAt: true, externalId: true, citationCount: true, journalImpact: true },
        },
      },
    });

    this.logger.log(`Auditing ${skits.length} skits`);

    let updated = 0;
    let retracted = 0;

    for (const skit of skits) {
      try {
        const { research } = skit;

        // ── Step 1: Live citation count (Crossref) ───────────────────────
        let liveCitationCount = research.citationCount;
        if (research.doi) {
          liveCitationCount = await this.fetchCitationCount(research.doi);
        }

        // ── Step 2: Retraction check ─────────────────────────────────────
        let isRetracted = skit.isRetracted;
        if (research.doi && !skit.isRetracted) {
          isRetracted = await this.checkRetraction(research.doi);
          if (isRetracted) {
            retracted++;
            this.logger.warn(`Paper RETRACTED: DOI ${research.doi} — skit ${skit.id} flagged`);
          }
        }

        // ── Step 3: Recalculate reliability score ────────────────────────
        const newScore = isRetracted
          ? 0
          : this.generator.calculateReliabilityScore(
              liveCitationCount,
              research.journalImpact,
              research.publishedAt,
            );

        // ── Step 4: Persist changes ───────────────────────────────────────
        await this.prisma.skit.update({
          where: { id: skit.id },
          data: {
            reliabilityScore: newScore,
            isRetracted,
            lastAuditedAt: new Date(),
            research: {
              update: { citationCount: liveCitationCount },
            },
          },
        });

        updated++;
      } catch (err) {
        this.logger.error(`Audit failed for skit ${skit.id}: ${(err as Error).message}`);
      }
    }

    this.logger.log(`Trust Matrix audit complete: ${updated} updated, ${retracted} retracted`);
  }

  // ── Crossref citation count lookup ───────────────────────────────────────

  private async fetchCitationCount(doi: string): Promise<number> {
    try {
      const { data } = await axios.get<CrossrefResponse>(
        `https://api.crossref.org/works/${encodeURIComponent(doi)}`,
        { timeout: 8000, headers: { 'User-Agent': 'ResearchReels/1.0 (contact@researchreels.io)' } },
      );
      return data.message['is-referenced-by-count'] ?? 0;
    } catch {
      return 0;
    }
  }

  // ── Retraction Watch API check ────────────────────────────────────────────

  private async checkRetraction(doi: string): Promise<boolean> {
    try {
      const { data } = await axios.get<RetractionWatchRecord[]>(
        `https://api.retractionwatch.com/api/v1/retractions`,
        {
          params: { doi },
          timeout: 8000,
          headers: { 'User-Agent': 'ResearchReels/1.0' },
        },
      );
      return Array.isArray(data) && data.length > 0;
    } catch {
      // Retraction Watch unavailable — do not mark as retracted by default
      return false;
    }
  }
}

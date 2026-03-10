import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CuratorService } from '../curator/curator.service';
import { SkitGeneratorService } from './skit-generator.service';
import { RawResearchDTO } from '../curator/dto/raw-research.dto';
import { GenerateSkitByQueryDTO } from './dto/generate-skit.dto';
import { Skit } from '@prisma/client';

@Injectable()
export class SkitService {
  private readonly logger = new Logger(SkitService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly curator: CuratorService,
    private readonly generator: SkitGeneratorService,
  ) {}

  // ── Harvest → Generate pipeline ─────────────────────────────────────────

  async harvestAndGenerate(dto: GenerateSkitByQueryDTO): Promise<Skit[]> {
    const papers = await this.curator.harvest({
      query: dto.query,
      limitPerSource: 3,
    });

    this.logger.log(`Harvested ${papers.length} papers. Generating skits...`);

    const results = await Promise.allSettled(
      papers.map((paper) => this.generateAndPersist(paper, dto.categoryId)),
    );

    const skits: Skit[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        skits.push(result.value);
      } else {
        this.logger.warn(`Skit generation failed for a paper: ${result.reason}`);
      }
    }

    return skits;
  }

  // ── Single paper → skit ──────────────────────────────────────────────────

  async generateAndPersist(research: RawResearchDTO, categoryId: string): Promise<Skit> {
    // Upsert research record
    const dbResearch = await this.upsertResearch(research);

    // Avoid re-generating if a complete skit already exists
    const existing = await this.prisma.skit.findUnique({
      where: { researchId: dbResearch.id },
    });

    if (existing?.generationStatus === 'COMPLETE') {
      this.logger.log(`Skit already exists for research ${dbResearch.id}, skipping.`);
      return existing;
    }

    // Mark as GENERATING
    const skit = await this.prisma.skit.upsert({
      where: { researchId: dbResearch.id },
      create: {
        researchId: dbResearch.id,
        categoryId,
        worldBefore: '',
        breakthrough: '',
        newReality: '',
        fullScript: '',
        visualPrompt: '',
        generationStatus: 'GENERATING',
      },
      update: { generationStatus: 'GENERATING', failureReason: null },
    });

    try {
      const assets = await this.generator.generate(research);
      const reliabilityScore = this.generator.calculateReliabilityScore(
        research.citationCount,
        research.journalImpact,
        research.publishedAt,
      );

      return await this.prisma.skit.update({
        where: { id: skit.id },
        data: {
          ...assets.narrative,
          coverArtUrl: assets.coverArtUrl || null,
          voiceoverUrl: assets.voiceoverUrl || null,
          reliabilityScore,
          generationStatus: 'COMPLETE',
        },
      });
    } catch (err) {
      await this.prisma.skit.update({
        where: { id: skit.id },
        data: {
          generationStatus: 'FAILED',
          failureReason: (err as Error).message,
        },
      });
      throw err;
    }
  }

  // ── Read operations ──────────────────────────────────────────────────────

  async findById(id: string): Promise<Skit> {
    const skit = await this.prisma.skit.findUnique({
      where: { id },
      include: { research: { include: { authors: true } }, category: true },
    });
    if (!skit) throw new NotFoundException(`Skit ${id} not found.`);
    return skit;
  }

  async findByCategory(categoryId: string, limit = 20, offset = 0): Promise<Skit[]> {
    return this.prisma.skit.findMany({
      where: { categoryId, generationStatus: 'COMPLETE', isRetracted: false },
      orderBy: { reliabilityScore: 'desc' },
      take: limit,
      skip: offset,
      include: { research: { select: { title: true, citationCount: true } } },
    });
  }

  async markPlayed(id: string): Promise<void> {
    await this.prisma.skit.update({
      where: { id },
      data: { played: true, playCount: { increment: 1 } },
    });
  }

  // ── Research persistence ─────────────────────────────────────────────────

  private async upsertResearch(dto: RawResearchDTO) {
    const authorOps = dto.authors.map((a) => ({
      where: { name: a.name } as { name: string },
      create: { name: a.name, affiliations: a.affiliations },
    }));

    return this.prisma.research.upsert({
      where: { externalId: dto.externalId },
      create: {
        externalId: dto.externalId,
        source: dto.source,
        title: dto.title,
        abstract: dto.abstract,
        doi: dto.doi ?? null,
        publishedAt: dto.publishedAt,
        journalName: dto.journalName ?? null,
        citationCount: dto.citationCount,
        journalImpact: dto.journalImpact ?? null,
        rawJson: dto.rawJson,
        authors: { connectOrCreate: authorOps },
      },
      update: {
        citationCount: dto.citationCount,
        journalImpact: dto.journalImpact ?? null,
        updatedAt: new Date(),
      },
    });
  }
}

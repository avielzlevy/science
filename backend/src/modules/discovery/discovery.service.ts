import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { SkitService } from "../skit/skit.service";
import { DiscoveryQueryDTO } from "./dto/discovery-query.dto";
import { DiscoveryResponseDTO } from "./dto/discovery-response.dto";

@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);
  private readonly skitTtl: number;
  private readonly categoryIndexTtl: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly prisma: PrismaService,
    private readonly skitService: SkitService,
    private readonly config: ConfigService,
  ) {
    this.skitTtl = config.get<number>("redis.skitTtl") ?? 604800;
    this.categoryIndexTtl =
      config.get<number>("redis.categoryIndexTtl") ?? 86400;
  }

  async discover(query: DiscoveryQueryDTO): Promise<DiscoveryResponseDTO> {
    if (query.isRandom) {
      return this.discoverRandom(query.forceRefresh ?? false);
    }

    // Resolve categorySlug → categoryId if needed
    let categoryId = query.categoryId;
    if (!categoryId && query.categorySlug) {
      const cat = await this.prisma.category.findUnique({
        where: { slug: query.categorySlug },
      });
      if (!cat)
        throw new NotFoundException(
          `Category slug "${query.categorySlug}" not found.`,
        );
      categoryId = cat.id;
    }

    if (categoryId) {
      return this.discoverByCategory(categoryId, query.forceRefresh ?? false);
    }

    throw new NotFoundException(
      "Provide categoryId, categorySlug, or isRandom=true.",
    );
  }

  // ── "I'm Feeling Lucky" — random unplayed skit ───────────────────────────

  private async discoverRandom(
    forceRefresh: boolean,
  ): Promise<DiscoveryResponseDTO> {
    const cacheKey = `discovery:random`;

    if (!forceRefresh) {
      const cached = await this.cache.get<DiscoveryResponseDTO>(cacheKey);
      if (cached) {
        this.logger.debug("Random skit served from cache");
        return { ...cached, fromCache: true };
      }
    }

    const skit = await this.prisma.skit.findFirst({
      where: {
        generationStatus: "COMPLETE",
        played: false,
        isRetracted: false,
      },
      orderBy: { reliabilityScore: "desc" },
      include: {
        research: { select: { title: true } },
        category: { select: { slug: true } },
      },
    });

    if (!skit) {
      this.logger.warn("No unplayed skits available for random discovery");
      throw new ServiceUnavailableException(
        "No unplayed skits available yet. The pipeline is warming up — check back shortly.",
      );
    }

    const response = this.mapToResponse(skit, false);
    await this.cache.set(cacheKey, response, this.skitTtl * 1000);
    return response;
  }

  // ── Category-targeted discovery ──────────────────────────────────────────

  private async discoverByCategory(
    categoryId: string,
    forceRefresh: boolean,
  ): Promise<DiscoveryResponseDTO> {
    const cacheKey = `discovery:category:${categoryId}`;

    if (!forceRefresh) {
      const cached = await this.cache.get<DiscoveryResponseDTO>(cacheKey);
      if (cached) {
        this.logger.debug(`Category skit served from cache (${categoryId})`);
        return { ...cached, fromCache: true };
      }
    }

    // Check if category has unplayed skits in DB
    const skit = await this.prisma.skit.findFirst({
      where: {
        categoryId,
        generationStatus: "COMPLETE",
        played: false,
        isRetracted: false,
      },
      orderBy: { reliabilityScore: "desc" },
      include: {
        research: { select: { title: true } },
        category: { select: { slug: true, name: true } },
      },
    });

    if (!skit) {
      // No cached skit — trigger harvest pipeline for this category
      this.logger.log(
        `No skits for category ${categoryId} — triggering curator`,
      );
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category)
        throw new NotFoundException(`Category ${categoryId} not found.`);

      // Fire and forget — respond that generation is in progress
      this.skitService
        .harvestAndGenerate({ query: category.name, categoryId })
        .catch((err) =>
          this.logger.error(`Background harvest failed: ${err.message}`),
        );

      throw new ServiceUnavailableException(
        `No skits available for "${category.name}" yet. We're generating fresh ones — check back in ~30 seconds.`,
      );
    }

    const response = this.mapToResponse(skit, false);
    await this.cache.set(cacheKey, response, this.categoryIndexTtl * 1000);
    return response;
  }

  // ── Invalidate category cache (called after new skits are generated) ─────

  async invalidateCategoryCache(categoryId: string): Promise<void> {
    await Promise.all([
      this.cache.del(`discovery:category:${categoryId}`),
      this.cache.del(`discovery:random`),
    ]);
    this.logger.log(`Cache invalidated for category ${categoryId}`);
  }

  // ── Mapping ──────────────────────────────────────────────────────────────

  private mapToResponse(
    skit: {
      id: string;
      fullScript: string;
      coverArtUrl: string | null;
      voiceoverUrl: string | null;
      reliabilityScore: number;
      sciFiFactRating: number;
      isRetracted: boolean;
      research: { title: string };
      category: { slug: string };
    },
    fromCache: boolean,
  ): DiscoveryResponseDTO {
    return {
      skitId: skit.id,
      fromCache,
      categorySlug: skit.category.slug,
      paperTitle: skit.research.title,
      fullScript: skit.fullScript,
      coverArtUrl: skit.coverArtUrl,
      voiceoverUrl: skit.voiceoverUrl,
      reliabilityScore: skit.reliabilityScore,
      sciFiFactRating: skit.sciFiFactRating,
      isRetracted: skit.isRetracted,
    };
  }
}

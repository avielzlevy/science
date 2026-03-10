import { Injectable, Logger } from '@nestjs/common';
import { SemanticScholarAdapter } from './adapters/semantic-scholar.adapter';
import { NatureAdapter } from './adapters/nature.adapter';
import { IEEEAdapter } from './adapters/ieee.adapter';
import { RawResearchDTO } from './dto/raw-research.dto';

export interface HarvestOptions {
  query: string;
  limitPerSource?: number;
}

@Injectable()
export class CuratorService {
  private readonly logger = new Logger(CuratorService.name);

  constructor(
    private readonly semanticScholar: SemanticScholarAdapter,
    private readonly nature: NatureAdapter,
    private readonly ieee: IEEEAdapter,
  ) {}

  /**
   * Concurrently harvests from all three academic sources.
   * Sources that fail are logged and excluded — pipeline never halts on a
   * single adapter failure.
   */
  async harvest(options: HarvestOptions): Promise<RawResearchDTO[]> {
    const { query, limitPerSource = 5 } = options;

    this.logger.log(`Harvesting "${query}" from all 3 sources (limit: ${limitPerSource} each)`);

    const [ssResult, natureResult, ieeeResult] = await Promise.allSettled([
      this.semanticScholar.fetchByCategory(query, limitPerSource),
      this.nature.fetchByCategory(query, limitPerSource),
      this.ieee.fetchByCategory(query, limitPerSource),
    ]);

    const results: RawResearchDTO[] = [];

    if (ssResult.status === 'fulfilled') {
      results.push(...ssResult.value);
      this.logger.log(`Semantic Scholar: ${ssResult.value.length} papers`);
    } else {
      this.logger.warn(`Semantic Scholar failed: ${ssResult.reason}`);
    }

    if (natureResult.status === 'fulfilled') {
      results.push(...natureResult.value);
      this.logger.log(`Nature: ${natureResult.value.length} papers`);
    } else {
      this.logger.warn(`Nature failed: ${natureResult.reason}`);
    }

    if (ieeeResult.status === 'fulfilled') {
      results.push(...ieeeResult.value);
      this.logger.log(`IEEE: ${ieeeResult.value.length} papers`);
    } else {
      this.logger.warn(`IEEE failed: ${ieeeResult.reason}`);
    }

    if (results.length === 0) {
      throw new Error(`All academic sources failed for query: "${query}"`);
    }

    // De-duplicate by DOI when available
    const seen = new Set<string>();
    return results.filter((r) => {
      const key = r.doi ?? r.externalId;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

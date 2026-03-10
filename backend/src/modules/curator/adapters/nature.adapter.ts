import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { RawResearchDTO, validateRawResearch } from '../dto/raw-research.dto';

interface NatureRecord {
  identifier: string;
  title: string;
  abstract: string;
  publicationName: string;
  doi: string;
  publicationDate: string;
  creators: Array<{ creator: string }>;
  citingArticleCount?: string;
  impactFactor?: string;
}

interface NatureResponse {
  records: NatureRecord[];
  result: { total: string; start: string; pageLength: string };
}

@Injectable()
export class NatureAdapter {
  private readonly logger = new Logger(NatureAdapter.name);
  private readonly http: AxiosInstance;
  private readonly fiveYearsAgo: string;

  constructor(private readonly config: ConfigService) {
    const baseURL = config.get<string>('academic.nature.baseUrl');
    const apiKey = config.get<string>('academic.nature.apiKey');

    this.http = axios.create({
      baseURL,
      timeout: 12_000,
      headers: { 'X-SpringerNature-API-Key': apiKey },
    });

    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 5);
    this.fiveYearsAgo = cutoff.toISOString().split('T')[0];
  }

  async fetchByCategory(subject: string, limit = 10): Promise<RawResearchDTO[]> {
    const { data } = await this.http.get<NatureResponse>('', {
      params: {
        q: subject,
        p: limit * 2,
        s: 1,
        'date-facet-mode': 'between',
        'date-facet-from': this.fiveYearsAgo,
        'date-facet-to': new Date().toISOString().split('T')[0],
      },
    });

    return (data.records ?? [])
      .filter(this.isEligible)
      .slice(0, limit)
      .map(this.mapRecord.bind(this));
  }

  private isEligible(record: NatureRecord): boolean {
    return !!record.abstract && record.abstract.split(' ').length >= 200;
  }

  private mapRecord(record: NatureRecord): RawResearchDTO {
    return validateRawResearch({
      externalId: `nature_${record.identifier}`,
      source: 'NATURE',
      title: record.title,
      abstract: record.abstract,
      doi: record.doi ?? null,
      publishedAt: new Date(record.publicationDate),
      journalName: record.publicationName ?? null,
      citationCount: record.citingArticleCount ? parseInt(record.citingArticleCount, 10) : 0,
      journalImpact: record.impactFactor ? parseFloat(record.impactFactor) : null,
      authors: (record.creators ?? []).map((c) => ({
        name: c.creator,
        affiliations: [],
      })),
      rawJson: record as unknown as Record<string, unknown>,
    });
  }
}

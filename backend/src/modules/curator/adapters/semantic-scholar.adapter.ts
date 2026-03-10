import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { RawResearchDTO, validateRawResearch } from '../dto/raw-research.dto';

interface SSPaper {
  paperId: string;
  title: string;
  abstract: string | null;
  year: number;
  publicationDate: string | null;
  venue: string | null;
  journal: { name: string; volume: string; pages: string } | null;
  citationCount: number;
  externalIds: Record<string, string>;
  authors: Array<{ authorId: string; name: string }>;
}

interface SSResponse {
  data: SSPaper[];
  next?: number;
  total: number;
}

const FIELDS =
  'paperId,title,abstract,year,publicationDate,venue,journal,citationCount,externalIds,authors';

@Injectable()
export class SemanticScholarAdapter {
  private readonly logger = new Logger(SemanticScholarAdapter.name);
  private readonly http: AxiosInstance;
  private readonly fiveYearsAgo: number;

  constructor(private readonly config: ConfigService) {
    const baseURL = config.get<string>('academic.semanticScholar.baseUrl');
    const apiKey = config.get<string>('academic.semanticScholar.apiKey');

    this.http = axios.create({
      baseURL,
      timeout: 12_000,
      headers: apiKey ? { 'x-api-key': apiKey } : {},
    });

    this.fiveYearsAgo = new Date().getFullYear() - 5;
  }

  async fetchByCategory(query: string, limit = 10): Promise<RawResearchDTO[]> {
    const { data } = await this.http.get<SSResponse>('/paper/search', {
      params: {
        query,
        fields: FIELDS,
        limit: limit * 2,  // over-fetch to account for filtering
        year: `${this.fiveYearsAgo}-`,
      },
    });

    return data.data
      .filter(this.isEligible)
      .slice(0, limit)
      .map(this.mapPaper.bind(this));
  }

  private isEligible(paper: SSPaper): boolean {
    if (!paper.abstract || paper.abstract.split(' ').length < 200) return false;
    const year = paper.year ?? 0;
    return year >= new Date().getFullYear() - 5;
  }

  private mapPaper(paper: SSPaper): RawResearchDTO {
    const publishedAt = paper.publicationDate
      ? new Date(paper.publicationDate)
      : new Date(`${paper.year}-01-01`);

    return validateRawResearch({
      externalId: `ss_${paper.paperId}`,
      source: 'SEMANTIC_SCHOLAR',
      title: paper.title,
      abstract: paper.abstract ?? '',
      doi: paper.externalIds?.['DOI'] ?? null,
      publishedAt,
      journalName: paper.journal?.name ?? paper.venue ?? null,
      citationCount: paper.citationCount ?? 0,
      journalImpact: null,
      authors: paper.authors.map((a) => ({ name: a.name, affiliations: [] })),
      rawJson: paper as unknown as Record<string, unknown>,
    });
  }
}

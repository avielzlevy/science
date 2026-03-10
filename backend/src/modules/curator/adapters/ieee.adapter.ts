import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { RawResearchDTO, validateRawResearch } from '../dto/raw-research.dto';

interface IEEEArticle {
  article_number: string;
  title: string;
  abstract: string;
  publication_title: string;
  doi: string;
  publication_date: string;
  citing_paper_count: number;
  impact_factor?: number;
  authors: {
    authors: Array<{ full_name: string; affiliation?: string }>;
  };
}

interface IEEEResponse {
  articles: IEEEArticle[];
  total_records: number;
}

@Injectable()
export class IEEEAdapter {
  private readonly logger = new Logger(IEEEAdapter.name);
  private readonly http: AxiosInstance;
  private readonly fiveYearsAgo: number;

  constructor(private readonly config: ConfigService) {
    const baseURL = config.get<string>('academic.ieee.baseUrl');
    const apiKey = config.get<string>('academic.ieee.apiKey');

    this.http = axios.create({
      baseURL,
      timeout: 12_000,
      params: { apikey: apiKey, format: 'json' },
    });

    this.fiveYearsAgo = new Date().getFullYear() - 5;
  }

  async fetchByCategory(query: string, limit = 10): Promise<RawResearchDTO[]> {
    const { data } = await this.http.get<IEEEResponse>('', {
      params: {
        querytext: query,
        max_records: limit * 2,
        start_year: this.fiveYearsAgo,
        sort_order: 'desc',
        sort_field: 'article_number',
      },
    });

    return (data.articles ?? [])
      .filter(this.isEligible)
      .slice(0, limit)
      .map(this.mapArticle.bind(this));
  }

  private isEligible(article: IEEEArticle): boolean {
    if (!article.abstract || article.abstract.split(' ').length < 200) return false;
    const year = new Date(article.publication_date).getFullYear();
    return year >= new Date().getFullYear() - 5;
  }

  private mapArticle(article: IEEEArticle): RawResearchDTO {
    return validateRawResearch({
      externalId: `ieee_${article.article_number}`,
      source: 'IEEE',
      title: article.title,
      abstract: article.abstract,
      doi: article.doi ?? null,
      publishedAt: new Date(article.publication_date),
      journalName: article.publication_title ?? null,
      citationCount: article.citing_paper_count ?? 0,
      journalImpact: article.impact_factor ?? null,
      authors: (article.authors?.authors ?? []).map((a) => ({
        name: a.full_name,
        affiliations: a.affiliation ? [a.affiliation] : [],
      })),
      rawJson: article as unknown as Record<string, unknown>,
    });
  }
}

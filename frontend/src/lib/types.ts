// ── Types matching the backend DTOs ─────────────────────────────────────────

export interface DiscoveryResponse {
  skitId: string;
  fromCache: boolean;
  categorySlug: string;
  paperTitle: string;
  fullScript: string;
  coverArtUrl: string | null;
  voiceoverUrl: string | null;
  reliabilityScore: number;
  sciFiFactRating: number;
  isRetracted: boolean;
}

export interface SkitDetail {
  id: string;
  researchId: string;
  categoryId: string;
  worldBefore: string;
  breakthrough: string;
  newReality: string;
  fullScript: string;
  visualPrompt: string;
  coverArtUrl: string | null;
  voiceoverUrl: string | null;
  sciFiFactRating: number;
  reliabilityScore: number;
  isRetracted: boolean;
  generationStatus: string;
  research?: {
    title: string;
    authors?: { name: string }[];
  };
  category?: {
    name: string;
    slug: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

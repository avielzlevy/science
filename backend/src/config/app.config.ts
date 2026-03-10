import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  internalApiKey: process.env.INTERNAL_API_KEY ?? '',
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD ?? undefined,
  skitTtl: parseInt(process.env.REDIS_SKIT_TTL ?? '604800', 10),       // 7 days
  categoryIndexTtl: parseInt(process.env.REDIS_CATEGORY_INDEX_TTL ?? '86400', 10), // 1 day
}));

export const aiConfig = registerAs('ai', () => ({
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: process.env.OPENAI_MODEL ?? 'gpt-4o',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE ?? '0.7'),
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
    model: process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-6',
  },
  imageGen: {
    provider: process.env.IMAGE_GEN_PROVIDER ?? 'dalle',
    model: process.env.IMAGE_GEN_MODEL ?? 'dall-e-3',
    size: process.env.IMAGE_GEN_SIZE ?? '1792x1024',
  },
  tts: {
    provider: process.env.TTS_PROVIDER ?? 'openai',
    model: process.env.TTS_MODEL ?? 'tts-1-hd',
    voice: process.env.TTS_VOICE ?? 'onyx',
  },
}));

export const academicConfig = registerAs('academic', () => ({
  semanticScholar: {
    apiKey: process.env.SEMANTIC_SCHOLAR_API_KEY ?? '',
    baseUrl: process.env.SEMANTIC_SCHOLAR_BASE_URL ?? 'https://api.semanticscholar.org/graph/v1',
  },
  nature: {
    apiKey: process.env.NATURE_API_KEY ?? '',
    baseUrl: process.env.NATURE_BASE_URL ?? 'https://api.springernature.com/openaccess/json',
  },
  ieee: {
    apiKey: process.env.IEEE_API_KEY ?? '',
    baseUrl: process.env.IEEE_BASE_URL ?? 'https://ieeexploreapi.ieee.org/api/v1/search/articles',
  },
}));

export const throttleConfig = registerAs('throttle', () => ({
  ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
  limit: parseInt(process.env.THROTTLE_LIMIT ?? '30', 10),
}));

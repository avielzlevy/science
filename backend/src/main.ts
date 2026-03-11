import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const apiPrefix = process.env.API_PREFIX ?? 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // ── Strict validation — reject unknown fields, whitelist DTOs ──────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── OpenAPI / Swagger ─────────────────────────────────────────────────
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('ResearchReels API')
      .setDescription(
        'ResearchReels — converting scientific breakthroughs into cinematic micro-content.\n\n' +
        '**Narrative Engine:** Preset B — "The Visionary" (Cinematic Sci-Fi, temp 0.7)\n\n' +
        '**Academic Sources:** Semantic Scholar · Nature · IEEE Xplore\n\n' +
        '**Caching:** Redis · 7-day skit TTL · 1-day category index\n\n' +
        'All endpoints require the `x-api-key` header.',
      )
      .setVersion('1.0')
      .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
      .addTag('Discovery', 'Input funnel — dice rolls and category selection')
      .addTag('Skits', 'Skit generation, retrieval, and playback management')
      .addTag('Categories', 'Scientific category listing')
      .build(),
  );

  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ── CORS — allow frontend origin ─────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type', 'x-api-key'],
  });

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);

  console.log(`\n🎬 ResearchReels API running at http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/${apiPrefix}/docs\n`);
}

bootstrap().catch(console.error);

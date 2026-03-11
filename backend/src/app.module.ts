import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { ThrottlerModule } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { APP_GUARD, APP_FILTER } from "@nestjs/core";
import { createClient } from "redis";
import { redisStore } from "cache-manager-redis-yet";

import {
  appConfig,
  redisConfig,
  aiConfig,
  academicConfig,
  throttleConfig,
} from "./config/app.config";

import { PrismaModule } from "./prisma/prisma.module";
import { CuratorModule } from "./modules/curator/curator.module";
import { SkitModule } from "./modules/skit/skit.module";
import { DiscoveryModule } from "./modules/discovery/discovery.module";
import { TrustMatrixModule } from "./modules/trust-matrix/trust-matrix.module";
import { CategoryModule } from "./modules/category/category.module";

import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { ApiKeyGuard } from "./common/guards/api-key.guard";

@Module({
  imports: [
    // ── Configuration ─────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, redisConfig, aiConfig, academicConfig, throttleConfig],
    }),

    // ── Redis Cache — 7-day default TTL for skits ─────────────────────────
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: process.env.REDIS_HOST ?? "localhost",
            port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
          },
          password: process.env.REDIS_PASSWORD ?? undefined,
          // Default TTL: 7 days (overridden per-call in DiscoveryService)
          ttl: parseInt(process.env.REDIS_SKIT_TTL ?? "604800", 10) * 1000,
        });
        return { store };
      },
    }),

    // ── Rate Limiting ─────────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.THROTTLE_TTL ?? "60000", 10),
            limit: parseInt(process.env.THROTTLE_LIMIT ?? "30", 10),
          },
        ],
      }),
    }),

    // ── Cron Jobs ─────────────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ── Domain Modules ────────────────────────────────────────────────────
    PrismaModule,
    CuratorModule,
    SkitModule,
    DiscoveryModule,
    TrustMatrixModule,
    CategoryModule,
  ],
  providers: [
    // Global exception filter — clean AI error messages to frontend
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    // Global API key guard — all routes protected unless @Public()
    { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
})
export class AppModule {}

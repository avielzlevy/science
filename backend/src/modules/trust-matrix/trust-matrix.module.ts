import { Module } from '@nestjs/common';
import { TrustMatrixCron } from './trust-matrix.cron';
import { PrismaModule } from '../../prisma/prisma.module';
import { SkitModule } from '../skit/skit.module';

@Module({
  imports: [PrismaModule, SkitModule],
  providers: [TrustMatrixCron],
})
export class TrustMatrixModule {}

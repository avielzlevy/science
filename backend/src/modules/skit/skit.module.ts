import { Module } from '@nestjs/common';
import { SkitController } from './skit.controller';
import { SkitService } from './skit.service';
import { SkitGeneratorService } from './skit-generator.service';
import { CuratorModule } from '../curator/curator.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, CuratorModule],
  controllers: [SkitController],
  providers: [SkitService, SkitGeneratorService],
  exports: [SkitService],
})
export class SkitModule {}

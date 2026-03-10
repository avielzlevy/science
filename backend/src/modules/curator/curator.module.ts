import { Module } from '@nestjs/common';
import { CuratorService } from './curator.service';
import { SemanticScholarAdapter } from './adapters/semantic-scholar.adapter';
import { NatureAdapter } from './adapters/nature.adapter';
import { IEEEAdapter } from './adapters/ieee.adapter';

@Module({
  providers: [CuratorService, SemanticScholarAdapter, NatureAdapter, IEEEAdapter],
  exports: [CuratorService],
})
export class CuratorModule {}

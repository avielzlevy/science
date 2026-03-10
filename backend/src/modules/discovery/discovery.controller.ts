import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { DiscoveryService } from './discovery.service';
import { DiscoveryQueryDTO } from './dto/discovery-query.dto';
import { DiscoveryResponseDTO } from './dto/discovery-response.dto';

@ApiTags('Discovery')
@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  /**
   * GET /discovery
   *
   * The "Input Funnel" — unified entry point for all skit discovery flows.
   *
   * - ?isRandom=true      → "I'm Feeling Lucky" — returns a random unplayed skit
   * - ?categoryId=<uuid>  → Returns the best unplayed skit for a category
   * - ?forceRefresh=true  → Bypass Redis cache (triggers re-harvest if needed)
   */
  @Get()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Discover a skit',
    description:
      'The primary discovery endpoint. Pass `isRandom=true` for "I\'m Feeling Lucky" ' +
      'behaviour, or `categoryId` for targeted category discovery. ' +
      'Results are Redis-cached for 7 days (category index: 1 day).',
  })
  @ApiQuery({ name: 'categoryId', required: false, type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'isRandom', required: false, type: 'boolean', example: false })
  @ApiQuery({ name: 'forceRefresh', required: false, type: 'boolean', example: false })
  @ApiResponse({
    status: 200,
    description: 'A skit ready for playback',
    type: DiscoveryResponseDTO,
  })
  @ApiResponse({
    status: 503,
    description: 'No skits available yet — pipeline is warming up',
  })
  async discover(@Query() query: DiscoveryQueryDTO): Promise<DiscoveryResponseDTO> {
    return this.discoveryService.discover(query);
  }
}

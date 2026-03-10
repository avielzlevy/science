import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SkitService } from './skit.service';
import { GenerateSkitByQueryDTO } from './dto/generate-skit.dto';
import { SkitDTO } from './dto/skit.dto';

@ApiTags('Skits')
@ApiBearerAuth('x-api-key')
@Controller('skits')
export class SkitController {
  constructor(private readonly skitService: SkitService) {}

  /**
   * POST /skits/generate
   * Triggers the full Harvest → Generate pipeline for a given query.
   * Returns an array of newly generated SkitDTOs (one per harvested paper).
   */
  @Post('generate')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Harvest papers and generate skits',
    description:
      'Concurrently queries Semantic Scholar, Nature, and IEEE Xplore, then runs the ' +
      '"The Visionary" Preset B pipeline to generate LLM scripts, cover art, and voiceovers.',
  })
  @ApiResponse({ status: 202, description: 'Skit generation initiated — returns generated skits', type: [SkitDTO] })
  async generate(@Body() dto: GenerateSkitByQueryDTO) {
    return this.skitService.harvestAndGenerate(dto);
  }

  /**
   * GET /skits/:id
   * Fetches a single skit by UUID, including research metadata.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a skit by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: SkitDTO })
  @ApiResponse({ status: 404, description: 'Skit not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.skitService.findById(id);
  }

  /**
   * GET /skits?categoryId=&limit=&offset=
   * List complete, non-retracted skits by category, sorted by reliability score.
   */
  @Get()
  @ApiOperation({ summary: 'List skits by category' })
  @ApiQuery({ name: 'categoryId', required: true, type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: 'number', example: 0 })
  @ApiResponse({ status: 200, type: [SkitDTO] })
  async findByCategory(
    @Query('categoryId', ParseUUIDPipe) categoryId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.skitService.findByCategory(categoryId, limit, offset);
  }

  /**
   * PATCH /skits/:id/played
   * Marks a skit as played and increments its play count.
   */
  @Patch(':id/played')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark a skit as played' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204 })
  async markPlayed(@Param('id', ParseUUIDPipe) id: string) {
    await this.skitService.markPlayed(id);
  }
}

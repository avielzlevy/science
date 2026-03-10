import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class GenerateSkitDTO {
  @ApiProperty({ description: 'UUID of an existing Research record to generate a skit from' })
  @IsUUID()
  researchId!: string;

  @ApiProperty({ description: 'UUID of the category to assign this skit to' })
  @IsUUID()
  categoryId!: string;
}

export class GenerateSkitByQueryDTO {
  @ApiProperty({ description: 'Natural language query sent to all three academic APIs' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  query!: string;

  @ApiProperty({ description: 'UUID of the category to assign generated skits to' })
  @IsUUID()
  categoryId!: string;
}

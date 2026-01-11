import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
    minimum: 10,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;
}

export class SearchQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Free-text search term (endpoint-specific)',
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  search?: string;
}

export class SortQueryDto {
  @ApiPropertyOptional({
    description:
      'Sort field/column name (endpoint-specific). Prefer whitelisting server-side.',
    example: 'created_at',
  })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_.]*$/)
  sort_by?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.ASC,
    example: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sort_order: SortOrder = SortOrder.ASC;
}

export class ListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Free-text search term (endpoint-specific)',
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort field/column (endpoint-specific)',
    example: 'created_at',
  })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_.]*$/)
  sort_by?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sort_order: SortOrder = SortOrder.ASC;

  @ApiPropertyOptional({
    description:
      'Generic filters as JSON string. Endpoint decides what keys are allowed.',
  })
  @IsOptional()
  @IsString()
  @Length(2, 2000)
  filters?: string;
}

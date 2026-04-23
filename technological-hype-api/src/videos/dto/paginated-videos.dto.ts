import { ApiProperty } from '@nestjs/swagger';
import { VideoDto } from './video.dto';

export class PaginationMetadataDto {
  @ApiProperty({
    description: 'Total de items que matchean el filtro.',
    example: 37,
  })
  total: number;

  @ApiProperty({ description: 'Página actual (1-indexed).', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items por página.', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total de páginas disponibles.', example: 4 })
  totalPages: number;
}

export class PaginatedVideosDto {
  @ApiProperty({ type: VideoDto, isArray: true })
  data: VideoDto[];

  @ApiProperty({ type: PaginationMetadataDto })
  metadata: PaginationMetadataDto;
}

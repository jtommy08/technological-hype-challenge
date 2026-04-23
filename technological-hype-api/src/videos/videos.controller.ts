import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedVideosDto } from './dto/paginated-videos.dto';
import {
  SortOrder,
  VIDEOS_QUERY_DEFAULTS,
  VideoSortBy,
  VideosQuery,
} from './dto/videos-query.dto';
import { VideosService } from './videos.service';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  @ApiOperation({
    summary: 'Cartelera de Hype Tecnológico',
    description:
      'Devuelve los videos normalizados con Nivel de Hype calculado. ' +
      'La Joya de la Corona se elige sobre el dataset completo (antes de filtrar/paginar).',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Texto libre. Matchea contra título o autor (case-insensitive).',
    example: 'tutorial',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: VideoSortBy,
    description: 'Campo de ordenamiento.',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: SortOrder,
    description: 'Dirección del ordenamiento.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    schema: { type: 'integer', minimum: 1, default: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: {
      type: 'integer',
      minimum: 1,
      maximum: VIDEOS_QUERY_DEFAULTS.maxLimit,
      default: VIDEOS_QUERY_DEFAULTS.limit,
    },
  })
  @ApiOkResponse({ type: PaginatedVideosDto })
  findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedVideosDto> {
    const query = this.buildQuery({ search, sortBy, order, page, limit });
    return this.videosService.findAll(query);
  }

  private buildQuery(raw: {
    search?: string;
    sortBy?: string;
    order?: string;
    page?: string;
    limit?: string;
  }): VideosQuery {
    const sortBy = this.parseEnum(
      raw.sortBy,
      VideoSortBy,
      VIDEOS_QUERY_DEFAULTS.sortBy,
      'sortBy',
    );
    const order = this.parseEnum(
      raw.order,
      SortOrder,
      VIDEOS_QUERY_DEFAULTS.order,
      'order',
    );
    const page = this.parseInt(
      raw.page,
      VIDEOS_QUERY_DEFAULTS.page,
      1,
      Number.MAX_SAFE_INTEGER,
      'page',
    );
    const limit = this.parseInt(
      raw.limit,
      VIDEOS_QUERY_DEFAULTS.limit,
      1,
      VIDEOS_QUERY_DEFAULTS.maxLimit,
      'limit',
    );
    return { search: raw.search, sortBy, order, page, limit };
  }

  private parseEnum<T extends Record<string, string>>(
    value: string | undefined,
    enumObj: T,
    fallback: T[keyof T],
    paramName: string,
  ): T[keyof T] {
    if (value === undefined || value === '') return fallback;
    const allowed = Object.values(enumObj);
    if (!allowed.includes(value)) {
      throw new BadRequestException(
        `Parámetro "${paramName}" inválido. Valores permitidos: ${allowed.join(', ')}.`,
      );
    }
    return value as T[keyof T];
  }

  private parseInt(
    value: string | undefined,
    fallback: number,
    min: number,
    max: number,
    paramName: string,
  ): number {
    if (value === undefined || value === '') return fallback;
    const n = Number(value);
    if (!Number.isInteger(n) || n < min || n > max) {
      throw new BadRequestException(
        `Parámetro "${paramName}" debe ser un entero entre ${min} y ${max}.`,
      );
    }
    return n;
  }
}

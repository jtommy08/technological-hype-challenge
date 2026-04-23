import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PaginatedVideosDto } from './dto/paginated-videos.dto';
import {
  SortOrder,
  VIDEOS_QUERY_DEFAULTS,
  VideoSortBy,
  VideosQuery,
} from './dto/videos-query.dto';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';

describe('VideosController', () => {
  let controller: VideosController;
  let findAll: jest.Mock<Promise<PaginatedVideosDto>, [VideosQuery]>;

  beforeEach(async () => {
    findAll = jest.fn().mockResolvedValue({
      data: [],
      metadata: { total: 0, page: 1, limit: 10, totalPages: 1 },
    });

    const moduleRef = await Test.createTestingModule({
      controllers: [VideosController],
      providers: [{ provide: VideosService, useValue: { findAll } }],
    }).compile();

    controller = moduleRef.get(VideosController);
  });

  it('applies defaults when no query params are passed', async () => {
    await controller.findAll();
    expect(findAll).toHaveBeenCalledWith({
      search: undefined,
      sortBy: VIDEOS_QUERY_DEFAULTS.sortBy,
      order: VIDEOS_QUERY_DEFAULTS.order,
      page: VIDEOS_QUERY_DEFAULTS.page,
      limit: VIDEOS_QUERY_DEFAULTS.limit,
    });
  });

  it('forwards parsed params correctly', async () => {
    await controller.findAll('tutorial', 'title', 'asc', '2', '5');
    expect(findAll).toHaveBeenCalledWith({
      search: 'tutorial',
      sortBy: VideoSortBy.TITLE,
      order: SortOrder.ASC,
      page: 2,
      limit: 5,
    });
  });

  it('throws BadRequest for unknown sortBy value', () => {
    expect(() => controller.findAll(undefined, 'bogus')).toThrow(
      BadRequestException,
    );
  });

  it('throws BadRequest for unknown order value', () => {
    expect(() =>
      controller.findAll(undefined, undefined, 'sideways'),
    ).toThrow(BadRequestException);
  });

  it('throws BadRequest when page is not a positive integer', () => {
    expect(() =>
      controller.findAll(undefined, undefined, undefined, '0'),
    ).toThrow(BadRequestException);
    expect(() =>
      controller.findAll(undefined, undefined, undefined, '1.5'),
    ).toThrow(BadRequestException);
    expect(() =>
      controller.findAll(undefined, undefined, undefined, 'abc'),
    ).toThrow(BadRequestException);
  });

  it('throws BadRequest when limit exceeds the cap', () => {
    expect(() =>
      controller.findAll(
        undefined,
        undefined,
        undefined,
        undefined,
        String(VIDEOS_QUERY_DEFAULTS.maxLimit + 1),
      ),
    ).toThrow(BadRequestException);
  });
});

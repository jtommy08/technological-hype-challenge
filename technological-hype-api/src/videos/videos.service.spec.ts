import { Test } from '@nestjs/testing';
import {
  SortOrder,
  VIDEOS_QUERY_DEFAULTS,
  VideoSortBy,
  VideosQuery,
} from './dto/videos-query.dto';
import { YoutubeVideoItem } from './interfaces/youtube-payload.interface';
import { VideosService } from './videos.service';

const buildItem = (
  id: string,
  title: string,
  author: string,
  publishedAt: string,
  views: number,
  likes: number,
  comments?: number,
): YoutubeVideoItem => {
  const item: YoutubeVideoItem = {
    id,
    snippet: {
      title,
      channelTitle: author,
      publishedAt,
      thumbnails: { high: { url: `https://thumb/${id}.jpg` } },
    },
    statistics: {
      viewCount: String(views),
      likeCount: String(likes),
    },
  };
  if (comments !== undefined) {
    item.statistics.commentCount = String(comments);
  }
  return item;
};

const DATASET: YoutubeVideoItem[] = [
  // Baseline, mid-hype
  buildItem('a', 'NestJS básico', 'Fazt', '2026-04-01T00:00:00Z', 1000, 100, 50),
  // Crown jewel: Tutorial keyword doubles an already strong ratio
  buildItem(
    'b',
    'Tutorial de TypeScript',
    'midudev',
    '2026-03-15T00:00:00Z',
    1000,
    300,
    200,
  ),
  // Disabled comments → hype = 0
  buildItem('c', 'Node internals', 'CodelyTV', '2026-02-10T00:00:00Z', 1000, 900),
  // Another filterable candidate
  buildItem('d', 'AWS para devs', 'Platzi', '2025-12-01T00:00:00Z', 2000, 40, 10),
];

const buildQuery = (overrides: Partial<VideosQuery> = {}): VideosQuery => ({
  sortBy: VIDEOS_QUERY_DEFAULTS.sortBy,
  order: VIDEOS_QUERY_DEFAULTS.order,
  page: VIDEOS_QUERY_DEFAULTS.page,
  limit: VIDEOS_QUERY_DEFAULTS.limit,
  ...overrides,
});

describe('VideosService', () => {
  let service: VideosService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [VideosService],
    }).compile();
    service = moduleRef.get(VideosService);

    // Stub the file loader so tests are hermetic
    jest
      .spyOn(service as unknown as { loadItems: () => Promise<YoutubeVideoItem[]> }, 'loadItems')
      .mockResolvedValue(DATASET);
  });

  describe('crown jewel', () => {
    it('marks the video with the highest hype over the full dataset', async () => {
      const { data } = await service.findAll(buildQuery());
      const crown = data.find((v) => v.isCrownJewel);
      expect(crown).toBeDefined();
      expect(crown!.id).toBe('b');
    });

    it('leaves no crown jewel in data when filter hides it', async () => {
      const { data, metadata } = await service.findAll(
        buildQuery({ search: 'aws' }),
      );
      expect(metadata.total).toBe(1);
      expect(data.every((v) => v.isCrownJewel === false)).toBe(true);
    });
  });

  describe('filter', () => {
    it('matches title case-insensitively', async () => {
      const { data, metadata } = await service.findAll(
        buildQuery({ search: 'nestjs' }),
      );
      expect(metadata.total).toBe(1);
      expect(data[0].id).toBe('a');
    });

    it('matches author case-insensitively', async () => {
      const { data, metadata } = await service.findAll(
        buildQuery({ search: 'MIDU' }),
      );
      expect(metadata.total).toBe(1);
      expect(data[0].id).toBe('b');
    });

    it('returns full dataset when search is empty/whitespace', async () => {
      const { metadata } = await service.findAll(
        buildQuery({ search: '   ' }),
      );
      expect(metadata.total).toBe(DATASET.length);
    });
  });

  describe('sort', () => {
    it('sorts by hype desc by default', async () => {
      const { data } = await service.findAll(buildQuery());
      const hypes = data.map((v) => v.hypeLevel);
      expect(hypes).toEqual([...hypes].sort((a, b) => b - a));
    });

    it('sorts by title asc', async () => {
      const { data } = await service.findAll(
        buildQuery({ sortBy: VideoSortBy.TITLE, order: SortOrder.ASC }),
      );
      const titles = data.map((v) => v.title);
      expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
    });

    it('sorts by publishedAt desc (newest first)', async () => {
      const { data } = await service.findAll(
        buildQuery({ sortBy: VideoSortBy.PUBLISHED, order: SortOrder.DESC }),
      );
      expect(data.map((v) => v.id)).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('pagination', () => {
    it('slices the sorted result and returns correct metadata', async () => {
      const { data, metadata } = await service.findAll(
        buildQuery({ limit: 2, page: 1 }),
      );
      expect(data).toHaveLength(2);
      expect(metadata).toEqual({
        total: 4,
        page: 1,
        limit: 2,
        totalPages: 2,
      });
    });

    it('clamps an out-of-range page to the last available page', async () => {
      const { metadata } = await service.findAll(
        buildQuery({ limit: 2, page: 99 }),
      );
      expect(metadata.page).toBe(2);
      expect(metadata.totalPages).toBe(2);
    });
  });
});

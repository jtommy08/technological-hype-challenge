import { YoutubeVideoItem } from '../interfaces/youtube-payload.interface';
import { calculateHype } from './hype-calculator.util';

type StatsOverrides = {
  viewCount?: string;
  likeCount?: string;
  commentCount?: string | null;
};

const buildItem = (
  title: string,
  stats: StatsOverrides = {},
): YoutubeVideoItem => {
  const item: YoutubeVideoItem = {
    id: 'vid_test',
    snippet: {
      title,
      channelTitle: 'Channel',
      publishedAt: '2026-01-01T00:00:00Z',
      thumbnails: { high: { url: 'https://example/x.jpg' } },
    },
    statistics: {
      viewCount: stats.viewCount ?? '1000',
      likeCount: stats.likeCount ?? '80',
    },
  };
  if (stats.commentCount !== null) {
    item.statistics.commentCount = stats.commentCount ?? '20';
  }
  return item;
};

describe('calculateHype', () => {
  it('applies the base formula (likes + comments) / views', () => {
    const item = buildItem('Some video', {
      viewCount: '1000',
      likeCount: '80',
      commentCount: '20',
    });
    expect(calculateHype(item)).toBeCloseTo(0.1);
  });

  it.each(['Tutorial de Nest', 'TUTORIAL', 'tutorial', 'tUtOriAl'])(
    'doubles the hype when title contains "%s"',
    (title) => {
      const item = buildItem(title, {
        viewCount: '1000',
        likeCount: '80',
        commentCount: '20',
      });
      expect(calculateHype(item)).toBeCloseTo(0.2);
    },
  );

  it('returns 0 when commentCount is missing (comments disabled)', () => {
    const item = buildItem('Some video', {
      viewCount: '1000',
      likeCount: '80',
      commentCount: null,
    });
    expect(calculateHype(item)).toBe(0);
  });

  it('disabled-comments rule wins even when title has "Tutorial"', () => {
    const item = buildItem('Tutorial de algo', {
      viewCount: '1000',
      likeCount: '500',
      commentCount: null,
    });
    expect(calculateHype(item)).toBe(0);
  });

  it('returns 0 when views are zero', () => {
    const item = buildItem('Some video', {
      viewCount: '0',
      likeCount: '0',
      commentCount: '0',
    });
    expect(calculateHype(item)).toBe(0);
  });
});

import { Injectable } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { PaginatedVideosDto } from './dto/paginated-videos.dto';
import { VideoDto } from './dto/video.dto';
import {
  SortOrder,
  VideoSortBy,
  VideosQuery,
} from './dto/videos-query.dto';
import {
  YoutubePayload,
  YoutubeVideoItem,
} from './interfaces/youtube-payload.interface';
import { calculateHype } from './utils/hype-calculator.util';
import { toRelativeSpanish } from './utils/relative-date.util';

const DATA_FILE = join(__dirname, 'data', 'videos.mock.json');

type EnrichedVideo = {
  item: YoutubeVideoItem;
  hypeLevel: number;
};

@Injectable()
export class VideosService {
  async findAll(query: VideosQuery): Promise<PaginatedVideosDto> {
    const items = await this.loadItems();
    const enriched = items.map((item) => ({
      item,
      hypeLevel: calculateHype(item),
    }));

    const crownJewelId = this.pickCrownJewelId(enriched);
    const filtered = this.applyFilter(enriched, query.search);
    const sorted = this.applySort(filtered, query.sortBy, query.order);

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / query.limit));
    const page = Math.min(query.page, totalPages);
    const offset = (page - 1) * query.limit;
    const slice = sorted.slice(offset, offset + query.limit);

    return {
      data: slice.map((e) => this.toDto(e, crownJewelId)),
      metadata: { total, page, limit: query.limit, totalPages },
    };
  }

  private async loadItems(): Promise<YoutubeVideoItem[]> {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const payload = JSON.parse(raw) as YoutubePayload;
    return payload.items;
  }

  private pickCrownJewelId(enriched: EnrichedVideo[]): string | null {
    let best: EnrichedVideo | null = null;
    for (const e of enriched) {
      if (e.hypeLevel <= 0) continue;
      if (best === null || e.hypeLevel > best.hypeLevel) best = e;
    }
    return best?.item.id ?? null;
  }

  private applyFilter(
    enriched: EnrichedVideo[],
    search?: string,
  ): EnrichedVideo[] {
    if (!search) return enriched;
    const needle = search.trim().toLowerCase();
    if (!needle) return enriched;
    return enriched.filter(({ item }) => {
      const title = item.snippet.title.toLowerCase();
      const author = item.snippet.channelTitle.toLowerCase();
      return title.includes(needle) || author.includes(needle);
    });
  }

  private applySort(
    enriched: EnrichedVideo[],
    sortBy: VideoSortBy,
    order: SortOrder,
  ): EnrichedVideo[] {
    const dir = order === SortOrder.ASC ? 1 : -1;
    const sorted = [...enriched].sort((a, b) => {
      switch (sortBy) {
        case VideoSortBy.HYPE:
          return (a.hypeLevel - b.hypeLevel) * dir;
        case VideoSortBy.PUBLISHED: {
          const ta = new Date(a.item.snippet.publishedAt).getTime();
          const tb = new Date(b.item.snippet.publishedAt).getTime();
          return (ta - tb) * dir;
        }
        case VideoSortBy.TITLE:
          return a.item.snippet.title.localeCompare(b.item.snippet.title) * dir;
        case VideoSortBy.AUTHOR:
          return (
            a.item.snippet.channelTitle.localeCompare(
              b.item.snippet.channelTitle,
            ) * dir
          );
      }
    });
    return sorted;
  }

  private toDto(
    { item, hypeLevel }: EnrichedVideo,
    crownJewelId: string | null,
  ): VideoDto {
    return {
      id: item.id,
      title: item.snippet.title,
      author: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedRelative: toRelativeSpanish(item.snippet.publishedAt),
      hypeLevel,
      isCrownJewel: item.id === crownJewelId,
    };
  }
}

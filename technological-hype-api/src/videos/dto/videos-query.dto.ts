export enum VideoSortBy {
  HYPE = 'hypeLevel',
  PUBLISHED = 'publishedAt',
  TITLE = 'title',
  AUTHOR = 'author',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface VideosQuery {
  search?: string;
  sortBy: VideoSortBy;
  order: SortOrder;
  page: number;
  limit: number;
}

export const VIDEOS_QUERY_DEFAULTS = {
  sortBy: VideoSortBy.HYPE,
  order: SortOrder.DESC,
  page: 1,
  limit: 10,
  maxLimit: 100,
} as const;

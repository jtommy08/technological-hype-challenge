export interface YoutubeThumbnail {
  url: string;
}

export interface YoutubeThumbnails {
  high: YoutubeThumbnail;
}

export interface YoutubeSnippet {
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: YoutubeThumbnails;
}

export interface YoutubeStatistics {
  viewCount: string;
  likeCount: string;
  commentCount?: string;
}

export interface YoutubeVideoItem {
  id: string;
  snippet: YoutubeSnippet;
  statistics: YoutubeStatistics;
}

export interface YoutubePayload {
  kind: string;
  items: YoutubeVideoItem[];
}

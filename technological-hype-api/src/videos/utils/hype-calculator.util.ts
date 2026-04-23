import { YoutubeVideoItem } from '../interfaces/youtube-payload.interface';

const TUTORIAL_MULTIPLIER = 2;
const TUTORIAL_KEYWORD = 'tutorial';

export function calculateHype(video: YoutubeVideoItem): number {
  const { statistics, snippet } = video;

  if (statistics.commentCount === undefined || statistics.commentCount === null) {
    return 0;
  }

  const views = Number(statistics.viewCount);
  const likes = Number(statistics.likeCount);
  const comments = Number(statistics.commentCount);

  if (!Number.isFinite(views) || views <= 0) {
    return 0;
  }

  let hype = (likes + comments) / views;

  if (snippet.title.toLowerCase().includes(TUTORIAL_KEYWORD)) {
    hype *= TUTORIAL_MULTIPLIER;
  }

  return hype;
}

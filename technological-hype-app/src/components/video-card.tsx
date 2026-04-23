import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Thumbnail } from "@/components/thumbnail"
import type { ApiVideo } from "@/lib/api"

type VideoCardProps = {
  video: ApiVideo
  rank: string
}

export function VideoCard({ video, rank }: VideoCardProps) {
  const hype = Math.round(video.hypeLevel * 100)
  const hot = hype >= 70

  return (
    <Card className="flex flex-col gap-0 overflow-hidden p-0 py-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-neutral-900">
        <Thumbnail src={video.thumbnail} alt={video.title} />
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 font-mono shadow-sm"
        >
          {rank}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-3 text-base leading-snug font-semibold tracking-tight">
          {video.title}
        </h3>
        <div className="text-muted-foreground flex items-center gap-1.5 truncate text-xs">
          <span className="text-foreground truncate font-medium">
            {video.author}
          </span>
          <span>·</span>
          <span className="whitespace-nowrap">{video.publishedRelative}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
          <div className="flex-1">
            <Progress value={hype} className="h-1.5" />
            <p className="text-muted-foreground mt-1.5 font-mono text-[10px] tracking-wider uppercase">
              hype level
            </p>
          </div>
          <div className="flex items-baseline gap-1 font-mono text-sm tabular-nums">
            <span className="font-semibold">{hype}</span>
            <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
              /100
            </span>
            <span
              className={
                "ml-1 inline-block size-1.5 rounded-full " +
                (hot
                  ? "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]"
                  : "bg-muted-foreground/50")
              }
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

import { useEffect, useState } from "react"
import { Crown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Thumbnail } from "@/components/thumbnail"
import type { ApiVideo } from "@/lib/api"

type JoyaCardProps = { video: ApiVideo }

export function JoyaCard({ video }: JoyaCardProps) {
  const target = Math.round(video.hypeLevel * 100)
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(target), 120)
    return () => clearTimeout(t)
  }, [target])

  return (
    <Card className="relative grid grid-cols-1 gap-0 overflow-hidden border-2 p-0 py-0 shadow-[0_0_0_4px_rgba(245,158,11,0.15),0_20px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-amber-400/40 lg:grid-cols-[1.2fr_1fr]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_240px_at_80%_-10%,rgba(245,158,11,0.15),transparent_60%)]" />

      <div className="relative aspect-video bg-neutral-900 lg:aspect-auto">
        <Thumbnail src={video.thumbnail} alt={video.title} />
        <Badge className="absolute top-4 left-4 gap-1.5 bg-amber-400 text-neutral-900 shadow-lg hover:bg-amber-400">
          <Crown className="size-3" />
          <span className="font-mono text-[10px] tracking-widest uppercase">
            La Joya de la Corona
          </span>
        </Badge>
      </div>

      <div className="relative flex flex-col gap-4 p-6 lg:p-8">
        <p className="font-mono text-[11px] tracking-[0.18em] text-amber-600 uppercase dark:text-amber-400">
          Ranking 01 · Edición de hoy
        </p>

        <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance lg:text-4xl">
          {video.title}
        </h2>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="text-foreground font-medium">{video.author}</span>
          <span>·</span>
          <span>{video.publishedRelative}</span>
        </div>

        <Separator />

        <div className="flex items-end justify-between gap-4">
          <div className="flex-1">
            <p className="text-muted-foreground mb-2 font-mono text-[10px] tracking-widest uppercase">
              Nivel de Hype
            </p>
            <Progress value={animated} className="h-2" />
          </div>
          <div className="flex items-baseline font-mono tabular-nums">
            <span className="text-5xl leading-none font-bold tracking-tight">
              {target}
            </span>
            <span className="text-muted-foreground ml-1 text-[10px] tracking-widest uppercase">
              /100
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

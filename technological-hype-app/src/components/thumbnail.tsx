import { useState } from "react"
import { cn } from "@/lib/utils"

type ThumbnailProps = {
  src?: string | null
  alt: string
  fallbackHue?: number
  className?: string
}

export function Thumbnail({
  src,
  alt,
  fallbackHue = 20,
  className,
}: ThumbnailProps) {
  const [errored, setErrored] = useState(false)
  const showFallback = !src || errored

  if (showFallback) {
    const a = `hsl(${fallbackHue} 45% 22%)`
    const b = `hsl(${(fallbackHue + 320) % 360} 35% 10%)`
    return (
      <div
        className={cn(
          "size-full bg-neutral-900",
          className,
        )}
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 12px, rgba(255,255,255,0) 12px 24px), linear-gradient(135deg, ${a} 0%, ${b} 100%)`,
        }}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("size-full object-cover", className)}
      onError={() => setErrored(true)}
    />
  )
}

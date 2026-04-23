import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function JoyaSkeleton() {
  return (
    <Card className="grid grid-cols-1 gap-0 overflow-hidden p-0 py-0 lg:grid-cols-[1.2fr_1fr]">
      <Skeleton className="aspect-video rounded-none lg:aspect-auto" />
      <div className="flex flex-col gap-4 p-6 lg:p-8">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/5" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      </div>
    </Card>
  )
}

export function CardSkeleton() {
  return (
    <Card className="flex flex-col gap-0 overflow-hidden p-0 py-0">
      <Skeleton className="aspect-video rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-1 h-3 w-1/2" />
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-2 w-2/3" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>
    </Card>
  )
}

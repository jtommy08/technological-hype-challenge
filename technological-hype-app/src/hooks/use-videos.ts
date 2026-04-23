import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { fetchVideos, type VideosQueryParams } from "@/lib/api"

export function useVideos(params: VideosQueryParams) {
  return useQuery({
    queryKey: ["videos", params],
    queryFn: ({ signal }) => fetchVideos(params, signal),
    placeholderData: keepPreviousData,
  })
}

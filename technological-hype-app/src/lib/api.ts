export type SortBy = "hypeLevel" | "publishedAt" | "title" | "author"
export type Order = "asc" | "desc"

export type ApiVideo = {
  id: string
  title: string
  author: string
  thumbnail: string
  publishedRelative: string
  hypeLevel: number // 0..1
  isCrownJewel: boolean
}

export type VideosMetadata = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export type VideosResponse = {
  data: ApiVideo[]
  metadata: VideosMetadata
}

export type VideosQueryParams = {
  search?: string
  sortBy?: SortBy | ""
  order?: Order | ""
  page?: number
  limit?: number
}

const API_BASE = "http://localhost:3000"

export async function fetchVideos(
  params: VideosQueryParams,
  signal?: AbortSignal,
): Promise<VideosResponse> {
  const qs = new URLSearchParams()
  if (params.search) qs.set("search", params.search)
  if (params.sortBy) qs.set("sortBy", params.sortBy)
  if (params.order) qs.set("order", params.order)
  if (params.page) qs.set("page", String(params.page))
  if (params.limit) qs.set("limit", String(params.limit))

  console.log("Fetching videos with params:", qs.toString())

  const url = `${API_BASE}/api/videos${qs.toString() ? `?${qs}` : ""}`
  const res = await fetch(url, { signal })
  if (!res.ok) {
    throw new Error(
      `API error: ${res.status} ${res.statusText} — ${url}`,
    )
  }
  return await res.json()
}

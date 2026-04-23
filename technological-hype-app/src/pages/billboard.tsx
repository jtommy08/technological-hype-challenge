import { useCallback } from "react"
import {
    AlertCircle,
    ArrowDownAZ,
    ArrowUpAZ,
    RefreshCw,
    Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { useVideos } from "@/hooks/use-videos"
import { useSearchParams } from "@/hooks/use-search-params"
import type { Order, SortBy } from "@/lib/api"
import { JoyaCard } from "@/components/joya-card"
import { VideoCard } from "@/components/video-card"
import { CardSkeleton, JoyaSkeleton } from "@/components/loading-skeletons"
import Pagination from "@/components/pagination.tsx";

const PAGE_SIZE = 9

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: "hypeLevel", label: "Hype" },
    { value: "publishedAt", label: "Publicación" },
    { value: "title", label: "Título" },
    { value: "author", label: "Autor" },
]

const VALID_SORT_BY: SortBy[] = ["hypeLevel", "publishedAt", "title", "author"]

function parseSortBy(raw: string | null): SortBy | "" {
    return raw && (VALID_SORT_BY as string[]).includes(raw) ? (raw as SortBy) : ""
}

function parseOrder(raw: string | null): Order {
    return raw === "asc" ? "asc" : "desc"
}

function parsePage(raw: string | null): number {
    const n = Number(raw ?? "1")
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
}

export default function BillboardPage() {
    const [params, setParams] = useSearchParams()

    const search = params.get("search") ?? ""
    const sortBy = parseSortBy(params.get("sortBy"))
    const order = parseOrder(params.get("order"))
    const page = parsePage(params.get("page"))

    const query = useVideos({
        search,
        sortBy,
        order: sortBy ? order : "",
        page,
        limit: PAGE_SIZE,
    })

    const patchParams = useCallback(
        (patch: Record<string, string | null>) => {
            setParams((prev) => {
                const next = new URLSearchParams(prev)
                for (const [k, v] of Object.entries(patch)) {
                    if (v === null || v === "") next.delete(k)
                    else next.set(k, v)
                }
                return next
            })
        },
        [setParams],
    )

    const setPage = useCallback(
        (nextPage: number) => {
            patchParams({ page: nextPage <= 1 ? null : String(nextPage) })
        },
        [patchParams],
    )

    const onSearchChange = (v: string) => {
        patchParams({ search: v || null, page: null })
    }

    const onSortChange = (v: SortBy | "") => {
        patchParams({
            sortBy: v || null,
            order: v ? order : null,
            page: null,
        })
    }

    const onOrderToggle = () => {
        const nextOrder: Order = order === "asc" ? "desc" : "asc"
        patchParams({ order: nextOrder, page: null })
    }

    const videos = query.data?.data ?? []
    const metadata = query.data?.metadata
    const totalPages = metadata?.totalPages ?? 1
    const total = metadata?.total ?? 0

    const joya = videos.find((v) => v.isCrownJewel)
    const rest = joya ? videos.filter((v) => v.id !== joya.id) : videos

    const today = new Date().toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })

    const isInitialLoading = query.isLoading
    const isError = query.isError
    const isEmpty = query.isSuccess && videos.length === 0
    const isSuccess = query.isSuccess && videos.length > 0

    return (
        <div className="bg-background text-foreground min-h-screen">
            <div className="mx-auto max-w-360 px-6 pt-7 pb-20 lg:px-8">
                {/* Topbar */}
                <header className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-primary-foreground grid size-10 place-items-center rounded-md text-xl font-bold">
                            H
                        </div>
                        <div>
                            <h1 className="text-xl leading-tight font-semibold tracking-tight">
                                Hype Weekly
                            </h1>
                            <p className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                                Cartelera de Conocimiento
                            </p>
                        </div>
                    </div>
                    <div className="text-muted-foreground hidden items-center gap-3 font-mono text-xs md:flex">
            <span>
                <b className="text-foreground">{total}</b> videos
            </span>
                    </div>
                </header>

                {/* Masthead */}
                <section className="grid grid-cols-1 gap-7 border-b-2 py-6 md:grid-cols-[1.4fr_1fr]">
                    <h2 className="text-4xl leading-[0.95] font-semibold tracking-tight lg:text-6xl xl:text-7xl">
                        El <span className="text-primary italic">hype</span> de esta semana,
                        colado hasta la última gota.
                    </h2>
                    <div className="flex flex-col justify-end gap-3 md:border-l md:pl-6">
                        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
                            Consumimos el endpoint{" "}
                            <code className="bg-muted rounded px-1 font-mono text-[11px]">
                                /api/videos
                            </code>{" "}
                            y renderizamos la cartelera con <b className="text-foreground">TanStack Query</b>,
                            destacando la <b className="text-foreground">Joya de la Corona</b>.
                        </p>
                        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-widest uppercase">
              <span>
                Página <b className="text-foreground">{metadata?.page ?? page}</b>/<b className="text-foreground">{totalPages}</b>
              </span>
                            <span>
                Total <b className="text-foreground">{total}</b>
              </span>
                            <span>{today}</span>
                        </div>
                    </div>
                </section>

                {/* Controls */}
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
                    <div className="relative">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Buscar por título o autor…"
                            className="pl-9"
                        />
                    </div>

                    <div className="flex items-center gap-1 rounded-md border p-1">
            <span className="text-muted-foreground px-2 font-mono text-[10px] tracking-widest uppercase">
              Ordenar
            </span>
                        {SORT_OPTIONS.map((opt) => (
                            <Button
                                key={opt.value}
                                size="sm"
                                variant={sortBy === opt.value ? "default" : "ghost"}
                                className="h-7 px-3 font-mono text-[11px]"
                                onClick={() =>
                                    onSortChange(sortBy === opt.value ? "" : opt.value)
                                }
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onOrderToggle}
                        disabled={!sortBy}
                        className="h-9 gap-2 font-mono text-[11px] uppercase"
                        aria-label={`Cambiar orden (actual: ${order})`}
                    >
                        {order === "asc" ? (
                            <ArrowUpAZ className="size-4" />
                        ) : (
                            <ArrowDownAZ className="size-4" />
                        )}
                        {order}
                    </Button>
                </div>

                <main className="mt-8 flex flex-col gap-8">
                    {isInitialLoading && <LoadingView />}
                    {isError && (
                        <ErrorView
                            error={query.error}
                            onRetry={() => query.refetch()}
                        />
                    )}
                    {isEmpty && <EmptyView search={search} />}
                    {isSuccess && (
                        <SuccessView
                            joya={joya}
                            rest={rest}
                            startRank={joya ? 2 : 1}
                            page={page}
                            totalPages={totalPages}
                            onPrev={() => setPage(Math.max(1, page - 1))}
                            onNext={() => setPage(Math.min(totalPages, page + 1))}
                            isFetching={query.isFetching}
                        />
                    )}
                </main>

                <footer className="text-muted-foreground mt-14 flex flex-wrap items-center justify-between gap-2 border-t pt-4 font-mono text-[10px] tracking-widest uppercase">
                    <span>Hype Weekly · Cartelera de Conocimiento</span>
                    <span>TanStack Query · shadcn </span>
                </footer>
            </div>
        </div>
    )
}

function SectionHead({
                         title,
                         sub,
                     }: {
    title: string
    sub: string
}) {
    return (
        <div className="flex items-baseline justify-between gap-3">
            <div>
                <h3 className="mt-0.5 text-2xl font-semibold tracking-tight">
                    {title}
                </h3>
            </div>
            <p className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                {sub}
            </p>
        </div>
    )
}

type SuccessViewProps = {
    joya: import("@/lib/api").ApiVideo | undefined
    rest: import("@/lib/api").ApiVideo[]
    startRank: number
    page: number
    totalPages: number
    onPrev: () => void
    onNext: () => void
    isFetching: boolean
}

function SuccessView({
                         joya,
                         rest,
                         startRank,
                         page,
                         totalPages,
                         onPrev,
                         onNext,
                         isFetching,
                     }: SuccessViewProps) {
    return (
        <div className={cn("flex flex-col gap-8", isFetching && "opacity-70")}>
            {joya ? (
                <section className="flex flex-col gap-3">
                    <SectionHead
                        title="La Joya de la Corona"
                        sub="isCrownJewel · destacada"
                    />
                    <JoyaCard video={joya} />
                </section>
            ) : null}

            <section className="flex flex-col gap-3">
                <SectionHead
                    title="El resto de los mortales"
                    sub={`Página ${page} de ${totalPages}`}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {rest.map((v, i) => (
                        <VideoCard
                            key={v.id}
                            video={v}
                            rank={String(i + startRank).padStart(2, "0")}
                        />
                    ))}
                </div>
            </section>

            <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={onPrev}
                onNext={onNext}
            />
        </div>
    )
}

function LoadingView() {
    return (
        <>
            <section className="flex flex-col gap-3">
                <div>
                    <p className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                        Cargando cartelera · consultando API
                    </p>
                </div>
                <JoyaSkeleton />
            </section>
            <section className="flex flex-col gap-3">
                <SectionHead
                    title="El resto de los mortales"
                    sub="Cargando…"
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </section>
        </>
    )
}

function ErrorView({
                       error,
                       onRetry,
                   }: {
    error: unknown
    onRetry: () => void
}) {
    const message =
        error instanceof Error ? error.message : "Unknown error"
    return (
        <div className="flex justify-center py-8">
            <div className="w-full max-w-2xl">
                <Alert variant="destructive" className="border-destructive/40">
                    <AlertCircle />
                    <AlertTitle>No pudimos colar el hype.</AlertTitle>
                    <AlertDescription>
                        <p>
                            No fue posible contactar la API de videos. Verifica que el
                            servidor esté corriendo en{" "}
                            <code className="bg-muted rounded px-1 font-mono text-[11px]">
                                http://localhost:3000
                            </code>{" "}
                            y vuelve a intentar.
                        </p>
                        <pre className="bg-card text-muted-foreground mt-3 w-full overflow-auto rounded-md border border-dashed p-3 font-mono text-[11px]">
              {`▸ GET /api/videos
▸ ${message}
▸ timestamp: ${new Date().toISOString()}`}
            </pre>
                        <Button size="sm" onClick={onRetry} className="mt-3">
                            <RefreshCw className="size-4" />
                            Reintentar
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    )
}

function EmptyView({ search }: { search: string }) {
    return (
        <div className="flex justify-center py-8">
            <Card className="w-full max-w-2xl p-8 text-center">
                <p className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                    Sin resultados
                </p>
                <h3 className="text-2xl font-semibold tracking-tight">
                    El colador está vacío.
                </h3>
                <p className="text-muted-foreground text-sm">
                    {search
                        ? `Ningún video coincide con "${search}".`
                        : "La API respondió pero no hay videos que mostrar."}
                </p>
            </Card>
        </div>
    )
}

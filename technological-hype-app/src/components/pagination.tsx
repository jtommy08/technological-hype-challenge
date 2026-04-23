import {Button} from "@/components/ui/button.tsx";
import {ChevronLeft, ChevronRight} from "lucide-react";

export default function Pagination({
                        page,
                        totalPages,
                        onPrev,
                        onNext,
                    }: {
    page: number
    totalPages: number
    onPrev: () => void
    onNext: () => void
}) {
    return (
        <div className="flex items-center justify-between gap-3 border-t pt-4">
            <p className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
                Página {page} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrev}
                    disabled={page <= 1}
                >
                    <ChevronLeft className="size-4" />
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onNext}
                    disabled={page >= totalPages}
                >
                    Siguiente
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    )
}
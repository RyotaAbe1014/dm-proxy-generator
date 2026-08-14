import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { MAX_CARD_FACES } from "../constants"
import type { QueuedImage } from "../types"
import { EmptyQueue } from "./empty-queue"
import { ImageQueueItem } from "./image-queue-item"

type ImageQueuePanelProps = {
  images: QueuedImage[]
  totalCardFaces: number
  onAdjustCopies: (imageId: string, delta: number) => void
}

export function ImageQueuePanel({ images, totalCardFaces, onAdjustCopies }: ImageQueuePanelProps) {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">カード一覧</CardTitle>
            <Badge variant="muted">{images.length} 件</Badge>
          </div>
          <CardDescription className="mt-1">
            各画像のコピー数を 1〜4 枚で調整できます。合計 {MAX_CARD_FACES} カード面まで。
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium text-slate-400">カード面合計</p>
          <p className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">
            {totalCardFaces}{" "}
            <span className="text-xs font-medium text-slate-400">/ {MAX_CARD_FACES} 枚</span>
          </p>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-6 sm:p-8">
        {images.length > 0 ? (
          <ul className="divide-y divide-slate-100" aria-label="追加した画像の一覧">
            {images.map((image) => (
              <ImageQueueItem
                key={image.id}
                image={image}
                totalCardFaces={totalCardFaces}
                onAdjustCopies={onAdjustCopies}
              />
            ))}
          </ul>
        ) : (
          <EmptyQueue />
        )}
      </CardContent>
    </Card>
  )
}

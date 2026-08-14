import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

import { MAX_CARD_FACES, MAX_IMAGE_COPIES } from "../constants"
import type { QueuedImage } from "../types"

type ImageQueueItemProps = {
  image: QueuedImage
  totalCardFaces: number
  onAdjustCopies: (imageId: string, delta: number) => void
}

export function ImageQueueItem({ image, totalCardFaces, onAdjustCopies }: ImageQueueItemProps) {
  return (
    <li className="flex flex-col gap-4 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
        <img
          src={image.previewUrl}
          alt={image.name}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800" title={image.name}>
          {image.name}
        </p>
        <p className="mt-1 text-xs text-slate-500">端末内で処理される画像プレビュー</p>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-start">
        <span id={`${image.id}-copies-label`} className="text-xs font-semibold text-slate-500">
          コピー数
        </span>
        <fieldset className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <legend className="sr-only">{image.name}のコピー数</legend>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-lg p-0"
            aria-label={`${image.name}のコピー数を1枚減らす（1枚のときは一覧から削除）`}
            onClick={() => onAdjustCopies(image.id, -1)}
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <span
            className="min-w-10 px-2 text-center text-sm font-bold text-slate-800"
            aria-live="polite"
          >
            {image.copies} 枚
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-lg p-0"
            aria-label={`${image.name}のコピー数を1枚増やす`}
            disabled={image.copies >= MAX_IMAGE_COPIES || totalCardFaces >= MAX_CARD_FACES}
            onClick={() => onAdjustCopies(image.id, 1)}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </fieldset>
      </div>
    </li>
  )
}

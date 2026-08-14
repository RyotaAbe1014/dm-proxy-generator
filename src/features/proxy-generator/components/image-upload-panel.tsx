import { useRef } from "react"
import type { ChangeEvent, DragEvent } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ImagePlus, Plus, UploadCloud } from "lucide-react"

import { MAX_CARD_FACES } from "../constants"
import type { Feedback } from "../types"
import { WorkflowSteps } from "./workflow-steps"

type ImageUploadPanelProps = {
  totalCardFaces: number
  isDragging: boolean
  feedback: Feedback | null
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onDragEnter: (event: DragEvent<HTMLElement>) => void
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent<HTMLElement>) => void
}

export function ImageUploadPanel({
  totalCardFaces,
  isDragging,
  feedback,
  onFileChange,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
}: ImageUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <section aria-labelledby="add-images-heading">
      <Card className="overflow-hidden border-brand-100/80 shadow-card">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
            <div className="relative p-6 sm:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <ImagePlus className="h-4 w-4" />
                    </div>
                    <h2 id="add-images-heading" className="text-base font-bold text-slate-900">
                      画像を追加
                    </h2>
                  </div>
                  <p className="mt-2 pl-10 text-xs leading-5 text-slate-500">
                    ドラッグ＆ドロップ、ファイル選択、画像のペーストに対応しています。
                  </p>
                </div>
                <Badge variant="success" className="shrink-0">
                  対応済み
                </Badge>
              </div>

              {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- The drop zone must receive drag events. */}
              <section
                className={`relative flex min-h-[180px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-6 py-8 text-center transition-colors ${
                  isDragging
                    ? "border-brand-500 bg-brand-100/70"
                    : "border-brand-200 bg-brand-50/35"
                }`}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                aria-label="画像のドロップエリア"
              >
                <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(#b8d1ff_0.7px,transparent_0.7px)] [background-size:14px_14px]" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-soft">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="relative mt-4 text-sm font-semibold text-slate-800">
                  {isDragging ? "ここにドロップ" : "ここにカード画像を追加"}
                </p>
                <p className="relative mt-1 text-xs text-slate-500">
                  ドラッグ＆ドロップ / ファイル選択 / ペースト
                </p>
                <p className="relative mt-2 text-[11px] font-medium text-slate-400">
                  カード面合計 {totalCardFaces} / {MAX_CARD_FACES} 枚
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="relative mt-5 bg-white"
                  aria-controls="image-file-input"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="h-3.5 w-3.5" />
                  画像を選択
                </Button>
                <input
                  ref={fileInputRef}
                  id="image-file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={onFileChange}
                  tabIndex={-1}
                  aria-label="画像ファイルを選択"
                />
                {feedback ? (
                  <p
                    className={`relative mt-3 text-xs font-medium ${
                      feedback.tone === "error" ? "text-rose-600" : "text-emerald-700"
                    }`}
                    role={feedback.tone === "error" ? "alert" : "status"}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {feedback.message}
                  </p>
                ) : null}
              </section>
            </div>

            <aside className="flex min-w-[240px] flex-col justify-between border-t border-slate-100 bg-slate-50/70 p-6 lg:w-64 lg:border-l lg:border-t-0">
              <WorkflowSteps />
            </aside>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

import { ArrowUpRight, FileOutput } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ProxyPdfQueueItem } from "@/lib/generate-proxy-pdf"

import { usePdfExport } from "./use-pdf-export"

type PdfExportCardProps = {
  images: ProxyPdfQueueItem[]
  totalCardFaces: number
}

export function PdfExportCard({ images, totalCardFaces }: PdfExportCardProps) {
  const { isExportingPdf, pdfExportError, handleExportPdf } = usePdfExport(images, totalCardFaces)

  return (
    <Card className="overflow-hidden border-slate-800 bg-slate-900 text-white shadow-card">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-300">
            <FileOutput className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">PDF を作成</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {totalCardFaces > 0
                ? "カードを実寸の A4 PDF に書き出せます。"
                : "画像を 1 枚以上追加すると利用できます。"}
            </p>
          </div>
        </div>
        <Button
          disabled={isExportingPdf || totalCardFaces === 0}
          variant="secondary"
          size="lg"
          className="mt-5 w-full bg-white text-slate-900 hover:bg-slate-100 disabled:bg-white/10 disabled:text-slate-500"
          onClick={handleExportPdf}
          aria-busy={isExportingPdf}
        >
          {isExportingPdf ? "PDFを作成中…" : "PDFを書き出す"}
          <ArrowUpRight className="h-4 w-4" />
        </Button>
        {isExportingPdf ? (
          <output className="mt-3 text-xs leading-5 text-slate-400" aria-live="polite">
            画像を読み込み、PDFを作成しています…
          </output>
        ) : pdfExportError ? (
          <p className="mt-3 text-xs leading-5 text-rose-300" role="alert" aria-live="assertive">
            {pdfExportError}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

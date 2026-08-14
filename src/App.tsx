import { Check, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import { ImageQueuePanel } from "./features/proxy-generator/components/image-queue-panel"
import { ImageUploadPanel } from "./features/proxy-generator/components/image-upload-panel"
import { PdfExportCard } from "./features/proxy-generator/components/pdf-export-card/pdf-export-card"
import { PrintSettingsCard } from "./features/proxy-generator/components/print-settings-card"
import { useImageQueue } from "./features/proxy-generator/use-image-queue"

function App() {
  const {
    images,
    feedback,
    isDragging,
    totalCardFaces,
    handleFileChange,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePaste,
    adjustImageCopies,
  } = useImageQueue()

  return (
    <div className="min-h-screen bg-paper text-ink" onPaste={handlePaste}>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-sky-100/50 blur-3xl" />
      </div>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="mb-8 max-w-2xl">
          <Badge>
            <Sparkles className="mr-1.5 h-3 w-3" />
            かんたん 3 ステップ
          </Badge>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
            カード画像を、<span className="text-brand-600">印刷できる形</span>に。
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            画像を追加して枚数を指定するだけ。実カードサイズに合わせた A4
            レイアウトで、プロキシを準備できます。
          </p>
        </section>

        <ImageUploadPanel
          totalCardFaces={totalCardFaces}
          isDragging={isDragging}
          feedback={feedback}
          onFileChange={handleFileChange}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <ImageQueuePanel
            images={images}
            totalCardFaces={totalCardFaces}
            onAdjustCopies={adjustImageCopies}
          />

          <div className="space-y-6">
            <PrintSettingsCard />
            <PdfExportCard images={images} totalCardFaces={totalCardFaces} />
          </div>
        </div>

        <footer className="mt-10 flex flex-col gap-2 border-t border-slate-200/70 pt-5 text-[11px] font-medium text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>カード画像は端末内でのみ扱われます。</p>
          <p className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            画像追加機能を利用できます
          </p>
        </footer>
      </main>
    </div>
  )
}

export default App
